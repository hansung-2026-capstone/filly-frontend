import { useCallback, useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording";

export type VoiceRecord = {
  id: number;
  file: File;
  url: string;
  durationSeconds: number;
};

type WindowWithWebkitAudioContext = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export const VOICE_RECORDING_MAX_SECONDS = 60;
const WAV_SAMPLE_RATE = 16000;
const WAV_CHANNEL_COUNT = 1;
const WAV_BYTES_PER_SAMPLE = 2;

export function formatVoiceRecordingDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes}분 ${remainingSeconds}초`;
  }
  if (minutes > 0) return `${minutes}분`;
  return `${remainingSeconds}초`;
}

function getRecorderErrorMessage(error: unknown) {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "알 수 없는 이유로 마이크를 사용할 수 없어요. 브라우저와 마이크 권한 설정을 확인해주세요.";
  }

  if (typeof window === "undefined" || !getAudioContextClass()) {
    return "이 브라우저에서는 음성 녹음 저장을 지원하지 않아요.";
  }

  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "마이크 권한이 거부됐어요. 브라우저 설정에서 마이크 권한을 허용해주세요.";
    }
    if (error.name === "NotFoundError") {
      return "사용 가능한 마이크를 찾을 수 없어요.";
    }
  }

  return "알 수 없는 이유로 녹음을 시작하지 못했어요. 마이크 권한과 브라우저 설정을 확인해주세요.";
}

function getAudioContextClass() {
  if (typeof window === "undefined") return null;
  const audioWindow = window as WindowWithWebkitAudioContext;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function mergeAudioChunks(chunks: Float32Array[]) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function resampleAudio(
  samples: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number,
) {
  if (sourceSampleRate === targetSampleRate) return samples;

  const ratio = sourceSampleRate / targetSampleRate;
  const newLength = Math.round(samples.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i += 1) {
    const sourceIndex = i * ratio;
    const before = Math.floor(sourceIndex);
    const after = Math.min(before + 1, samples.length - 1);
    const weight = sourceIndex - before;
    result[i] = samples[before] * (1 - weight) + samples[after] * weight;
  }

  return result;
}

function encodeWav(samples: Float32Array, sampleRate: number) {
  const dataSize = samples.length * WAV_BYTES_PER_SAMPLE;
  const byteRate = sampleRate * WAV_CHANNEL_COUNT * WAV_BYTES_PER_SAMPLE;
  const blockAlign = WAV_CHANNEL_COUNT * WAV_BYTES_PER_SAMPLE;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, WAV_CHANNEL_COUNT, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 8 * WAV_BYTES_PER_SAMPLE, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  samples.forEach((sample) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += WAV_BYTES_PER_SAMPLE;
  });

  return buffer;
}

function createWavFile(chunks: Float32Array[], sampleRate: number) {
  const samples = resampleAudio(
    mergeAudioChunks(chunks),
    sampleRate,
    WAV_SAMPLE_RATE,
  );
  const wavBuffer = encodeWav(samples, WAV_SAMPLE_RATE);
  return new File([wavBuffer], `recording-${Date.now()}.wav`, {
    type: "audio/wav",
  });
}

export function useVoiceRecorder(maxSeconds = VOICE_RECORDING_MAX_SECONDS) {
  const [record, setRecord] = useState<VoiceRecord | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const recordRef = useRef(record);
  const recordingStateRef = useRef(recordingState);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  useEffect(
    () => () => {
      if (recordRef.current) URL.revokeObjectURL(recordRef.current.url);
    },
    [],
  );

  const start = useCallback(async () => {
    setErrorMessage(null);

    try {
      const AudioContextClass = getAudioContextClass();
      if (!AudioContextClass) throw new Error("AudioContext is not supported");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContextClass();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      audioContextRef.current = audioContext;
      processorRef.current = processor;
      sourceRef.current = source;
      streamRef.current = stream;

      processor.onaudioprocess = (event: AudioProcessingEvent) => {
        const input = event.inputBuffer.getChannelData(0);
        const output = event.outputBuffer.getChannelData(0);
        audioChunksRef.current.push(new Float32Array(input));
        output.fill(0);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      recordingStateRef.current = "recording";
      setRecordingState("recording");
    } catch (error) {
      recordingStateRef.current = "idle";
      setRecordingState("idle");
      setErrorMessage(getRecorderErrorMessage(error));
    }
  }, []);

  const stop = useCallback(() => {
    const durationSec = Math.max(0, (Date.now() - startTimeRef.current) / 1000);
    const audioContext = audioContextRef.current;
    const processor = processorRef.current;
    const source = sourceRef.current;
    const stream = streamRef.current;

    processor?.disconnect();
    source?.disconnect();
    stream?.getTracks().forEach((track) => track.stop());
    void audioContext?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
    recordingStateRef.current = "idle";
    setRecordingState("idle");

    if (durationSec > maxSeconds) {
      setErrorMessage(
        `녹음은 최대 ${formatVoiceRecordingDuration(maxSeconds)}까지 가능합니다.`,
      );
      audioChunksRef.current = [];
      return;
    }

    if (!audioContext || audioChunksRef.current.length === 0) return;

    const file = createWavFile(audioChunksRef.current, audioContext.sampleRate);
    const url = URL.createObjectURL(file);
    if (recordRef.current) URL.revokeObjectURL(recordRef.current.url);
    setRecord({ id: Date.now(), file, url, durationSeconds: durationSec });
    audioChunksRef.current = [];
  }, [maxSeconds]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && recordingStateRef.current === "recording") {
        stop();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (recordingStateRef.current === "recording") stop();
    };
  }, [stop]);

  const toggle = useCallback(() => {
    if (recordingState === "recording") stop();
    else void start();
  }, [recordingState, start, stop]);

  const removeRecord = useCallback(() => {
    if (record) URL.revokeObjectURL(record.url);
    setRecord(null);
    setErrorMessage(null);
  }, [record]);

  return {
    record,
    isRecording: recordingState === "recording",
    errorMessage,
    toggle,
    removeRecord,
  };
}
