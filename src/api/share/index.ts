import { api } from "../instance";

export interface IdCardResponse {
  avatarUrl: string;
  nickname: string;
  keywords: string[];
}

export interface ReceiptResponse {
  orderNumber: string;
  diaryCount: number;
  totalChars: number;
  emotionDistribution: Record<string, number>;
  personaTitle: string | null;
}

export const getIdCard = async () => {
  const { data } = await api.get<{ data: IdCardResponse }>("/api/v1/share/id-card");
  return data.data;
};

export const getReceipt = async (year: number, month: number) => {
  const { data } = await api.get<{ data: ReceiptResponse }>("/api/v1/share/receipt", {
    params: { year, month },
  });
  return data.data;
};
