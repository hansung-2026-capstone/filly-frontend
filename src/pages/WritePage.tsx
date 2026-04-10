import {
  Star,
  Mic,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  RotateCcw,
  RotateCw,
  Link2,
  Smile,
  Calendar,
} from "lucide-react";
import { useState } from "react";

export function WritePage() {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<
    { id: number; color: string; label: string }[]
  >([]);
  const [currentDate] = useState("2026년 4월 9일");
  const [currentDay] = useState("수요일");

  const removePhoto = (id: number) => {
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  const addPhoto = () => {
    const colors = ["#d4b3a5", "#b8a89a", "#c9b8aa", "#a89888", "#b8a090"];
    const newId =
      photos.length > 0 ? Math.max(...photos.map((p) => p.id)) + 1 : 1;
    setPhotos([
      ...photos,
      {
        id: newId,
        color: colors[Math.floor(Math.random() * colors.length)],
        label: `사진 ${newId}`,
      },
    ]);
  };

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - Draft Writing */}
      <div className="flex-1 flex flex-col py-5 px-6 gap-5 overflow-y-auto">
        {/* 작성 툴 Header */}
        <div className="pb-3 border-b border-[rgba(160,140,120,0.15)]">
          <h2 className="text-base text-[rgba(60,45,30,0.85)] tracking-wide m-0 font-medium">
            AI 작성 툴
          </h2>
        </div>

        {/* 본문 Section */}
        <div className="flex flex-col gap-2.5 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
              본문
            </h3>
          </div>

          {/* Content Input */}
          <div className="bg-[rgba(255,253,247,0.8)] rounded-lg border border-[rgba(160,140,120,0.2)] p-3.5 flex-1 flex flex-col">
            <textarea
              placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 border-none resize-none bg-transparent
                font-['Nanum_Myeongjo'] text-[13px] text-[rgba(55,40,25,0.8)] outline-none leading-[1.7]
                placeholder:text-[rgba(140,120,90,0.35)]"
            />
            <div className="text-[9px] text-[rgba(120,100,80,0.4)] mt-1.5 text-right">
              {content.split(/\s+/).filter((word) => word.length > 0).length}
              /500 단어
            </div>
          </div>
        </div>

        {/* 사진 및 동영상 Section */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
              사진
            </h3>
          </div>

          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={addPhoto}
              className="w-[67px] h-[67px] bg-[rgba(220,200,185,0.4)] rounded-lg border-2 border-dashed 
                border-[rgba(160,140,120,0.25)] cursor-pointer flex items-center justify-center 
                text-2xl text-[rgba(140,120,90,0.4)] hover:bg-[rgba(220,200,185,0.6)] 
                hover:border-[rgba(140,120,90,0.35)] transition-all duration-150"
            >
              +
            </button>
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="w-[67px] h-[67px] rounded-lg flex items-center justify-center relative
                  shadow-[0_2px_6px_rgba(0,0,0,0.08)] border border-[rgba(220,210,195,0.5)]"
                style={{ background: photo.color }}
              >
                <span className="text-[9px] text-[rgba(255,255,255,0.7)]">
                  {photo.label}
                </span>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[rgba(80,60,40,0.85)]
                    border-2 border-[#faf6ed] flex items-center justify-center
                    text-white cursor-pointer transition-all duration-150 hover:bg-[rgba(60,40,20,0.95)]
                    shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 음성 Section */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
              음성 녹음
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`w-[67px] h-[67px] rounded-lg border-2 cursor-pointer
                flex items-center justify-center hover:bg-[rgba(220,200,185,0.6)] 
                transition-all duration-150 bg-[rgba(220,200,185,0.4)] border-[rgba(160,140,120,0.25)] border-dashed`}
            >
              <Mic
                className={`w-7 h-7 text-[rgba(100,80,60,0.6)]`}
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
            className="w-7 h-7 flex items-center justify-center rounded-md border-none bg-transparent
            cursor-pointer text-[rgba(80,60,40,0.5)] hover:bg-[rgba(160,140,120,0.08)]
            transition-all duration-150"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>

        {/* 별점 Section */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            오늘의 기분
          </h3>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-[22px] h-[22px] cursor-pointer transition-all duration-150
                  ${
                    i < rating
                      ? "fill-[rgba(230,190,60,0.85)] stroke-[rgba(200,160,40,0.7)]"
                      : "fill-none stroke-[rgba(200,180,120,0.4)]"
                  } hover:scale-110`}
                strokeWidth={1.5}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
        </div>

        {/* 생성된 초안 Section */}
        <div className="flex flex-col gap-2.5 flex-1">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            본문
          </h3>
          {/* Toolbar */}
          <div className="flex items-center gap-1 py-1.5 px-2.5 bg-[rgba(240,235,225,0.5)] rounded-md border border-[rgba(160,140,120,0.15)]">
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <Bold
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2.5}
              />
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <Italic
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <Underline
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>

            <div className="w-px h-4 bg-[rgba(160,140,120,0.2)] mx-0.5" />

            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <List
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <ListOrdered
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>

            <div className="w-px h-4 bg-[rgba(160,140,120,0.2)] mx-0.5" />

            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <RotateCcw
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <RotateCw
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>

            <div className="w-px h-4 bg-[rgba(160,140,120,0.2)] mx-0.5" />

            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer"
            >
              <Link2
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>

            <button
              className="w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)] 
              rounded transition-all duration-150 border-none bg-transparent cursor-pointer ml-auto"
            >
              <Smile
                className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="bg-[rgba(255,253,247,0.8)] rounded-lg border border-[rgba(160,140,120,0.2)] p-3.5 flex-1">
            <div className="w-full h-full text-[13px] text-[rgba(55,40,25,0.8)] leading-[1.7]">
              {/* 초안 내용이 여기에 표시됩니다 */}
              <p className="text-[rgba(140,120,90,0.35)] m-0">
                AI가 생성한 초안이 여기에 표시됩니다...
              </p>
            </div>
          </div>
        </div>

        {/* 사진 Section */}
        <div className="flex flex-col gap-2.5">
          <h3 className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px] m-0 font-medium">
            사진 및 동영상
          </h3>
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={addPhoto}
              className="w-[67px] h-[67px] bg-[rgba(220,200,185,0.4)] rounded-lg border-2 border-dashed 
                border-[rgba(160,140,120,0.25)] cursor-pointer flex items-center justify-center 
                text-2xl text-[rgba(140,120,90,0.4)] hover:bg-[rgba(220,200,185,0.6)] 
                hover:border-[rgba(140,120,90,0.35)] transition-all duration-150"
            >
              +
            </button>
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="w-[67px] h-[67px] rounded-lg flex items-center justify-center relative
                  shadow-[0_2px_6px_rgba(0,0,0,0.08)] border border-[rgba(220,210,195,0.5)]"
                style={{ background: photo.color }}
              >
                <span className="text-[9px] text-[rgba(255,255,255,0.7)]">
                  {photo.label}
                </span>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[rgba(80,60,40,0.85)]
                    border-2 border-[#faf6ed] flex items-center justify-center
                    text-white cursor-pointer transition-all duration-150 hover:bg-[rgba(60,40,20,0.95)]
                    shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>

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
    </div>
  );
}
