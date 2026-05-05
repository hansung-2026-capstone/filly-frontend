import { useEffect, useState } from "react";
import { Pencil, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NicknameEditor } from "../components/NicknameEditor"

import { useMonthlyDiaries } from "../hook/useMonthlyDiaries"
import { CalendarCell } from "../components/CalendarCell"
import { DiaryDetailModal } from "../components/DiaryDetailModal"
import { MonthPickerModal } from "../components/MonthPickerModal"
import type { DiaryItem } from "../api/diary"
import { getMe } from "../api/user";

const months = [
  { num: 1, name: 'JANUARY' },
  { num: 2, name: 'FEBRUARY' },
  { num: 3, name: 'MARCH' },
  { num: 4, name: 'APRIL' },
  { num: 5, name: 'MAY' },
  { num: 6, name: 'JUNE' },
  { num: 7, name: 'JULY' },
  { num: 8, name: 'AUGUST' },
  { num: 9, name: 'SEPTEMBER' },
  { num: 10, name: 'OCTOBER' },
  { num: 11, name: 'NOVEMBER' },
  { num: 12, name: 'DECEMBER' },
];

// day 숫자 → "YYYY-MM-DD" 키
const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

// 달력 주(週) 계산
const getWeeksInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  // const allDays = Array.from({ length: firstDay }, () => null).concat(
  //   Array.from({ length: days }, (_, i) => i + 1)
  // );

  // Create an array with leading nulls for empty days, followed by day numbers
  const allDays: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const rows = [];
  for (let i = 0; i < allDays.length; i += 7) {
    rows.push(allDays.slice(i, i + 7));
  }
  return rows;
};

export function HomePage() {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState<DiaryItem | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  const weeks = getWeeksInMonth(currentYear, currentMonth);
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

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
        {/* 사이드바 */}
        <div className="w-[129px] h-full flex flex-col border-r border-[rgba(160,140,120,0.15)]">
          {/* 월 버튼 영역 */}
          <button
            onClick={() => setShowMonthModal(true)}
            className="h-[30%] w-full flex flex-col items-center justify-center gap-1 border-b border-[rgba(160,140,120,0.15)]
              bg-transparent cursor-pointer transition-all duration-300 hover:bg-bg-hover group relative"
          >
            <div className="text-[11px] font-medium tracking-[3px] pl-[3px] text-[rgba(120,105,85,0.6)] uppercase">
              {currentYear}
            </div>

            <div className="text-[46px] font-light tracking-tighter text-[rgba(60,45,30,0.95)] leading-none my-1">
              {String(currentMonth).padStart(2, '0')}
            </div>

            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="text-[12px] font-bold tracking-[2px] text-[rgba(80,65,50,0.9)] uppercase transition-colors group-hover:text-[rgba(40,30,20,1)]">
                {months[currentMonth - 1].name}
              </div>
              <div className="bg-[rgba(160,140,120,0.15)] rounded-full p-1 group-hover:bg-[rgba(160,140,120,0.25)] transition-all duration-300">
                <ChevronDown
                  className="w-5 h-5 text-[rgba(80,65,50,0.8)] transition-all duration-300
                    group-hover:text-[rgba(40,30,20,1)] group-hover:translate-y-0.5"
                />
              </div>
            </div>

            <div className="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-[10px] text-[rgba(160,140,120,0.8)] font-bold tracking-widest">월 선택</span>
            </div>
          </button>

          {/* 프로필 섹션 */}
          <div className="flex flex-col items-center justify-center py-5 px-2 gap-2 border-b border-border-light">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[rgba(200,185,165,0.5)] shadow-sm bg-bg-hover flex items-center justify-center">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                  onError={() => setProfileImageUrl(null)}
                />
              ) : (
                <span className="text-[22px] text-[rgba(120,105,85,0.55)]">👤</span>
              )}
            </div>
            <NicknameEditor />
          </div>

          {/* 하단 작성 버튼 */}
          <div className="flex-1 flex flex-col items-stretch py-3.5 px-2.5">
            <button
              onClick={() => navigate('/write')}
              className="mt-auto flex items-center justify-center gap-1.5 py-2 px-2.5 border-none bg-bg-hover rounded-lg
                cursor-pointer text-[11px] text-[rgba(80,60,40,0.65)] hover:bg-[rgba(160,140,120,0.16)] transition-all"
            >
              <Pencil className="w-[15px] h-[15px] text-[rgba(140,120,90,0.5)]" />
              <span>기본 작성</span>
            </button>
          </div>
        </div>

        {/* 달력 영역 (370px - 일, 월, 화) */}
        <div className="w-[370px] flex flex-col pl-3 pr-4 pt-10 pb-8 shrink-0">
          <div className="grid grid-cols-3 text-center pb-2 mb-2 border-b border-[rgba(160,140,120,0.1)]">
            {daysOfWeek.slice(0, 3).map((day, i) => (
              <span key={day} className={`text-[10px] tracking-[1.5px] ${i === 0 ? 'text-[rgba(185,75,65,0.5)]' : 'text-[rgba(120,105,85,0.5)]'}`}>
                {day}
              </span>
            ))}
          </div>
          <div className="flex-1 grid grid-cols-3 grid-rows-6 gap-1.5 h-full min-h-0">
            {weeks.map((week, weekIdx) =>
              week.slice(0, 3).map((day, i) => (
                <CalendarCell
                  key={`l-${weekIdx}-${i}`}
                  day={day}
                  diary={day ? diaries[toDateKey(currentYear, currentMonth, day)] : undefined}
                  loading={loading}
                  dayTextClass={i === 0 ? 'text-[rgba(185,75,65,0.6)]' : 'text-[rgba(60,45,30,0.6)]'}
                  onClick={setSelectedDiary}
                />
              ))
            )}
          </div>
        </div>

      {/* 달력 영역 (500px - 수, 목, 금, 토) */}
      <div className="w-[500px] flex flex-col pl-4 pr-[26px] pt-10 pb-8 shrink-0">
        <div className="grid grid-cols-4 text-center pb-2 mb-2 border-b border-[rgba(160,140,120,0.1)]">
          {daysOfWeek.slice(3, 7).map((day, i) => (
            <span key={day} className={`text-[10px] tracking-[1.5px] ${i === 3 ? 'text-[rgba(65,95,165,0.45)]' : 'text-[rgba(120,105,85,0.5)]'}`}>
              {day}
            </span>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-4 grid-rows-6 gap-1.5 h-full min-h-0">
          {weeks.map((week, weekIdx) =>
            week.slice(3, 7).map((day, i) => (
              <CalendarCell
                key={`r-${weekIdx}-${i}`}
                day={day}
                diary={day ? diaries[toDateKey(currentYear, currentMonth, day)] : undefined}
                loading={loading}
                dayTextClass={i === 3 ? 'text-[rgba(65,95,165,0.55)]' : 'text-[rgba(60,45,30,0.6)]'}
                onClick={setSelectedDiary}
              />
            ))
          )}
        </div>
      </div>
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
          onDeleted={() => { setSelectedDiary(null); refetch(); }}
        />
      )}
    </div>
  );
}
