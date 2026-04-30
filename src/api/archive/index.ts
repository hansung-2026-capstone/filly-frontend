import { api } from "../instance";
import type { Archive } from "../../types/archive";
import type { Diary } from "../../types/diary";

export interface CreateArchiveInput {
  name: string;
  icon: string | null;
  color: string;
}

export const getArchives = async () => {
  const { data } = await api.get<{ data: Archive[] }>("/api/v1/archives");
  return data.data ?? [];
};

export const getAllDiaries = async () => {
  const { data } = await api.get<{ data: Diary[] }>("/api/v1/diaries");
  return data.data ?? [];
};

export const getArchiveDiaries = async (archiveId: number) => {
  const { data } = await api.get<{ data: Diary[] }>(`/api/v1/archives/${archiveId}/diaries`);
  return data.data ?? [];
};

export const createArchive = async (input: CreateArchiveInput) => {
  const { data } = await api.post<{ data: Archive }>("/api/v1/archives", input);
  return data.data;
};
