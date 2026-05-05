import { ChevronDown, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/user";
import { CalendarCell } from "../components/CalendarCell";
import { DiaryDetailModal } from "../components/DiaryDetailModal";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { NicknameEditor } from "../components/NicknameEditor";
import { useMonthlyDiaries } from "../hook/useMonthlyDiaries";
import {
  formatDateKeyFromParts,
  getWeeksInMonth,
  MONTHS,
  WEEK_DAYS_SHORT,
} from "../lib/date";
import type { DiaryItem } from "../api/diary";

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

  return (
    <div className={`${widthClass} flex flex-col pt-10 pb-8 shrink-0`}>
      <div className={`${gridClass} grid text-center pb-2 mb-2 border-b border-[var(--border-calendar)]`}>
        {visibleDays.map((day, index) => {
          const dayIndex = dayOffset + index;
          return (
            <span key={day} className={`text-[10px] tracking-[1.5px] ${getHeaderTextClass(dayIndex)}`}>
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
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryItem | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  const weeks = getWeeksInMonth(currentYear, currentMonth);
  const { diaries, loading, refetch } = useMonthlyDiaries(currentYear, currentMonth);

  useEffect(() => {
    getMe()
      .then((user) => setProfileImageUrl(user.currentAvatarUrl))
      .catch(() => setProfileImageUrl(null));
  }, []);

  const handleMonthSelect = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  return (
    <div className="w-full h-full flex font-['Nanum_Myeongjo'] bg-transparent overflow-hidden">
      <div className="w-[129px] h-full flex flex-col border-r border-[var(--border-subtle)]">
        <button
          onClick={() => setShowMonthModal(true)}
          className="h-[30%] w-full flex flex-col items-center justify-center gap-1 border-b border-[var(--border-subtle)]
            bg-transparent cursor-pointer transition-all duration-300 hover:bg-bg-hover group relative"
        >
          <div className="text-[11px] font-medium tracking-[3px] pl-[3px] text-text-soft uppercase">
            {currentYear}
          </div>

          <div className="text-[46px] font-light tracking-tighter text-text-stronger leading-none my-1">
            {String(currentMonth).padStart(2, "0")}
          </div>

          <div className="flex flex-col items-center gap-1 mt-1">
            <div className="text-[12px] font-bold tracking-[2px] text-text-control uppercase transition-colors group-hover:text-[var(--text-dark)]">
              {MONTHS[currentMonth - 1].name}
            </div>
            <div className="bg-[var(--bg-hover-soft)] rounded-full p-1 group-hover:bg-bg-control-hover transition-all duration-300">
              <ChevronDown
                className="w-5 h-5 text-[var(--text-control-muted)] transition-all duration-300
                  group-hover:text-[var(--text-dark)] group-hover:translate-y-0.5"
              />
            </div>
          </div>

          <div className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] text-[var(--text-control-muted)] font-bold tracking-widest">월 선택</span>
          </div>
        </button>

        <div className="flex flex-col items-center justify-center py-5 px-2 gap-2 border-b border-border-light">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--border-avatar)] shadow-sm bg-bg-hover flex items-center justify-center">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="프로필 이미지"
                className="w-full h-full object-cover"
                onError={() => setProfileImageUrl(null)}
              />
            ) : (
              <span className="text-[22px] text-[var(--text-muted-light)]">👤</span>
            )}
          </div>
          <NicknameEditor />
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
