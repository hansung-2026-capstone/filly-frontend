import { normalizeDiaryMedia } from "../../lib/diary";
import type { DiaryItem } from "../../types/diary";
import { api } from "../instance";

interface DraftData {
  generatedText: string;
  aiAnalysis: {
    emotionType: string;
    moodIndex: number;
  };
}

const MULTIPART_HEADERS = { headers: { "Content-Type": "multipart/form-data" } };
const toDiaryList = (diaries: DiaryItem[]) => diaries.map(normalizeDiaryMedia);

export const getDiaries = async (year: number, month: number) => {
  const { data } = await api.get<{ data?: DiaryItem[] | null }>("/api/v1/diaries", {
    params: { year, month },
  });
  return toDiaryList(data.data ?? []);
};

export const createDraft = async (form: FormData) => {
  const { data } = await api.post<{ data: DraftData }>(
    "/api/v1/diaries/draft",
    form,
    MULTIPART_HEADERS,
  );
  return data.data;
};

export const saveDiary = async (form: FormData) => {
  const { data } = await api.post<{ data: { id: number } }>(
    "/api/v1/diaries",
    form,
    MULTIPART_HEADERS,
  );
  return data.data;
};

export const deleteDiary = async (id: number) => {
  await api.delete(`/api/v1/diaries/${id}`);
};

export const updateDiary = async (id: number, body: { rawContent?: string; emoji?: string }) => {
  const { data } = await api.put<{ data: DiaryItem }>(`/api/v1/diaries/${id}`, body);
  return normalizeDiaryMedia(data.data);
};
