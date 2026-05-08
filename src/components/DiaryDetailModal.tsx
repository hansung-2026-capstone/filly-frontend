import { Bookmark, Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DiaryItem } from "../types/diary";
import type { Archive } from "../types/archive";
import { formatKoreanDateKey, getKoreanDayLabelFromKey } from "../lib/date";
import { useDiaryArchiveStatus } from "../hook/common/useDiaryArchiveStatus";
import { Portal } from "./Portal";
import { TiptapEditor } from "./TiptapEditor";

interface DiaryDetailModalProps {
  diary: DiaryItem;
  onClose: () => void;
  onDeleted?: () => void;
  onArchived?: () => void;
}

function formatDiaryDate(writtenAt: string) {
  return {
    label: formatKoreanDateKey(writtenAt),
    dow: getKoreanDayLabelFromKey(writtenAt).replace("요일", ""),
  };
}

function PhotoCarousel({ urls }: { urls: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (urls.length === 0) return null;

  const hasMultiplePhotos = urls.length > 1;
  const currentUrl = urls[currentIndex] ?? urls[0];

  if (!hasMultiplePhotos) {
    return (
      <div className="w-full overflow-hidden rounded-lg bg-bg-surface-muted shadow-sm">
        <img src={currentUrl} alt="" className="block w-full h-[260px] max-h-[42vh] object-cover" />
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2">
      <div className="flex-1 overflow-hidden rounded-lg bg-bg-surface-muted shadow-sm">
        <img src={currentUrl} alt="" className="block w-full h-[260px] max-h-[42vh] object-cover" />
      </div>

      <div className="flex h-[260px] max-h-[42vh] w-10 flex-shrink-0 flex-col gap-1.5 overflow-y-auto
        rounded-lg border border-border-light bg-[var(--bg-hover-faint)] p-1">
        {urls.map((url, index) => {
          const selected = index === currentIndex;

          return (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}번째 사진 보기`}
              aria-current={selected ? "true" : undefined}
              className={`w-8 h-8 flex-shrink-0 overflow-hidden rounded border-2 p-0 cursor-pointer
                bg-bg-hover transition-all duration-150 hover:border-[var(--border-calendar-hover)] ${
                  selected
                    ? "border-[var(--border-strong)] shadow-[var(--shadow-thumbnail)]"
                    : "border-border-light opacity-70 hover:opacity-100"
                }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DiaryDetailModal({ diary, onClose, onDeleted, onArchived }: DiaryDetailModalProps) {
  const { label, dow } = formatDiaryDate(diary.writtenAt);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveActionError, setArchiveActionError] = useState<string | null>(null);
  const [isAddingArchive, setIsAddingArchive] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState("");
  const navigate = useNavigate();
  const {
    archives,
    archivedArchiveIds,
    loadingArchives,
    archiveError: archiveLoadError,
    refetchArchiveStatus,
    deleteDiary,
    addDiaryToArchive,
    removeDiaryFromArchive,
    createArchiveAndAddDiary,
    mutating,
  } = useDiaryArchiveStatus(diary.id);
  const archiveError = archiveActionError ?? archiveLoadError;
  const isArchived = archivedArchiveIds.size > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDiary();
      onDeleted?.();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const openArchiveModal = () => {
    setArchiveActionError(null);
    setShowArchiveModal(true);
    void refetchArchiveStatus();
  };

  const handleArchiveToggle = async (archive: Archive) => {
    setArchiving(true);
    setArchiveActionError(null);

    try {
      if (archivedArchiveIds.has(archive.id)) {
        await removeDiaryFromArchive(archive.id);
      } else {
        await addDiaryToArchive(archive.id);
      }

      onArchived?.();
    } catch {
      setArchiveActionError("아카이브 상태를 변경하지 못했습니다.");
    } finally {
      setArchiving(false);
    }
  };

  const handleAddArchive = async () => {
    const trimmedName = newArchiveName.trim();
    if (!trimmedName) return;

    setArchiving(true);
    setArchiveActionError(null);

    try {
      await createArchiveAndAddDiary(trimmedName);
      setNewArchiveName("");
      setIsAddingArchive(false);
      onArchived?.();
    } catch {
      setArchiveActionError("새 아카이브를 만들거나 일기를 추가하지 못했습니다.");
    } finally {
      setArchiving(false);
    }
  };

  const handleCancelAdd = () => {
    setNewArchiveName("");
    setIsAddingArchive(false);
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-bg-overlay z-[500] flex items-center justify-center backdrop-blur-[2px]"
        onClick={onClose}
      >
        <div
          className="relative bg-notebook-page rounded-xl w-[480px] max-h-[78vh] flex flex-col
            shadow-[var(--shadow-modal)]
            overflow-hidden font-['Nanum_Myeongjo']"
          style={{ animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="paper-texture absolute inset-0 pointer-events-none rounded-xl z-0" />

          {/* 날짜 헤더 */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[15px] text-text-heading tracking-wide">{label}</span>
              <span className="text-[12px] text-[var(--text-soft-label)]">{dow}요일</span>
              <span className="text-lg leading-none select-none">{diary.emoji}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)]"
            >
              <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
            </button>
          </div>

          {/* 구분선 */}
          <div className="relative z-10 mx-5 border-b border-border-light" />

          {/* 스크롤 바디 */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

            {/* 사진 */}
            <PhotoCarousel key={diary.id} urls={diary.mediaUrls ?? []} />

            {/* 본문 */}
            {diary.rawContent?.trim() ? (
              <TiptapEditor
                showToolbar={false}
                readOnly
                content={diary.rawContent}
                className="flex-1 min-h-[80px]"
              />
            ) : (
              <p className="text-[12px] text-text-secondary italic text-center py-2">
                작성된 내용이 없습니다.
              </p>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-5 py-3 border-t border-border-light min-h-[52px]">
            {confirmDelete ? (
              <>
                <div />
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[12px] text-text-muted mr-1">정말 삭제하시겠어요?</span>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-4 py-1.5 text-[12px] text-text-muted bg-bg-hover
                      border border-border-medium rounded-md cursor-pointer
                      hover:bg-bg-selected-hover transition-all duration-150 font-['Nanum_Myeongjo']"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-1.5 text-[12px] text-white bg-[var(--bg-danger-confirm)]
                      border border-transparent rounded-md cursor-pointer
                      hover:bg-[var(--bg-danger-confirm-hover)] transition-all duration-150 font-['Nanum_Myeongjo']
                      disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={openArchiveModal}
                  disabled={archiving || mutating}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer
                    transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                      isArchived
                        ? "bg-bg-active hover:bg-bg-active-hover"
                        : "bg-bg-hover hover:bg-bg-selected-hover"
                    }`}
                  title="아카이브에 추가"
                >
                  <Bookmark
                    className={`w-5 h-5 transition-all duration-200 ${
                      isArchived
                        ? "fill-text-muted stroke-text-muted"
                        : "fill-none stroke-text-dark-muted"
                    }`}
                    strokeWidth={1.8}
                  />
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => { onClose(); navigate('/write', { state: { diary } }); }}
                    className="px-4 py-1.5 text-[12px] text-text-muted bg-bg-hover
                      border border-border-medium rounded-md cursor-pointer
                      hover:bg-bg-selected-hover transition-all duration-150 font-['Nanum_Myeongjo']">
                    수정
                  </button>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-4 py-1.5 text-[12px] text-[var(--text-danger-dark)] bg-[var(--bg-danger-weak)]
                      border border-[var(--border-danger-muted)] rounded-md cursor-pointer
                      hover:bg-[var(--bg-danger-weak-hover)] transition-all duration-150 font-['Nanum_Myeongjo']">
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showArchiveModal && (
        <div
          className="fixed inset-0 bg-bg-overlay z-[600] flex items-center justify-center backdrop-blur-[2px]"
          onClick={() => setShowArchiveModal(false)}
        >
          <div
            className="bg-notebook-page rounded-xl w-[360px] shadow-[var(--shadow-modal)]
              overflow-hidden font-['Nanum_Myeongjo']"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-border-light">
              <div className="text-sm text-text-primary tracking-[0.5px]">아카이브 선택</div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
                  justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)]"
              >
                <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
              </button>
            </div>

            <div className="py-4 px-5 flex flex-col gap-2">
              {archiveError && (
                <div className="px-3 py-2 rounded-md bg-[var(--bg-error)] text-[11px] text-[var(--text-error)]">
                  {archiveError}
                </div>
              )}

              {isAddingArchive ? (
                <div className="w-full py-3 px-4 border rounded-lg
                  font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                  flex items-center gap-2.5 bg-bg-hover border-border-medium text-text-primary">
                  <input
                    type="text"
                    value={newArchiveName}
                    onChange={(e) => setNewArchiveName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAddArchive();
                      if (e.key === "Escape") handleCancelAdd();
                    }}
                    className="flex-1 bg-transparent outline-none font-['Nanum_Myeongjo'] text-[12px]"
                    placeholder="새 아카이브 이름"
                    autoFocus
                  />
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => void handleAddArchive()}
                      disabled={archiving || mutating || !newArchiveName.trim()}
                      className="w-6 h-6 border-none bg-transparent cursor-pointer rounded
                        transition-all duration-150 hover:bg-bg-selected-hover flex items-center justify-center
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      disabled={archiving || mutating}
                      className="w-6 h-6 border-none bg-transparent cursor-pointer rounded
                        transition-all duration-150 hover:bg-bg-selected-hover flex items-center justify-center
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingArchive(true)}
                  disabled={archiving || mutating}
                  className="w-full py-3 px-4 border rounded-lg cursor-pointer
                    font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                    flex items-center gap-2.5 bg-transparent border-border-medium text-text-primary
                    hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 text-text-muted" />
                  새 아카이브 추가
                </button>
              )}

              {loadingArchives && (
                <div className="py-4 text-center text-[12px] text-text-secondary">
                  불러오는 중
                </div>
              )}

              {!loadingArchives &&
                archives.map((archive) => {
                  const archiveHasDiary = archivedArchiveIds.has(archive.id);

                  return (
                    <button
                      key={archive.id}
                      onClick={() => void handleArchiveToggle(archive)}
                      disabled={archiving || mutating}
                      className={`w-full py-3 px-4 border rounded-lg cursor-pointer
                        font-['Nanum_Myeongjo'] text-[12px] transition-all duration-150
                        flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                          archiveHasDiary
                            ? "bg-bg-active border-border-strong text-text-heading"
                            : "bg-transparent border-border-medium text-text-primary hover:bg-bg-hover"
                        }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ background: archive.colorValue }}
                      />
                      <span className="flex-1 text-left">{archive.name}</span>
                      {archiveHasDiary && (
                        <Bookmark className="w-3.5 h-3.5 fill-text-muted stroke-text-muted" />
                      )}
                    </button>
                  );
                })}

              {!loadingArchives && archives.length === 0 && !archiveError && (
                <div className="py-4 text-center text-[12px] text-text-secondary">
                  아카이브가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Portal>
  );
}
