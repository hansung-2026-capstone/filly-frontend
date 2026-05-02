import { api } from "../instance";
import type { Archive } from "../../types/archive";
import type { Diary } from "../../types/diary";

export interface CreateArchiveInput {
  name: string;
  icon?: string | null;
  color: string;
}

export interface UpdateArchiveInput {
  name?: string;
  color?: string;
}

interface ArchiveFolderResponse {
  id: number;
  name: string;
  color: string;
  diaryCount: number;
  createdAt: string;
}

const ARCHIVE_COLOR_META: Record<string, Pick<Archive, "colorValue" | "shadowValue">> = {
  pink: {
    colorValue: "var(--archive-pink)",
    shadowValue: "var(--archive-pink-shadow)",
  },
  mint: {
    colorValue: "var(--archive-mint)",
    shadowValue: "var(--archive-mint-shadow)",
  },
  yellow: {
    colorValue: "var(--archive-yellow)",
    shadowValue: "var(--archive-yellow-shadow)",
  },
  blue: {
    colorValue: "var(--archive-blue)",
    shadowValue: "var(--archive-blue-shadow)",
  },
  purple: {
    colorValue: "var(--archive-purple)",
    shadowValue: "var(--archive-purple-shadow)",
  },
  gray: {
    colorValue: "var(--archive-gray)",
    shadowValue: "var(--archive-gray-shadow)",
  },
};

const getArchiveColorMeta = (color: string) =>
  ARCHIVE_COLOR_META[color] ?? ARCHIVE_COLOR_META.gray;

const toArchive = (folder: ArchiveFolderResponse): Archive => ({
  id: folder.id,
  name: folder.name,
  icon: null,
  color: folder.color,
  colorValue: getArchiveColorMeta(folder.color).colorValue,
  shadowValue: getArchiveColorMeta(folder.color).shadowValue,
  entryCount: folder.diaryCount,
});

const toDiary = (diary: Diary): Diary => ({
  ...diary,
  mediaUrls: diary.mediaUrls ?? [],
});

export const getArchives = async () => {
  const { data } = await api.get<{ data: ArchiveFolderResponse[] }>("/api/v1/archives");
  return (data.data ?? []).map(toArchive);
};

export const getAllDiaries = async () => {
  const { data } = await api.get<{ data: Diary[] }>("/api/v1/diaries/all-diaries");
  return (data.data ?? []).map(toDiary);
};

export const getArchiveDiaries = async (archiveId: number) => {
  const { data } = await api.get<{ data: Diary[] }>(
    `/api/v1/archives/${archiveId}/diaries`,
  );
  return (data.data ?? []).map(toDiary);
};

export const createArchive = async (input: CreateArchiveInput) => {
  const { data } = await api.post<{ data: ArchiveFolderResponse }>("/api/v1/archives", {
    name: input.name,
    color: input.color,
  });
  return toArchive(data.data);
};

export const updateArchive = async (archiveId: number, input: UpdateArchiveInput) => {
  const { data } = await api.patch<{ data: ArchiveFolderResponse }>(
    `/api/v1/archives/${archiveId}`,
    input,
  );
  return toArchive(data.data);
};

export const deleteArchive = async (archiveId: number) => {
  await api.delete(`/api/v1/archives/${archiveId}`);
};

export const addDiaryToArchive = async (archiveId: number, diaryId: number) => {
  await api.post(`/api/v1/archives/${archiveId}/diaries`, { diaryId });
};

export const removeDiaryFromArchive = async (archiveId: number, diaryId: number) => {
  await api.delete(`/api/v1/archives/${archiveId}/diaries/${diaryId}`);
};
