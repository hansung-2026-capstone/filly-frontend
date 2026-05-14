import { UserRound } from "lucide-react";
import { Portal } from "./Portal";

interface AvatarPreviewModalProps {
  isOpen: boolean;
  avatarUrl: string | null;
  onClose: () => void;
}

export function AvatarPreviewModal({
  isOpen,
  avatarUrl,
  onClose,
}: AvatarPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-bg-overlay z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="relative bg-notebook-page rounded-2xl overflow-hidden shadow-[var(--shadow-modal)]"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 w-8 h-8 border-none bg-black/30 hover:bg-black/50
              cursor-pointer rounded-full flex items-center justify-center transition-all duration-150"
          >
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="프로필 이미지"
              className="block w-[400px] h-[400px] object-cover object-center"
            />
          ) : (
            <div className="w-[400px] h-[400px] flex items-center justify-center bg-bg-hover">
              <UserRound className="w-1/2 h-1/2 text-[var(--text-muted-light)]" />
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
