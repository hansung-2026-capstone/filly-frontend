import type { DiaryItem } from "../types/diary";

interface CalendarCellProps {
  day: number | null;
  diary: DiaryItem | undefined;
  loading: boolean;
  dayTextClass: string;
  onClick?: (diary: DiaryItem) => void;
}

export function CalendarCell({ day, diary, loading, dayTextClass, onClick }: CalendarCellProps) {
  const clickable = !!diary && !!onClick;

  return (
    <div
      className={`border border-[var(--border-calendar)] rounded bg-[var(--bg-stats-panel)] h-full p-1 min-h-0 flex flex-col transition-all duration-150
        ${clickable ? 'cursor-pointer hover:bg-[var(--bg-editor-panel)] hover:border-[var(--border-calendar-hover)] hover:shadow-sm' : ''}`}
      onClick={() => clickable && onClick(diary)}
    >
      <span className={`text-[12px] leading-none ${dayTextClass}`}>{day}</span>
      {diary && (
        <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          {diary.mediaUrls?.[0] ? (
            <img
              src={diary.mediaUrls[0]}
              alt=""
              className="w-full h-full object-cover rounded shadow-[var(--shadow-thumbnail)]"
            />
          ) : (
            <span className="text-4xl leading-none select-none">{diary.emoji}</span>
          )}
        </div>
      )}
      {loading && !diary && day && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[var(--bg-muted-dot)] animate-pulse" />
        </div>
      )}
    </div>
  );
}
