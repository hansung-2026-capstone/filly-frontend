export const queryKeys = {
  archives: {
    all: ["archives"] as const,
  },
  archiveDiaries: {
    all: ["archive-diaries"] as const,
    byArchive: (archiveId: number | null) => ["archive-diaries", archiveId ?? "all"] as const,
  },
  archiveStatus: (diaryId: number) => ["archive-status", diaryId] as const,
  diaries: {
    all: ["diaries"] as const,
    detail: (id: number) => ["diaries", "detail", id] as const,
    month: (year: number, month: number) => ["diaries", year, month] as const,
  },
  idCard: ["id-card"] as const,
  monthlyStat: (year: number, month: number) => ["monthly-stat", year, month] as const,
  personas: ["personas"] as const,
  receipt: (year: number, month: number) => ["receipt", year, month] as const,
  user: ["user"] as const,
};
