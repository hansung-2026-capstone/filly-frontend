import { api } from "../instance";

export interface DiaryItem {
  id: number;
  writtenAt: string;
  mode: string;
  emoji: string;
  rawContent: string;
  starRating: number;
  thumbnailUrl?: string;
}

export interface DraftResponse {
  generatedText: string;
  aiAnalysis: {
    emotionType: string;
    moodIndex: number;
  };
}

export const getDiaries = async (year: number, month: number) => {
  const { data } = await api.get<{ data: DiaryItem[] }>(
    `/api/v1/diaries?year=${year}&month=${month}`,
  );
  return data.data ?? [];
};

export const createDraft = async (form: FormData) => {
  const { data } = await api.post<{ data: DraftResponse }>(
    "/api/v1/diaries/draft",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
};

export const saveDiary = async (form: FormData) => {
  const { data } = await api.post<{ data: { id: number } }>(
    "/api/v1/diaries",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
};
