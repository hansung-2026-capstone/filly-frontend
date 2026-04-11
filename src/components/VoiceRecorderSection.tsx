import { Mic, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { VoiceRecord } from "../hook/useVoiceRecorder";

interface VoiceRecorderSectionProps {
  title?: string;
  record: VoiceRecord | null;
  isRecording: boolean;
  onToggle: () => void;
  onRemove: () => void;
  maxSeconds?: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}초`;
}

function MiniPlayer({ url, onRemove }: { url: string; onRemove: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative overflow-visible flex-1 min-w-0 h-[67px] bg-[rgba(240,235,225,0.6)] rounded-lg border border-[rgba(160,140,120,0.2)] flex items-center gap-3 px-4">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* 재생/일시정지 버튼 */}
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[rgba(100,80,60,0.15)] hover:bg-[rgba(100,80,60,0.25)] transition-colors"
      >
        {isPlaying ? (
          <Pause
            className="w-4 h-4 text-[rgba(80,60,40,0.8)]"
            strokeWidth={2}
          />
        ) : (
          <Play className="w-4 h-4 text-[rgba(80,60,40,0.8)]" strokeWidth={2} />
        )}
      </button>

      {/* 스크러버 + 시간 (가로 배치) */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={currentTime}
          onChange={(e) => {
            const t = Number(e.target.value);
            if (audioRef.current) audioRef.current.currentTime = t;
            setCurrentTime(t);
          }}
          className="flex-1 min-w-0 h-1 accent-[rgba(100,80,60,0.7)] cursor-pointer"
        />
        <span className="text-[11px] text-[rgba(80,60,40,0.6)] tabular-nums flex-shrink-0">
          {formatTime(currentTime)}/{formatTime(duration)}
        </span>
      </div>

      {/* X 버튼 */}
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[rgba(80,60,40,0.85)]
          border-2 border-[#faf6ed] flex items-center justify-center
          text-white cursor-pointer transition-all duration-150 hover:bg-[rgba(60,40,20,0.95)]
          shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
      >
        <X className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function VoiceRecorderSection({
  title = "음성 녹음",
  record,
  isRecording,
  onToggle,
  onRemove,
  maxSeconds = 10,
}: VoiceRecorderSectionProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
          {title}
        </h3>
        <span className="text-[11px] text-[rgba(120,100,80,0.4)]">
          최대 {maxSeconds}초
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-visible">
        <button
          onClick={onToggle}
          className={`w-[67px] h-[67px] flex-shrink-0 rounded-lg border-2 cursor-pointer
            flex items-center justify-center transition-all duration-150
            ${
              isRecording
                ? "bg-[rgba(200,60,60,0.15)] border-[rgba(200,60,60,0.4)] border-solid"
                : "bg-[rgba(220,200,185,0.4)] border-[rgba(160,140,120,0.25)] border-dashed hover:bg-[rgba(220,200,185,0.6)]"
            }`}
        >
          <Mic
            className={`w-7 h-7 transition-colors duration-150 ${
              isRecording
                ? "text-[rgba(200,60,60,0.8)]"
                : "text-[rgba(100,80,60,0.6)]"
            }`}
            strokeWidth={2}
          />
        </button>

        {isRecording && (
          <span className="text-xs text-[rgba(200,60,60,0.7)] animate-pulse">
            녹음 중... {elapsed}초
          </span>
        )}

        {record && !isRecording && (
          <MiniPlayer url={record.url} onRemove={onRemove} />
        )}
      </div>
    </div>
  );
}
