import { useCallback, useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording";

export type VoiceRecord = {
  id: number;
  file: File;
  url: string;
  durationSeconds: number;
};

type RecorderFormat = { mimeType: string; extension: string };

export const VOICE_RECORDING_MAX_SECONDS = 60;

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

const RECORDER_FORMATS: RecorderFormat[] = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4", extension: "m4a" },
  { mimeType: "audio/mpeg", extension: "mp3" },
];

function getSupportedRecorderFormat() {
  if (typeof MediaRecorder === "undefined") return null;
  return (
    RECORDER_FORMATS.find((format) =>
      MediaRecorder.isTypeSupported(format.mimeType),
    ) ?? null
  );
}

function getRecorderErrorMessage(error: unknown) {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return "알 수 없는 이유로 마이크를 사용할 수 없어요. 브라우저와 마이크 권한 설정을 확인해주세요.";
  }

  if (typeof MediaRecorder === "undefined") {
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

export function useVoiceRecorder(maxSeconds = VOICE_RECORDING_MAX_SECONDS) {
  const [record, setRecord] = useState<VoiceRecord | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordRef = useRef(record);
  const startTimeRef = useRef<number>(0);
  const formatRef = useRef<RecorderFormat | null>(null);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(
    () => () => {
      if (recordRef.current) URL.revokeObjectURL(recordRef.current.url);
    },
    [],
  );

  const start = useCallback(async () => {
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const format = getSupportedRecorderFormat();
      const mediaRecorder = format
        ? new MediaRecorder(stream, { mimeType: format.mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      startTimeRef.current = Date.now();
      formatRef.current = format;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const durationSec = Math.max(
          0,
          (Date.now() - startTimeRef.current) / 1000,
        );
        stream.getTracks().forEach((t) => t.stop());

        if (durationSec > maxSeconds) {
          setErrorMessage(
            `녹음은 최대 ${formatVoiceRecordingDuration(maxSeconds)}까지 가능합니다.`,
          );
          return;
        }

        const recorderFormat = formatRef.current;
        const mimeType = recorderFormat?.mimeType || mediaRecorder.mimeType || "audio/webm";
        const extension = recorderFormat?.extension || "webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording-${Date.now()}.${extension}`, {
          type: mimeType,
        });
        const url = URL.createObjectURL(blob);
        if (recordRef.current) URL.revokeObjectURL(recordRef.current.url);
        setRecord({ id: Date.now(), file, url, durationSeconds: durationSec });
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState("recording");
    } catch (error) {
      setRecordingState("idle");
      setErrorMessage(getRecorderErrorMessage(error));
    }
  }, [maxSeconds]);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecordingState("idle");
  }, []);

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
