import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Portal } from "./Portal";

interface NotebookDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accent: string;
  eyebrow: string;
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
}

export function NotebookDetailModal({
  isOpen,
  onClose,
  accent,
  eyebrow,
  title,
  meta,
  children,
  footer,
  widthClassName = "w-[380px] max-w-[calc(100vw-32px)]",
}: NotebookDetailModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-overlay px-4 backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className={`relative overflow-hidden rounded-[22px] bg-notebook-page shadow-[var(--shadow-modal)] font-['Nanum_Myeongjo'] ${widthClassName}`}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-30 paper-texture"
          />

          <div className="relative border-b border-border-light px-4 py-3">
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5"
              style={{ background: accent }}
            />
            <div className="flex items-start justify-between gap-3 pl-1">
              <div className="min-w-0">
                <div className="inline-flex items-center rounded-full border border-border-light bg-bg-beige-subtle px-2 py-0.5 text-[10px] tracking-[1.8px] text-[var(--text-page-label)] uppercase">
                  {eyebrow}
                </div>
                <div className="mt-2 text-[16px] font-bold leading-[1.4] text-text-heading">
                  {title}
                </div>
                {meta && (
                  <div className="mt-1 text-[12px] leading-[1.6] text-text-secondary">
                    {meta}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border-light bg-bg-beige-subtle text-text-muted transition-colors hover:bg-bg-hover"
                aria-label="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative max-h-[60vh] overflow-y-auto px-4 py-4">
            {children}
          </div>

          {footer && (
            <div className="relative border-t border-border-light px-4 py-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
