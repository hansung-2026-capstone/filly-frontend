import type { DiaryItem } from "../types/diary";

interface CalendarCellProps {
  day: number | null;
  diary: DiaryItem | undefined;
  loading: boolean;
  dayTextClass: string;
  isToday?: boolean;
  onClick?: (diary: DiaryItem) => void;
}

export function CalendarCell({ day, diary, loading, dayTextClass, isToday = false, onClick }: CalendarCellProps) {
  const clickable = !!diary && !!onClick;

  return (
    <div
      className={`border border-[var(--border-calendar)] rounded bg-[var(--bg-stats-panel)] h-full p-1 min-h-0 flex flex-col transition-all duration-150
        ${clickable ? 'cursor-pointer hover:bg-[var(--bg-editor-panel)] hover:border-[var(--border-calendar-hover)] hover:shadow-sm' : ''}`}
      onClick={() => clickable && onClick(diary)}
    >
      <div className="flex items-center gap-1">
        <span className={`text-[12px] leading-none ${dayTextClass}`}>{day}</span>
        {isToday && day && (
          <span className="text-[14px] leading-none text-[var(--star-filled)]" aria-hidden="true">
            ★
          </span>
        )}
      </div>
      {diary && (
        <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
          {diary.mediaUrls?.[0] ? (
            <div className="size-8 overflow-hidden rounded shadow-[var(--shadow-thumbnail)] sm:size-9 md:size-16">
              <img
                src={diary.mediaUrls[0]}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <span className="text-2xl leading-none select-none sm:text-3xl md:text-4xl">{diary.emoji}</span>
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
