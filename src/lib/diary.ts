import type { DiaryItem } from "../api/diary";
import type { Diary } from "../types/diary";

export function normalizeDiaryMedia<T extends { mediaUrls?: string[] | null }>(diary: T) {
  return {
    ...diary,
    mediaUrls: diary.mediaUrls ?? [],
  };
}

export function toDiaryItem(diary: Diary): DiaryItem {
  return {
    id: diary.id,
    writtenAt: diary.writtenAt,
    mode: diary.mode,
    emoji: diary.emoji,
    rawContent: diary.rawContent ?? "",
    starRating: diary.starRating,
    mediaUrls: diary.mediaUrls ?? [],
  };
}

export function getDiaryPreview(entry: Pick<Diary, "rawContent" | "writtenAt">) {
  const source = entry.rawContent || "";
  if (!source.trim()) return entry.writtenAt;

  const parsed = new DOMParser().parseFromString(source, "text/html");
  const text = parsed.body.textContent?.replace(/\s+/g, " ").trim();

  return text || entry.writtenAt;
}
