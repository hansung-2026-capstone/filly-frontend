import { ChevronDown, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AvatarPreviewModal } from "../components/AvatarPreviewModal";
import { CalendarCell } from "../components/CalendarCell";
import { DiaryDetailModal } from "../components/DiaryDetailModal";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { UserAvatar } from "../components/UserAvatar";
import { useMonthlyDiaries } from "../hook/common/useMonthlyDiaries";
import { useCurrentUser } from "../hook/common/useCurrentUser";
import {
  formatDateKeyFromParts,
  getWeeksInMonth,
  isFutureMonth,
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
    <div className={`${widthClass} hidden md:flex flex-col pt-10 pb-8 shrink-0`}>
      <div className={`${gridClass} grid text-center pb-2 mb-2 border-b border-[var(--border-calendar)]`}>
        {visibleDays.map((day, index) => {
          const dayIndex = dayOffset + index;
          const fullDayLabel = visibleDayLabels[index];
          return (
            <span
              key={day}
              aria-label={fullDayLabel}
              title={fullDayLabel}
              className={`block rounded-md py-1 text-[14px] font-bold leading-none tracking-[1.5px] ${getHeaderTextClass(dayIndex)}`}
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

function MobileCalendarGrid({
  currentMonth,
  currentYear,
  diaries,
  loading,
  onDiarySelect,
  weeks,
}: Omit<CalendarColumnProps, "columnCount" | "dayOffset">) {
  return (
    <div className="flex flex-col gap-2 px-3 pb-4 md:hidden">
      <div className="grid grid-cols-7 border-b border-[var(--border-calendar)] pb-2 text-center">
        {WEEK_DAYS_SHORT.map((day, dayIndex) => (
          <span
            key={day}
            className={`py-1 text-[11px] font-bold leading-none tracking-[1px] ${getHeaderTextClass(dayIndex)}`}
          >
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 gap-1.5">
        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const diaryKey = day
              ? formatDateKeyFromParts(currentYear, currentMonth, day)
              : null;

            return (
              <div key={`${weekIndex}-${dayIndex}`} className="min-h-[46px]">
                <CalendarCell
                  day={day}
                  diary={diaryKey ? diaries[diaryKey] : undefined}
                  loading={loading}
                  dayTextClass={getDayTextClass(dayIndex)}
                  onClick={onDiarySelect}
                />
              </div>
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
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryItem | null>(null);
  const navigate = useNavigate();
  const weeks = getWeeksInMonth(currentYear, currentMonth);
  const nextMonth = currentMonth === 12
    ? { year: currentYear + 1, month: 1 }
    : { year: currentYear, month: currentMonth + 1 };
  const nextMonthDisabled = isFutureMonth(nextMonth.year, nextMonth.month);
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
    if (nextMonthDisabled) return;

    setCurrentYear(nextMonth.year);
    setCurrentMonth(nextMonth.month);
  };

  return (
    <div className="flex h-auto w-full flex-col bg-transparent font-['Nanum_Myeongjo'] md:h-full md:flex-row md:overflow-hidden">
      <div className="flex h-auto w-full flex-col border-b border-[var(--border-subtle)] md:h-full md:w-[129px] md:border-b-0 md:border-r">
        <div className="flex h-auto w-full flex-col items-center justify-center gap-2 border-b border-[var(--border-subtle)] px-3 py-3 md:h-[30%] md:px-2 md:py-0">
          <button
            onClick={() => setShowMonthModal(true)}
            className="w-full rounded-xl overflow-hidden bg-[var(--bg-hover-soft)] p-0 flex flex-col items-stretch
              border-none cursor-pointer transition-all duration-300 hover:shadow-sm group"
          >
            <div className="relative w-full bg-[var(--login-logo-bg)] py-2.5 flex items-center justify-center">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/35" />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/35" />
              <span className="text-[13px] font-bold tracking-[2px] text-white/95 uppercase">
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
                border-none cursor-pointer text-[11px] tracking-[1px] text-[var(--text-control-muted)]
                hover:bg-bg-control-hover hover:text-[var(--text-dark)] transition-all"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>이전</span>
            </button>
            <button
              onClick={handleNextMonth}
              disabled={nextMonthDisabled}
              aria-disabled={nextMonthDisabled}
              className="flex-1 rounded-lg bg-[var(--bg-hover-soft)] py-2 flex items-center justify-center gap-1
                border-none cursor-pointer text-[11px] tracking-[1px] text-[var(--text-control-muted)]
                hover:bg-bg-control-hover hover:text-[var(--text-dark)] transition-all
                disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[var(--bg-hover-soft)] disabled:hover:text-[var(--text-control-muted)]"
            >
              <span>다음</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 border-b border-border-light px-3 py-3 md:flex-col md:gap-2 md:px-2 md:py-5">
          <button
            onClick={() => setShowAvatarModal(true)}
            className="border-none bg-transparent p-0 cursor-pointer rounded-full transition-all duration-200 hover:opacity-85"
          >
            <UserAvatar avatarUrl={user?.currentAvatarUrl ?? null} className="w-25 h-25" />
          </button>
          <div className="min-w-0 flex-1 px-2 py-2 text-left font-['Nanum_Myeongjo'] text-[16px] font-bold tracking-[1px] text-text-stronger md:w-full md:flex-none md:text-center">
            {userLoading ? "···" : user?.nickname ?? "이름 없음"}
          </div>
        </div>

        <div className="flex flex-col items-stretch px-3 py-3 md:flex-1 md:px-2.5 md:py-3.5">
          <button
            onClick={() => navigate("/write")}
            className="flex items-center justify-center gap-1.5 rounded-lg border-none bg-bg-hover px-2.5 py-2 md:mt-auto
              cursor-pointer text-[12px] text-text-muted hover:bg-[var(--bg-hover-medium)] transition-all"
          >
            <Pencil className="w-[15px] h-[15px] text-[var(--text-pencil-muted)]" />
            <span>일기 작성</span>
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
      <MobileCalendarGrid
        currentMonth={currentMonth}
        currentYear={currentYear}
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
      <AvatarPreviewModal
        isOpen={showAvatarModal}
        avatarUrl={user?.currentAvatarUrl ?? null}
        onClose={() => setShowAvatarModal(false)}
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
