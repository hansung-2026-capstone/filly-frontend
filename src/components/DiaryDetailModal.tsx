import { Bookmark, Check, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDiaryToArchive,
  createArchive,
  getArchiveDiaries,
  getArchives,
  removeDiaryFromArchive,
} from "../api/archive";
import { deleteDiary, type DiaryItem } from "../api/diary";
import type { Archive } from "../types/archive";
import { formatKoreanDateKey, getKoreanDayLabelFromKey } from "../lib/date";
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

export function DiaryDetailModal({ diary, onClose, onDeleted, onArchived }: DiaryDetailModalProps) {
  const { label, dow } = formatDiaryDate(diary.writtenAt);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [archivedArchiveIds, setArchivedArchiveIds] = useState<Set<number>>(new Set());
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isAddingArchive, setIsAddingArchive] = useState(false);
  const [newArchiveName, setNewArchiveName] = useState("");
  const navigate = useNavigate();
  const isArchived = archivedArchiveIds.size > 0;

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

  const loadArchiveStatus = useCallback(async () => {
    setArchiveError(null);
    setLoadingArchives(true);

    try {
      const folders = await getArchives();
      const folderDiaries = await Promise.all(
        folders.map(async (archive) => ({
          archiveId: archive.id,
          diaries: await getArchiveDiaries(archive.id),
        })),
      );
      const nextArchivedArchiveIds = new Set(
        folderDiaries
          .filter(({ diaries }) => diaries.some((item) => item.id === diary.id))
          .map(({ archiveId }) => archiveId),
      );

      setArchives(folders);
      setArchivedArchiveIds(nextArchivedArchiveIds);
    } catch {
      setArchives([]);
      setArchiveError("아카이브 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingArchives(false);
    }
  }, [diary.id]);

  useEffect(() => {
    void loadArchiveStatus();
  }, [loadArchiveStatus]);

  const openArchiveModal = () => {
    setShowArchiveModal(true);
    void loadArchiveStatus();
  };

  const handleArchiveToggle = async (archive: Archive) => {
    setArchiving(true);
    setArchiveError(null);

    try {
      const nextArchivedArchiveIds = new Set(archivedArchiveIds);

      if (nextArchivedArchiveIds.has(archive.id)) {
        await removeDiaryFromArchive(archive.id, diary.id);
        nextArchivedArchiveIds.delete(archive.id);
      } else {
        await addDiaryToArchive(archive.id, diary.id);
        nextArchivedArchiveIds.add(archive.id);
      }

      setArchivedArchiveIds(nextArchivedArchiveIds);
      onArchived?.();
    } catch {
      setArchiveError("아카이브 상태를 변경하지 못했습니다.");
    } finally {
      setArchiving(false);
    }
  };

  const handleAddArchive = async () => {
    const trimmedName = newArchiveName.trim();
    if (!trimmedName) return;

    setArchiving(true);
    setArchiveError(null);

    try {
      const archive = await createArchive({ name: trimmedName, color: "pink" });
      await addDiaryToArchive(archive.id, diary.id);
      setArchives((prev) => [archive, ...prev]);
      setArchivedArchiveIds((prev) => new Set(prev).add(archive.id));
      setNewArchiveName("");
      setIsAddingArchive(false);
      onArchived?.();
    } catch {
      setArchiveError("새 아카이브를 만들거나 일기를 추가하지 못했습니다.");
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
          className="bg-notebook-page rounded-xl w-[400px] max-h-[78vh] flex flex-col
            shadow-[var(--shadow-modal)]
            overflow-hidden font-['Nanum_Myeongjo']"
          style={{ animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 날짜 헤더 */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
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
          <div className="mx-5 border-b border-border-light" />

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
              <p className="text-[12px] text-text-secondary italic text-center py-2">
                작성된 내용이 없습니다.
              </p>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-border-light min-h-[52px]">
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
                  disabled={archiving}
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
                      disabled={archiving || !newArchiveName.trim()}
                      className="w-6 h-6 border-none bg-transparent cursor-pointer rounded
                        transition-all duration-150 hover:bg-bg-selected-hover flex items-center justify-center
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      disabled={archiving}
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
                  disabled={archiving}
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
                      disabled={archiving}
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
