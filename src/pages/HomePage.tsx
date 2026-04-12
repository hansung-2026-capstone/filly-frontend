import { useState } from "react";
import { Pencil, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Portal } from "../components/Portal"
import { NicknameEditor } from "../components/NicknameEditor"

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

// 날짜 계산 로직
const getWeeksInMonth = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const days = new Date(year, month, 0).getDate();
  const allDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: days }, (_, i) => i + 1)
  );
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

  const navigate = useNavigate();

  const weeks = getWeeksInMonth(currentYear, currentMonth);
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(month);
    setShowMonthModal(false);
  };

  return (
    <div className="w-full h-full flex font-['Nanum_Myeongjo'] bg-transparent overflow-hidden">
      
      {/* 왼쪽 페이지 (전체 440px) */}
      <div className="w-[440px] flex h-full border-r border-dashed border-stone-200">
        
        {/* 사이드바 */}
        <div className="w-[110px] h-full flex flex-col border-r border-[rgba(160,140,120,0.15)]">
          {/* 월 버튼 영역 */}
          <button 
            onClick={() => setShowMonthModal(true)}
            className="h-[25%] w-full flex flex-col items-center justify-center gap-0.5 border-b border-[rgba(160,140,120,0.15)]
              bg-transparent border-none cursor-pointer transition-all duration-200 hover:bg-[rgba(160,140,120,0.04)] group"
          >
            <div className="text-[10px] tracking-[3px] text-[rgba(120,105,85,0.45)] uppercase">{currentYear}</div>
            <div className="text-[42px] font-normal text-[rgba(80,60,40,0.65)] leading-none">
              {String(currentMonth).padStart(2, '0')}
            </div>
            <div className="text-[11px] tracking-[2px] text-[rgba(120,105,85,0.5)] uppercase flex items-center gap-1">
              {months[currentMonth - 1].name}
              <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* 프로필 섹션 */}
          <div className="flex flex-col items-center justify-center py-5 px-2 gap-2 border-b border-[rgba(160,140,120,0.12)]">
            {/* TODO: 이미지, 닉네임 교체 */}
            <img 
              src="https://images.unsplash.com/photo-1650965294702-9b73f118bb69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200" 
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-[rgba(200,185,165,0.5)] shadow-sm"
            />
            <NicknameEditor initialNickname="소소한 하루" />
          </div>

          {/* 하단 작성 버튼 */}
          <div className="flex-1 flex flex-col items-stretch py-3.5 px-2.5">
            <button 
              onClick={() => navigate('/write')}
              className="mt-auto flex items-center justify-center gap-1.5 py-2 px-2.5 border-none bg-[rgba(160,140,120,0.08)] rounded-lg
                cursor-pointer text-[11px] text-[rgba(80,60,40,0.65)] hover:bg-[rgba(160,140,120,0.16)] transition-all"
            >
              <Pencil className="w-[15px] h-[15px] text-[rgba(140,120,90,0.5)]" />
              <span>기본 작성</span>
            </button>
          </div>
        </div>

        {/* 달력 영역 (330px - 일, 월, 화) */}
        <div className="w-[330px] flex flex-col p-5 pt-10 pb-8">
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
                <div key={`l-${weekIdx}-${i}`} className="border border-[rgba(160,140,120,0.1)] rounded bg-white/40 h-full p-1 min-h-0">
                  <span className={`text-[11px] ${i === 0 ? 'text-[rgba(185,75,65,0.6)]' : 'text-[rgba(60,45,30,0.6)]'}`}>{day}</span>
                  {/* TODO: 해당 날짜에 diaryData가 있는지 확인하여 이미지와 별점을 렌더링 */}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 오른쪽 페이지 (440px - 수, 목, 금, 토) */}
      <div className="w-[440px] flex flex-col p-8 pt-10 pb-8 pl-12">
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
              <div key={`r-${weekIdx}-${i}`} className="border border-[rgba(160,140,120,0.1)] rounded bg-white/40 h-full p-1 min-h-0">
                <span className={`text-[11px] ${i === 3 ? 'text-[rgba(65,95,165,0.55)]' : 'text-[rgba(60,45,30,0.6)]'}`}>{day}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Month selection modal */}
      {showMonthModal && (
        <Portal>
          <div 
            className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[500] flex items-center justify-center backdrop-blur-[2px]"
            onClick={() => setShowMonthModal(false)}
          >
            <div 
              className="bg-[#faf6ed] rounded-xl w-[420px] shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.1)]
                overflow-hidden font-['Nanum_Myeongjo']"
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)'
              }}
            >
              {/* Header with year selector */}
              <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-[rgba(160,140,120,0.12)]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentYear(currentYear - 1)}
                    className="w-7 h-7 border-none bg-[rgba(160,140,120,0.08)] cursor-pointer rounded-md 
                      flex items-center justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.15)]"
                  >
                    <svg className="w-4 h-4 text-[rgba(100,80,60,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div className="text-[15px] text-[rgba(60,45,30,0.75)] tracking-[0.5px] min-w-[60px] text-center">
                    {currentYear}
                  </div>
                  <button
                    onClick={() => setCurrentYear(currentYear + 1)}
                    className="w-7 h-7 border-none bg-[rgba(160,140,120,0.08)] cursor-pointer rounded-md 
                      flex items-center justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.15)]"
                  >
                    <svg className="w-4 h-4 text-[rgba(100,80,60,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setShowMonthModal(false)}
                  className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                    justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.1)]"
                >
                  <svg className="w-4 h-4 text-[rgba(100,80,60,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="py-5 px-5">
                <div className="grid grid-cols-3 gap-2.5">
                  {months.map((month) => (
                    <button
                      key={month.num}
                      onClick={() => handleMonthSelect(month.num)}
                      className={`py-3 px-3 border rounded-lg cursor-pointer font-['Nanum_Myeongjo']
                        text-[11px] transition-all duration-200 flex flex-col items-center gap-1
                        ${currentMonth === month.num 
                          ? 'bg-[rgba(80,60,40,0.12)] border-[rgba(80,60,40,0.3)] text-[rgba(60,45,30,0.8)]' 
                          : 'bg-transparent border-[rgba(160,140,120,0.2)] text-[rgba(80,60,40,0.6)] hover:bg-[rgba(160,140,120,0.08)]'
                        }`}
                    >
                      <div className="text-[18px] leading-none">
                        {String(month.num).padStart(2, '0')}
                      </div>
                      <div className="text-[9px] tracking-[0.5px] uppercase opacity-60">
                        {month.name.slice(0, 3)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}