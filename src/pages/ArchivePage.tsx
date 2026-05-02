import { type FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MoreVertical, Plus, X } from "lucide-react";
import { Portal } from "../components/Portal";
import { DiaryDetailModal } from "../components/DiaryDetailModal";
import { useArchive } from "../hook/useArchive";
import type { DiaryItem } from "../api/diary";
import type { Archive } from "../types/archive";
import type { Diary } from "../types/diary";

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

const toDiaryItem = (diary: Diary): DiaryItem => ({
  id: diary.id,
  writtenAt: diary.writtenAt,
  mode: diary.mode,
  emoji: diary.emoji,
  rawContent: diary.rawContent ?? "",
  starRating: diary.starRating,
  mediaUrls: diary.mediaUrls ?? [],
});

function getDiaryPreview(entry: Diary) {
  const source = entry.rawContent || "";
  if (!source.trim()) return entry.writtenAt;

  const parsed = new DOMParser().parseFromString(source, "text/html");
  const text = parsed.body.textContent?.replace(/\s+/g, " ").trim();

  return text || entry.writtenAt;
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
        <div className="text-[11px] tracking-[2px] text-[rgba(120,105,85,0.4)] uppercase text-center py-1 pb-2.5 flex-shrink-0">
          아카이브
        </div>

        {error && (
          <div className="mb-2 px-3 py-2 rounded-md bg-[rgba(200,70,60,0.08)] text-[11px] text-[rgba(150,50,40,0.78)]">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 flex-1 content-start">
          <button
            type="button"
            onClick={openCreateModal}
            disabled={mutating}
            className="relative border-none cursor-pointer font-['Nanum_Pen_Script'] aspect-square
              border-2 border-dashed border-[rgba(160,140,120,0.25)] rounded-sm flex flex-col items-center
              justify-center bg-[rgba(240,235,225,0.6)] transition-all duration-200 disabled:cursor-not-allowed
              disabled:opacity-60 hover:bg-[rgba(240,235,225,0.9)] hover:border-[rgba(140,120,90,0.35)]
              hover:shadow-[1px_2px_6px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
          >
            <Plus className="w-7 h-7 text-[rgba(140,120,90,0.35)]" />
          </button>

          {loadingArchives && (
            <div className="col-span-2 flex items-center justify-center text-xs text-[rgba(120,105,85,0.45)]">
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
                        ? "scale-105 outline outline-2 outline-[rgba(0,0,0,0.1)] z-[2]"
                        : "hover:-translate-y-0.5 hover:scale-[1.03]"
                    }`}
                  style={{
                    background: archive.colorValue,
                    boxShadow:
                      selectedArchiveId === archive.id
                        ? `2px 4px 14px ${archive.shadowValue}`
                        : `1px 2px 5px ${archive.shadowValue}, inset 0 -1px 2px rgba(0,0,0,0.04)`,
                    transform:
                      index % 2 === 0 ? "rotate(-0.8deg)" : "rotate(1.2deg)",
                  }}
                >
                  <div
                    className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-[30px] h-2 bg-[rgba(255,255,255,0.45)]
                      rounded-[1px] shadow-[0_0.5px_1px_rgba(0,0,0,0.06)]"
                    style={{ transform: "translateX(-50%) rotate(-1deg)" }}
                  />

                  <div className="text-[22px] text-[rgba(0,0,0,0.55)] leading-none">
                    {archive.name}
                  </div>
                  <div className="text-[20px] text-[rgba(0,0,0,0.28)] tracking-wide">
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
                    bg-[rgba(0,0,0,0.08)] hover:bg-[rgba(0,0,0,0.15)]"
                >
                  <MoreVertical className="w-3 h-3 text-[rgba(0,0,0,0.45)]" />
                </button>

                {openMenuId === archive.id && (
                  <div
                    className="absolute top-6 right-1 z-10 bg-[#fffdf7] rounded shadow-md
                      border border-[rgba(160,140,120,0.15)] py-1 min-w-[80px]"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(archive)}
                      className="w-full text-left px-3 py-1.5 text-xs text-[rgba(60,45,30,0.7)]
                        hover:bg-[rgba(160,140,120,0.08)] font-['Nanum_Myeongjo']"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteArchive(archive)}
                      disabled={mutating}
                      className="w-full text-left px-3 py-1.5 text-xs text-[rgba(180,60,40,0.7)]
                        hover:bg-[rgba(160,140,120,0.08)] font-['Nanum_Myeongjo'] disabled:opacity-50"
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
        <div className="flex items-center gap-2 pb-2.5 border-b border-[rgba(160,140,120,0.12)] mb-1 flex-shrink-0">
          {selectedArchiveId !== null && (
            <button
              type="button"
              onClick={() => setSelectedArchiveId(null)}
              className="w-6 h-6 flex items-center justify-center rounded-md border-none bg-transparent
                cursor-pointer text-[rgba(80,60,40,0.6)] hover:bg-[rgba(160,140,120,0.08)]
                transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="text-sm text-[rgba(70,55,35,0.65)] tracking-wide">
            {getArchiveName()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingDiaries && (
            <div className="py-8 text-center text-xs text-[rgba(120,105,85,0.45)]">
              일기를 불러오는 중
            </div>
          )}

          {!loadingDiaries && diaries.length === 0 && (
            <div className="py-8 text-center text-xs text-[rgba(120,105,85,0.45)]">
              표시할 일기가 없습니다.
            </div>
          )}

          {!loadingDiaries &&
            diaries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-2.5 px-3 border-b border-[rgba(160,140,120,0.08)]
                  cursor-pointer rounded-md transition-all duration-200 hover:bg-[rgba(160,140,120,0.06)]"
                onClick={() => handleDiaryClick(entry)}
              >
                {entry.mediaUrls?.[0] ? (
                  <img
                    src={entry.mediaUrls[0]}
                    alt={entry.writtenAt}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.1)]
                      border border-[rgba(220,210,195,0.5)]"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0
                      bg-[rgba(240,235,225,0.8)] shadow-[0_1px_3px_rgba(0,0,0,0.1)]
                      border border-[rgba(220,210,195,0.5)] text-xl"
                  >
                    {entry.emoji}
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                  <div className="text-[10px] text-[rgba(120,105,85,0.45)] tracking-[0.5px]">
                    {entry.writtenAt}
                  </div>
                  <div className="text-xs text-[rgba(60,45,30,0.7)] leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
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
      className="fixed inset-0 bg-[rgba(0,0,0,0.4)] z-[500] flex items-center justify-center backdrop-blur-[2px]"
      onClick={onClose}
    >
      <form
        className="bg-[#faf6ed] rounded-xl w-[380px] max-w-[calc(100vw-32px)]
          shadow-[0_16px_48px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.1)]
          overflow-hidden font-['Nanum_Myeongjo']"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => void handleSubmit(event)}
        style={{
          animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div className="flex items-center justify-between py-4 px-5 pb-3.5 border-b border-[rgba(160,140,120,0.12)]">
          <div className="text-sm text-[rgba(60,45,30,0.75)] tracking-[0.5px]">
            {isEdit ? "아카이브 수정" : "아카이브 추가"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center
              justify-center transition-all duration-150 hover:bg-[rgba(160,140,120,0.1)]"
          >
            <X className="w-4 h-4 text-[rgba(100,80,60,0.5)]" />
          </button>
        </div>

        <div className="py-4 px-5 flex flex-col gap-3">
          <div>
            <div className="text-[11px] text-[rgba(120,105,85,0.5)] tracking-wide mb-1.5">
              아카이브 이름
            </div>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              autoFocus
              placeholder="행복했던 날"
              className="w-full py-2.5 px-3 border border-[rgba(160,140,120,0.2)] rounded-md
                bg-[rgba(255,253,247,0.8)] font-['Nanum_Myeongjo'] text-[13px] text-[rgba(55,40,25,0.8)]
                outline-none focus:border-[rgba(140,120,90,0.4)]"
            />
          </div>

          <div>
            <div className="text-[11px] text-[rgba(120,105,85,0.5)] tracking-wide mb-1.5">
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
                        ? "border-[rgba(80,60,40,0.5)] scale-110"
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
              className="py-2 px-4 border border-[rgba(160,140,120,0.2)] bg-transparent rounded-md
                cursor-pointer font-['Nanum_Myeongjo'] text-[11px] text-[rgba(80,60,40,0.6)]
                transition-all duration-150 hover:bg-[rgba(160,140,120,0.08)]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={mutating || !name.trim()}
              className="py-2 px-4 bg-[rgba(80,60,40,0.7)] text-[#faf6ed] border-none rounded-md
                cursor-pointer font-['Nanum_Myeongjo'] text-[11px] transition-all duration-150
                hover:bg-[rgba(60,40,20,0.8)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutating ? "저장 중" : "저장"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
