import { X } from "lucide-react";
import type { DiaryItem } from "../api/diary";
import { Portal } from "./Portal";
import { TiptapEditor } from "./TiptapEditor";

interface DiaryDetailModalProps {
  diary: DiaryItem;
  onClose: () => void;
}

export function DiaryDetailModal({ diary, onClose }: DiaryDetailModalProps) {
  return (
    <Portal>
      <div
        className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="bg-[#faf6ed] rounded-xl w-[420px] max-h-[70vh] flex flex-col shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.1)]
            overflow-hidden font-['Nanum_Myeongjo']"
          style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(160,140,120,0.12)]">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl leading-none">{diary.emoji}</span>
              <span className="text-sm text-[rgba(80,60,40,0.7)] tracking-wide">{diary.writtenAt}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.1)]"
            >
              <X className="w-4 h-4 text-[rgba(100,80,60,0.5)]" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {diary.mediaUrls?.length > 0 && (
              <div className="flex flex-col gap-2">
                {diary.mediaUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-full rounded-lg object-cover max-h-48 shadow-sm"
                  />
                ))}
              </div>
            )}
            <TiptapEditor
              showToolbar={false}
              readOnly
              content={diary.rawContent}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Portal>
  );
}
