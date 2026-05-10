import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MoreVertical, Plus, X } from "lucide-react";
import { Portal } from "../components/Portal";
import { DiaryDetailModal } from "../components/DiaryDetailModal";
import { useArchive } from "../hook/common/useArchive";
import type { Archive } from "../types/archive";
import type { Diary } from "../types/diary";
import { getDiaryPreview, toDiaryItem } from "../lib/diary";

const ARCHIVE_COLOR_OPTIONS = [
  { key: "pink", label: "핑크", value: "var(--archive-pink)" },
  { key: "mint", label: "민트", value: "var(--archive-mint)" },
  { key: "yellow", label: "옐로우", value: "var(--archive-yellow)" },
  { key: "blue", label: "블루", value: "var(--archive-blue)" },
  { key: "purple", label: "퍼플", value: "var(--archive-purple)" },
  { key: "gray", label: "그레이", value: "var(--archive-gray)" },
];

type ArchiveModalMode = "create" | "edit";

interface ArchiveModalState {
  mode: ArchiveModalMode;
  archive: Archive | null;
}

export function ArchivePage() {
  const {
    archives,
    selectedArchiveId,
    setSelectedArchiveId,
    diaries,
    loadingArchives,
    loadingDiaries,
    mutating,
    error,
    addArchive,
    editArchive,
    removeArchive,
    refetchArchives,
    refetchDiaries,
  } = useArchive();
  const [modalState, setModalState] = useState<ArchiveModalState | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null);

  useEffect(() => {
    if (openMenuId === null) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  function getArchiveName(): string {
    if (selectedArchiveId === null) return "전체";
    return archives.find((archive) => archive.id === selectedArchiveId)?.name ?? "전체";
  }

  function handleDiaryClick(entry: Diary) {
    setSelectedDiary(entry);
  }

  function openCreateModal() {
    setModalState({ mode: "create", archive: null });
  }

  function openEditModal(archive: Archive) {
    setOpenMenuId(null);
    setModalState({ mode: "edit", archive });
  }

  async function handleDeleteArchive(archive: Archive) {
    setOpenMenuId(null);
    if (!window.confirm(`'${archive.name}' 아카이브를 삭제할까요?`)) return;
    await removeArchive(archive.id);
  }

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      <div className="flex-1 flex flex-col py-3 px-4 pl-5 overflow-y-auto">
        <div className="text-[11px] tracking-[2px] text-[var(--text-page-label)] uppercase text-center py-1 pb-2.5 flex-shrink-0">
          아카이브
        </div>

        {error && (
          <div className="mb-2 px-3 py-2 rounded-md bg-[var(--bg-error)] text-[11px] text-[var(--text-error)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 flex-1 content-start">
          <button
            type="button"
            onClick={openCreateModal}
            disabled={mutating}
            className="relative border-none cursor-pointer font-['Nanum_Pen_Script'] aspect-square
              border-2 border-dashed border-border-dashed rounded-sm flex flex-col items-center
              justify-center bg-bg-surface-muted transition-all duration-200 disabled:cursor-not-allowed
              disabled:opacity-60 hover:bg-bg-surface-muted-hover hover:border-border-dashed-hover
              hover:shadow-[var(--shadow-subtle)] hover:-translate-y-0.5"
          >
            <Plus className="w-7 h-7 text-[var(--text-upload-plus-soft)]" />
          </button>

          {loadingArchives && (
            <div className="col-span-2 flex items-center justify-center text-xs text-text-secondary">
              불러오는 중
            </div>
          )}

          {!loadingArchives &&
            archives.map((archive, index) => (
              <div key={archive.id} className="relative group aspect-square">
                <button
                  type="button"
                  onClick={() => setSelectedArchiveId(archive.id)}
                  className={`relative w-full h-full border-none cursor-pointer font-['Nanum_Pen_Script']
                    rounded-sm flex flex-col items-center justify-center gap-0.5 transition-all duration-200
                    ${
                      selectedArchiveId === archive.id
                        ? "scale-105 outline outline-2 outline-[var(--outline-archive-selected)] z-[2]"
                        : "hover:-translate-y-0.5 hover:scale-[1.03]"
                    }`}
                  style={{
                    background: archive.colorValue,
                    boxShadow:
                      selectedArchiveId === archive.id
                        ? `2px 4px 14px ${archive.shadowValue}`
                        : `1px 2px 5px ${archive.shadowValue}, var(--shadow-archive-card-inset)`,
                    transform:
                      index % 2 === 0 ? "rotate(-0.8deg)" : "rotate(1.2deg)",
                  }}
                >
                  <div
                    className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-[30px] h-2 bg-[var(--bg-paper-tape)]
                      rounded-[1px] shadow-[var(--shadow-tape)]"
                    style={{ transform: "translateX(-50%) rotate(-1deg)" }}
                  />

                  <div className="text-[22px] text-[var(--text-black-title)] leading-none">
                    {archive.name}
                  </div>
                  <div className="text-[20px] text-[var(--text-black-subtitle)] tracking-wide">
                    {archive.entryCount}개
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenMenuId(openMenuId === archive.id ? null : archive.id);
                  }}
                  className="absolute top-1 right-1 z-[3] w-5 h-5 flex items-center justify-center
                    rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150
                    bg-[var(--bg-black-subtle)] hover:bg-[var(--bg-black-subtle-hover)]"
                >
                  <MoreVertical className="w-3 h-3 text-[var(--text-black-icon)]" />
                </button>

                {openMenuId === archive.id && (
                  <div
                    className="absolute top-6 right-1 z-10 bg-bg-dropdown rounded shadow-md
                      border border-[var(--border-subtle)] py-1 min-w-[80px]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(archive)}
                      className="w-full text-left px-3 py-1.5 text-xs text-text-primary
                        hover:bg-bg-hover font-['Nanum_Myeongjo']"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteArchive(archive)}
                      disabled={mutating}
                      className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-danger-dark)]
                        hover:bg-bg-hover font-['Nanum_Myeongjo'] disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col py-3.5 px-6 pl-7 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 pb-2.5 border-b border-border-light mb-1 flex-shrink-0">
          {selectedArchiveId !== null && (
            <button
              type="button"
              onClick={() => setSelectedArchiveId(null)}
              className="w-6 h-6 flex items-center justify-center rounded-md border-none bg-transparent
                cursor-pointer text-text-muted hover:bg-bg-hover
                transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="text-sm text-[var(--text-stats-heading)] tracking-wide">
            {getArchiveName()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingDiaries && (
            <div className="py-8 text-center text-xs text-text-secondary">
              일기를 불러오는 중
            </div>
          )}

          {!loadingDiaries && diaries.length === 0 && (
            <div className="py-8 text-center text-xs text-text-secondary">
              표시할 일기가 없습니다.
            </div>
          )}

          {!loadingDiaries &&
            diaries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-2.5 px-3 border-b border-[var(--border-faint)]
                  cursor-pointer rounded-md transition-all duration-200 hover:bg-[var(--bg-hover-faint)]"
                onClick={() => handleDiaryClick(entry)}
              >
                {entry.mediaUrls?.[0] ? (
                  <img
                    src={entry.mediaUrls[0]}
                    alt={entry.writtenAt}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-[var(--shadow-thumbnail)]
                      border border-border-card"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
                      bg-[var(--bg-paper-thumbnail)] shadow-[var(--shadow-thumbnail)]
                      border border-border-card text-xl"
                  >
                    {entry.emoji}
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="text-[11px] text-text-secondary tracking-[0.5px]">
                    {entry.writtenAt}
                  </div>
                  <div className="text-xs text-text-primary leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                    {getDiaryPreview(entry)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {modalState && (
        <Portal>
          <ArchiveFormModal
            modalState={modalState}
            mutating={mutating}
            onClose={() => setModalState(null)}
            onSubmit={async (name, color) => {
              if (modalState.mode === "create") {
                await addArchive({ name, color });
              } else if (modalState.archive) {
                await editArchive(modalState.archive.id, { name, color });
              }
              setModalState(null);
            }}
          />
        </Portal>
      )}

      {selectedDiary && (
        <DiaryDetailModal
          diary={toDiaryItem(selectedDiary)}
          onClose={() => setSelectedDiary(null)}
          onArchived={() => {
            refetchArchives();
            refetchDiaries();
          }}
          onDeleted={() => {
            setSelectedDiary(null);
            refetchArchives();
            refetchDiaries();
          }}
        />
      )}
    </div>
  );
}

interface ArchiveFormModalProps {
  modalState: ArchiveModalState;
  mutating: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => Promise<void>;
}

function ArchiveFormModal({
  modalState,
  mutating,
  onClose,
  onSubmit,
}: ArchiveFormModalProps) {
  const [name, setName] = useState(modalState.archive?.name ?? "");
  const [color, setColor] = useState(modalState.archive?.color ?? "pink");
  const isEdit = modalState.mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await onSubmit(trimmedName, color);
  }

  return (
    <div
      className="fixed inset-0 bg-bg-overlay z-[500] flex items-center justify-center backdrop-blur-[2px]"
      onClick={onClose}
    >
      <form
        className="bg-notebook-page rounded-xl w-[380px] max-w-[calc(100vw-32px)]
          shadow-[var(--shadow-modal)]
          overflow-hidden font-['Nanum_Myeongjo']"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => void handleSubmit(event)}
        style={{
          animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-border-light">
          <div className="text-sm text-text-primary tracking-[0.5px]">
            {isEdit ? "아카이브 수정" : "아카이브 추가"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
              justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)]"
          >
            <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
          </button>
        </div>

        <div className="py-4 px-5 flex flex-col gap-3">
          <div>
            <div className="text-[11px] text-[var(--text-soft-label)] tracking-wide mb-1.5">
              아카이브 이름
            </div>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              autoFocus
              placeholder="행복했던 날"
              className="w-full py-2.5 px-3 border border-border-medium rounded-md
                bg-bg-editor-panel font-['Nanum_Myeongjo'] text-[13px] text-[var(--text-input)]
                outline-none focus:border-[var(--border-input-focus)]"
            />
          </div>

          <div>
            <div className="text-[11px] text-[var(--text-soft-label)] tracking-wide mb-1.5">
              색상
            </div>
            <div className="flex gap-2">
              {ARCHIVE_COLOR_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-label={option.label}
                  onClick={() => setColor(option.key)}
                  className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-all duration-150
                    ${
                      color === option.key
                        ? "border-[var(--border-input-strong)] scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                  style={{ background: option.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-border-medium bg-transparent rounded-md
                cursor-pointer font-['Nanum_Myeongjo'] text-[11px] text-text-muted
                transition-all duration-150 hover:bg-bg-hover"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutating || !name.trim()}
              className="py-2 px-4 bg-[var(--bg-save-button)] text-notebook-page border-none rounded-md
                cursor-pointer font-['Nanum_Myeongjo'] text-[11px] transition-all duration-150
                hover:bg-[var(--bg-save-button-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutating ? "저장 중" : "저장"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
