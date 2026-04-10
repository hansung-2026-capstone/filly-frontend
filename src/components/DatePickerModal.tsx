import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DatePickerModalProps {
  isOpen: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
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

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(pickerMonth);
    const firstDay = getFirstDayOfMonth(pickerMonth);
    const days: (number | null)[] = [];

    // 이전달의 비어있는 날들
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // 현재달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      pickerMonth.getFullYear(),
      pickerMonth.getMonth(),
      day,
    );
    onDateSelect(newDate);
  };

  const handlePrevMonth = () => {
    setPickerMonth(
      new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setPickerMonth(
      new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1),
    );
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.2)] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#faf6ed] rounded-lg p-6 shadow-lg w-80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-1 hover:bg-[rgba(160,140,120,0.1)] rounded transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-[rgba(80,60,40,0.6)]" />
          </button>
          <h3 className="text-base font-medium text-[rgba(60,45,30,0.85)]">
            {pickerMonth.getFullYear()}년 {pickerMonth.getMonth() + 1}월
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1 hover:bg-[rgba(160,140,120,0.1)] rounded transition-all"
          >
            <ChevronRight className="w-5 h-5 text-[rgba(80,60,40,0.6)]" />
          </button>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-medium text-[rgba(120,100,80,0.6)] py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, idx) => (
            <button
              key={idx}
              onClick={() => day && handleDateSelect(day)}
              disabled={!day}
              className={`
                w-9 h-9 rounded text-sm font-medium transition-all
                ${
                  !day
                    ? "bg-transparent cursor-default"
                    : selectedDate.getDate() === day &&
                        selectedDate.getMonth() === pickerMonth.getMonth() &&
                        selectedDate.getFullYear() === pickerMonth.getFullYear()
                      ? "bg-[rgba(80,60,40,0.85)] text-[#faf6ed]"
                      : "text-[rgba(60,45,30,0.8)] hover:bg-[rgba(160,140,120,0.15)]"
                }
              `}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-[rgba(160,140,120,0.2)] rounded-md
              text-[rgba(80,60,40,0.75)] hover:bg-[rgba(160,140,120,0.08)]
              transition-all duration-150 font-['Nanum_Myeongjo']"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
