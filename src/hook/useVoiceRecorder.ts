import { useCallback, useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording";

export type VoiceRecord = { id: number; file: File; url: string };

export function useVoiceRecorder(maxSeconds = 10) {
  const [record, setRecord] = useState<VoiceRecord | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordRef = useRef(record);
  const startTimeRef = useRef<number>(0);
  recordRef.current = record;

  useEffect(
    () => () => {
      if (recordRef.current) URL.revokeObjectURL(recordRef.current.url);
    },
    [],
  );

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];
    startTimeRef.current = Date.now();

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const durationSec = (Date.now() - startTimeRef.current) / 1000;
      stream.getTracks().forEach((t) => t.stop());

      if (durationSec > maxSeconds) {
        alert(`녹음은 최대 ${maxSeconds}초까지 가능합니다.`);
        return;
      }

      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      const url = URL.createObjectURL(blob);
      if (recordRef.current) URL.revokeObjectURL(recordRef.current.url);
      setRecord({ id: Date.now(), file, url });
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecordingState("recording");
  }, []);

  const stop = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecordingState("idle");
  }, []);

  const toggle = useCallback(() => {
    if (recordingState === "recording") stop();
    else start();
  }, [recordingState, start, stop]);

  const removeRecord = useCallback(() => {
    if (record) URL.revokeObjectURL(record.url);
    setRecord(null);
  }, [record]);

  return {
    record,
    isRecording: recordingState === "recording",
    toggle,
    removeRecord,
  };
}
