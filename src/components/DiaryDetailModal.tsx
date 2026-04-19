import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDiary, type DiaryItem } from "../api/diary";
import { Portal } from "./Portal";
import { TiptapEditor } from "./TiptapEditor";

interface DiaryDetailModalProps {
  diary: DiaryItem;
  onClose: () => void;
  onDeleted?: () => void;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(writtenAt: string) {
  const [y, m, d] = writtenAt.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = DAY_NAMES[date.getDay()];
  return { label: `${y}년 ${m}월 ${d}일`, dow };
}

function PhotoGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;

  if (urls.length === 1) {
    return (
      <img src={urls[0]} alt="" className="w-full rounded-lg object-cover max-h-56 shadow-sm" />
    );
  }

  if (urls.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {urls.map((url, i) => (
          <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg shadow-sm" />
        ))}
      </div>
    );
  }

  if (urls.length === 3) {
    return (
      <div className="flex flex-col gap-1.5">
        <img src={urls[0]} alt="" className="w-full rounded-lg object-cover max-h-40 shadow-sm" />
        <div className="grid grid-cols-2 gap-1.5">
          {urls.slice(1).map((url, i) => (
            <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  // 4장
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {urls.slice(0, 4).map((url, i) => (
        <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg shadow-sm" />
      ))}
    </div>
  );
}

export function DiaryDetailModal({ diary, onClose, onDeleted }: DiaryDetailModalProps) {
  const { label, dow } = formatDate(diary.writtenAt);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDiary(diary.id);
      onDeleted?.();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="bg-[#faf6ed] rounded-xl w-[400px] max-h-[78vh] flex flex-col
            shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.1)]
            overflow-hidden font-['Nanum_Myeongjo']"
          style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 날짜 헤더 */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-[rgba(60,45,30,0.8)] tracking-wide">{label}</span>
              <span className="text-[12px] text-[rgba(120,100,80,0.5)]">{dow}요일</span>
              <span className="text-lg leading-none select-none">{diary.emoji}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.1)]"
            >
              <X className="w-4 h-4 text-[rgba(100,80,60,0.45)]" />
            </button>
          </div>

          {/* 구분선 */}
          <div className="mx-5 border-b border-[rgba(160,140,120,0.12)]" />

          {/* 스크롤 바디 */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            {/* 사진 */}
            <PhotoGrid urls={diary.mediaUrls ?? []} />

            {/* 본문 */}
            {diary.rawContent?.trim() ? (
              <TiptapEditor
                showToolbar={false}
                readOnly
                content={diary.rawContent}
                className="flex-1 min-h-[80px]"
              />
            ) : (
              <p className="text-[12px] text-[rgba(120,100,80,0.35)] italic text-center py-2">
                작성된 내용이 없습니다.
              </p>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[rgba(160,140,120,0.12)] min-h-[52px]">
            {confirmDelete ? (
              <>
                <span className="text-[12px] text-[rgba(80,60,40,0.6)] mr-1">정말 삭제하시겠어요?</span>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-1.5 text-[12px] text-[rgba(80,60,40,0.65)] bg-[rgba(160,140,120,0.08)]
                    border border-[rgba(160,140,120,0.2)] rounded-md cursor-pointer
                    hover:bg-[rgba(160,140,120,0.15)] transition-all duration-150 font-['Nanum_Myeongjo']"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-1.5 text-[12px] text-white bg-[rgba(180,60,40,0.8)]
                    border border-transparent rounded-md cursor-pointer
                    hover:bg-[rgba(160,40,20,0.9)] transition-all duration-150 font-['Nanum_Myeongjo']
                    disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "삭제 중..." : "삭제"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { onClose(); navigate('/write', { state: { diary } }); }}
                  className="px-4 py-1.5 text-[12px] text-[rgba(80,60,40,0.65)] bg-[rgba(160,140,120,0.08)]
                    border border-[rgba(160,140,120,0.2)] rounded-md cursor-pointer
                    hover:bg-[rgba(160,140,120,0.15)] transition-all duration-150 font-['Nanum_Myeongjo']">
                  수정
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-1.5 text-[12px] text-[rgba(180,60,40,0.7)] bg-[rgba(180,60,40,0.05)]
                    border border-[rgba(180,60,40,0.2)] rounded-md cursor-pointer
                    hover:bg-[rgba(180,60,40,0.1)] transition-all duration-150 font-['Nanum_Myeongjo']">
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
