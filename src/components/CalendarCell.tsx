import type { DiaryItem } from "../api/diary";

interface CalendarCellProps {
  day: number | null;
  diary: DiaryItem | undefined;
  loading: boolean;
  dayTextClass: string;
}

export function CalendarCell({ day, diary, loading, dayTextClass }: CalendarCellProps) {
  return (
    <div className="border border-[rgba(160,140,120,0.1)] rounded bg-white/40 h-full p-1 min-h-0 flex flex-col">
      <span className={`text-[11px] leading-none ${dayTextClass}`}>{day}</span>
      {diary && (
        <div className="flex-1 flex items-center justify-center min-h-0">
          {diary.thumbnailUrl ? (
            <img src={diary.thumbnailUrl} alt="" className="w-full h-full object-cover rounded opacity-80" />
          ) : (
            <span className="text-4xl leading-none">{diary.emoji}</span>
          )}
        </div>
      )}
      {loading && !diary && day && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[rgba(160,140,120,0.2)] animate-pulse" />
        </div>
      )}
    </div>
  );
}
