import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { getCalendarDays, WEEK_DAYS_SHORT } from "../lib/date";
import { Portal } from "./Portal";

interface DatePickerModalProps {
  isOpen: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

function isSelectedDay(day: number, selectedDate: Date, pickerMonth: Date) {
  return (
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === pickerMonth.getMonth() &&
    selectedDate.getFullYear() === pickerMonth.getFullYear()
  );
}

export function DatePickerModal({
  isOpen,
  selectedDate,
  onDateSelect,
  onClose,
}: DatePickerModalProps) {
  const [pickerMonth, setPickerMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth()),
  );

  const handleDateSelect = (day: number) => {
    onDateSelect(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day));
  };

  const moveMonth = (amount: number) => {
    setPickerMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + amount),
    );
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-bg-overlay-light flex items-center justify-center z-[9999]"
        onClick={onClose}
      >
        <div
          className="relative z-[91] bg-notebook-page rounded-lg p-6 shadow-lg w-80"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => moveMonth(-1)}
              className="p-1 hover:bg-[var(--bg-hover-soft)] rounded transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-text-muted" />
            </button>
            <h3 className="text-base font-medium text-text-heading">
              {pickerMonth.getFullYear()}년 {pickerMonth.getMonth() + 1}월
            </h3>
            <button
              onClick={() => moveMonth(1)}
              className="p-1 hover:bg-[var(--bg-hover-soft)] rounded transition-all"
            >
              <ChevronRight className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEK_DAYS_SHORT.map((day) => (
              <div
                key={day}
                className="text-center text-[11px] font-medium text-text-soft py-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays(pickerMonth).map((day, index) => (
              <button
                key={index}
                onClick={() => day && handleDateSelect(day)}
                disabled={!day}
                className={`
                  w-9 h-9 rounded text-sm font-medium transition-all
                  ${
                    !day
                      ? "bg-transparent cursor-default"
                      : isSelectedDay(day, selectedDate, pickerMonth)
                        ? "bg-bg-strong-control text-notebook-page"
                        : "text-text-heading hover:bg-bg-selected-hover"
                  }
                `}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border-medium rounded-md
                text-text-primary hover:bg-bg-hover
                transition-all duration-150 font-['Nanum_Myeongjo']"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
