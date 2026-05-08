import type { Diary, DiaryItem } from "../types/diary";

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

export function hasDiaryText(content: string | undefined | null) {
  if (!content) return false;

  const parsed = new DOMParser().parseFromString(content, "text/html");
  const text = (parsed.body.textContent ?? content)
    .replace(/[\s\u00a0\u200B-\u200D\uFEFF]+/g, "")
    .trim();

  return text.length > 0;
}
