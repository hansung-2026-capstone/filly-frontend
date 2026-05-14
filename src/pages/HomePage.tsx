import { ChevronDown, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCell } from "../components/CalendarCell";
import { DiaryDetailModal } from "../components/DiaryDetailModal";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { UserAvatar } from "../components/UserAvatar";
import { useMonthlyDiaries } from "../hook/common/useMonthlyDiaries";
import { useCurrentUser } from "../hook/common/useCurrentUser";
import {
  formatDateKeyFromParts,
  getWeeksInMonth,
  MONTHS,
  WEEK_DAYS_LONG,
  WEEK_DAYS_SHORT,
} from "../lib/date";
import type { DiaryItem } from "../types/diary";

interface CalendarColumnProps {
  columnCount: 3 | 4;
  currentMonth: number;
  currentYear: number;
  dayOffset: number;
  diaries: Record<string, DiaryItem>;
  loading: boolean;
  onDiarySelect: (diary: DiaryItem) => void;
  weeks: (number | null)[][];
}

function getDayTextClass(dayIndex: number) {
  if (dayIndex === 0) return "text-[var(--text-weekend-sun)]";
  if (dayIndex === 6) return "text-[var(--text-weekend-sat)]";
  return "text-text-muted";
}

function getHeaderTextClass(dayIndex: number) {
  if (dayIndex === 0) return "text-[var(--text-weekend-sun-soft)]";
  if (dayIndex === 6) return "text-[var(--text-weekend-sat-soft)]";
  return "text-[var(--text-soft-label)]";
}

function CalendarColumn({
  columnCount,
  currentMonth,
  currentYear,
  dayOffset,
  diaries,
  loading,
  onDiarySelect,
  weeks,
}: CalendarColumnProps) {
  const widthClass = columnCount === 3 ? "w-[370px] pl-3 pr-4" : "w-[500px] pl-4 pr-[26px]";
  const gridClass = columnCount === 3 ? "grid-cols-3" : "grid-cols-4";
  const visibleDays = WEEK_DAYS_SHORT.slice(dayOffset, dayOffset + columnCount);
  const visibleDayLabels = WEEK_DAYS_LONG.slice(dayOffset, dayOffset + columnCount);

  return (
    <div className={`${widthClass} flex flex-col pt-10 pb-8 shrink-0`}>
      <div className={`${gridClass} grid text-center pb-2 mb-2 border-b border-[var(--border-calendar)]`}>
        {visibleDays.map((day, index) => {
          const dayIndex = dayOffset + index;
          const fullDayLabel = visibleDayLabels[index];
          return (
            <span
              key={day}
              aria-label={fullDayLabel}
              title={fullDayLabel}
              className={`block rounded-md py-1 text-[13px] font-bold leading-none tracking-[1.5px] ${getHeaderTextClass(dayIndex)}`}
            >
              {day}
            </span>
          );
        })}
      </div>
      <div className={`${gridClass} flex-1 grid grid-rows-6 gap-1.5 h-full min-h-0`}>
        {weeks.map((week, weekIndex) =>
          week.slice(dayOffset, dayOffset + columnCount).map((day, index) => {
            const dayIndex = dayOffset + index;
            const diaryKey = day
              ? formatDateKeyFromParts(currentYear, currentMonth, day)
              : null;

            return (
              <CalendarCell
                key={`${dayOffset}-${weekIndex}-${index}`}
                day={day}
                diary={diaryKey ? diaries[diaryKey] : undefined}
                loading={loading}
                dayTextClass={getDayTextClass(dayIndex)}
                onClick={onDiarySelect}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}

export function HomePage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const today = new Date().getDate();
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryItem | null>(null);
  const navigate = useNavigate();
  const weeks = getWeeksInMonth(currentYear, currentMonth);
  const { diaries, loading, refetch } = useMonthlyDiaries(currentYear, currentMonth);
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const handleMonthSelect = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="w-full h-full flex font-['Nanum_Myeongjo'] bg-transparent overflow-hidden">
      <div className="w-[129px] h-full flex flex-col border-r border-[var(--border-subtle)]">
        <div className="h-[30%] w-full flex flex-col items-center justify-center gap-2 border-b border-[var(--border-subtle)] px-2">
          <button
            onClick={() => setShowMonthModal(true)}
            className="w-full rounded-xl overflow-hidden bg-[var(--bg-hover-soft)] p-0 flex flex-col items-stretch
              border-none cursor-pointer transition-all duration-300 hover:shadow-sm group"
          >
            <div className="relative w-full bg-[var(--login-logo-bg)] py-2.5 flex items-center justify-center">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/35" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/35" />
              <span className="text-[12px] font-bold tracking-[2px] text-white/95 uppercase">
                {MONTHS[currentMonth - 1].name}
              </span>
            </div>
            <div className="relative w-full flex flex-col items-center justify-center min-h-[72px] pt-0 pb-2">
              <span className="text-[28px] font-light leading-none tracking-tighter text-text-stronger">
                {String(today).padStart(2, "0")}
              </span>
              <ChevronDown
                className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-[var(--text-control-muted)] group-hover:text-[var(--text-dark)] transition-colors duration-300"
              />
            </div>
          </button>

          <div className="w-full flex gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="flex-1 rounded-lg bg-[var(--bg-hover-soft)] py-2 flex items-center justify-center gap-1
                border-none cursor-pointer text-[10px] tracking-[1px] text-[var(--text-control-muted)]
                hover:bg-bg-control-hover hover:text-[var(--text-dark)] transition-all"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>이전</span>
            </button>
            <button
              onClick={handleNextMonth}
              className="flex-1 rounded-lg bg-[var(--bg-hover-soft)] py-2 flex items-center justify-center gap-1
                border-none cursor-pointer text-[10px] tracking-[1px] text-[var(--text-control-muted)]
                hover:bg-bg-control-hover hover:text-[var(--text-dark)] transition-all"
            >
              <span>다음</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-5 px-2 gap-2 border-b border-border-light">
          <UserAvatar avatarUrl={user?.currentAvatarUrl ?? null} className="w-25 h-25" />
          <div className="w-full px-2 py-2 text-center text-[15px] font-bold tracking-[1px] text-text-stronger font-['Nanum_Myeongjo']">
            {userLoading ? "···" : user?.nickname ?? "이름 없음"}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-stretch py-3.5 px-2.5">
          <button
            onClick={() => navigate("/write")}
            className="mt-auto flex items-center justify-center gap-1.5 py-2 px-2.5 border-none bg-bg-hover rounded-lg
              cursor-pointer text-[11px] text-text-muted hover:bg-[var(--bg-hover-medium)] transition-all"
          >
            <Pencil className="w-[15px] h-[15px] text-[var(--text-pencil-muted)]" />
            <span>기본 작성</span>
          </button>
        </div>
      </div>

      <CalendarColumn
        columnCount={3}
        currentMonth={currentMonth}
        currentYear={currentYear}
        dayOffset={0}
        diaries={diaries}
        loading={loading}
        onDiarySelect={setSelectedDiary}
        weeks={weeks}
      />
      <CalendarColumn
        columnCount={4}
        currentMonth={currentMonth}
        currentYear={currentYear}
        dayOffset={3}
        diaries={diaries}
        loading={loading}
        onDiarySelect={setSelectedDiary}
        weeks={weeks}
      />

      <MonthPickerModal
        isOpen={showMonthModal}
        selectedYear={currentYear}
        selectedMonth={currentMonth}
        onSelect={handleMonthSelect}
        onClose={() => setShowMonthModal(false)}
      />
      {selectedDiary && (
        <DiaryDetailModal
          diary={selectedDiary}
          onClose={() => setSelectedDiary(null)}
          onDeleted={() => {
            setSelectedDiary(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
