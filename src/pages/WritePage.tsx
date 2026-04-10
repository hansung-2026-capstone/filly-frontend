import { Star, Mic, Calendar } from "lucide-react";
import { useState } from "react";
import { usePhotoUpload } from "../hook/usePhotoUpload";
import { PhotoUploadSection } from "../components/PhotoUploadSection";
import { TiptapEditor } from "../components/TiptapEditor";
import { DatePickerModal } from "../components/DatePickerModal";

export function WritePage() {
  const [rating, setRating] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 9)); // 2026년 4월 9일
  const [showDatePicker, setShowDatePicker] = useState(false);

  const aiPhotos = usePhotoUpload();
  const diaryPhotos = usePhotoUpload();

  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const getDayOfWeek = (date: Date) => {
    const days = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];
    return days[date.getDay()];
  };

  const currentDate = getFormattedDate(selectedDate);
  const currentDay = getDayOfWeek(selectedDate);

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - Draft Writing */}
      <div className="flex-1 flex flex-col py-5 px-6 gap-5 overflow-y-auto">
        <div className="pb-3 border-b border-[rgba(160,140,120,0.15)]">
          <h2 className="text-base text-[rgba(60,45,30,0.85)] tracking-wide m-0 font-medium">
            AI 작성 툴
          </h2>
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-2.5 flex-1">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            본문
          </h3>
          <TiptapEditor
            placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요..."
            maxLength={500}
            showToolbar={false}
            className="flex-1"
          />
        </div>

        {/* 사진 */}
        <PhotoUploadSection title="사진" {...aiPhotos} />

        {/* 음성 */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            음성 녹음
          </h3>
          <div className="flex items-center gap-3">
            <button
              className="w-[67px] h-[67px] rounded-lg border-2 cursor-pointer
                flex items-center justify-center hover:bg-[rgba(220,200,185,0.6)]
                transition-all duration-150 bg-[rgba(220,200,185,0.4)] border-[rgba(160,140,120,0.25)] border-dashed"
            >
              <Mic
                className="w-7 h-7 text-[rgba(100,80,60,0.6)]"
                strokeWidth={2}
              />
            </button>
          </div>
          <div className="flex justify-end pt-2">
            <button
              className="py-2.5 px-8 bg-[rgba(80,60,40,0.85)] text-[#faf6ed] border-none rounded-md
              cursor-pointer font-['Nanum_Myeongjo'] text-sm transition-all duration-150
              hover:bg-[rgba(60,40,20,0.95)] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
            >
              초안 생성
            </button>
          </div>
        </div>
      </div>

      {/* Right page - Preview */}
      <div className="flex-1 flex flex-col py-5 px-6 gap-5 overflow-y-auto">
        {/* Date Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(160,140,120,0.15)]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[rgba(80,60,40,0.75)] tracking-wide">
              {currentDate}
            </span>
            <span className="text-sm text-[rgba(120,100,80,0.5)]">
              {currentDay}
            </span>
          </div>
          <button
            onClick={() => setShowDatePicker(true)}
            className="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent
            cursor-pointer text-[rgba(80,60,40,0.5)] hover:bg-[rgba(160,140,120,0.08)] transition-all duration-150"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* 별점 */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            오늘의 기분
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-[22px] h-[22px] cursor-pointer transition-all duration-150 hover:scale-110
                  ${
                    i < rating
                      ? "fill-[rgba(230,190,60,0.85)] stroke-[rgba(200,160,40,0.7)]"
                      : "fill-none stroke-[rgba(200,180,120,0.4)]"
                  }`}
                strokeWidth={1.5}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
        </div>

        {/* 본문 */}
        <div className="flex flex-col gap-2.5 flex-1">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            본문
          </h3>
          <TiptapEditor
            placeholder="AI가 생성한 초안이 여기에 표시됩니다..."
            showToolbar={true}
            className="flex-1"
          />
        </div>

        {/* 사진 */}
        <PhotoUploadSection title="사진 및 동영상" {...diaryPhotos} />

        {/* 일기 작성 버튼 */}
        <div className="flex justify-end">
          <button
            className="py-2.5 px-8 bg-[rgba(80,60,40,0.85)] text-[#faf6ed] border-none rounded-md
            cursor-pointer font-['Nanum_Myeongjo'] text-sm transition-all duration-150
            hover:bg-[rgba(60,40,20,0.95)] shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
          >
            일기 작성
          </button>
        </div>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        onClose={() => setShowDatePicker(false)}
      />
    </div>
  );
}
