import { useState } from "react";
import { isFutureMonth, MONTHS } from "../lib/date";
import { Portal } from "./Portal";

interface MonthPickerModalProps {
  isOpen: boolean;
  selectedYear: number;
  selectedMonth: number;
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
}

export function MonthPickerModal({
  isOpen,
  selectedYear,
  selectedMonth,
  onSelect,
  onClose,
}: MonthPickerModalProps) {
  const [pickerYear, setPickerYear] = useState(selectedYear);

  const nextYearDisabled = isFutureMonth(pickerYear + 1, 1);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-bg-overlay z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="bg-notebook-page rounded-xl w-[420px] shadow-[var(--shadow-modal)]
            overflow-hidden font-['Nanum_Myeongjo']"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}
        >
          {/* 헤더 - 연도 선택 */}
          <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-border-light">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPickerYear((y) => y - 1)}
                className="w-7 h-7 border-none bg-bg-hover cursor-pointer rounded-md
                  flex items-center justify-center transition-all duration-150 hover:bg-bg-selected-hover"
              >
                <svg className="w-4 h-4 text-[var(--text-icon-soft)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="text-[15px] text-text-primary tracking-[0.5px] min-w-[60px] text-center">
                {pickerYear}
              </div>
              <button
                onClick={() => setPickerYear((y) => y + 1)}
                disabled={nextYearDisabled}
                className="w-7 h-7 border-none bg-bg-hover cursor-pointer rounded-md
                  flex items-center justify-center transition-all duration-150 hover:bg-bg-selected-hover
                  disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-[var(--text-icon-soft)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)]"
            >
              <svg className="w-4 h-4 text-[var(--text-icon-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* 월 그리드 */}
          <div className="py-5 px-5">
            <div className="grid grid-cols-3 gap-2.5">
              {MONTHS.map((month) => {
                const disabled = isFutureMonth(pickerYear, month.num);

                return (
                  <button
                    key={month.num}
                    onClick={() => {
                      if (disabled) return;
                      onSelect(pickerYear, month.num);
                      onClose();
                    }}
                    disabled={disabled}
                    className={`py-3 px-3 border rounded-lg font-['Nanum_Myeongjo']
                      text-[11px] transition-all duration-200 flex flex-col items-center gap-1
                      disabled:opacity-35 disabled:cursor-not-allowed
                      ${selectedYear === pickerYear && selectedMonth === month.num
                        ? "bg-bg-active border-border-strong text-text-heading"
                        : disabled
                          ? "bg-transparent border-border-medium text-text-soft"
                          : "bg-transparent border-border-medium text-text-muted hover:bg-bg-hover cursor-pointer"
                      }`}
                  >
                    <div className="text-[18px] leading-none">{String(month.num).padStart(2, "0")}</div>
                    <div className="text-[10px] tracking-[0.5px] uppercase opacity-75">{month.name.slice(0, 3)}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
