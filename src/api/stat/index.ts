import { api } from "../instance";
import { unwrapData } from "../response";

export interface MonthlyStatResponse {
  recordMonth: string;
  diaryCount: number;
  totalChars: number;
  emotionDistribution: Record<string, number>;
  keywordCloud: Record<string, number>;
  topPeople: string[];
  dailyPattern: Record<string, Record<string, number>>;
}

export const getMonthlyStat = async (year: number, month: number) => {
  const { data } = await api.get<{ data: MonthlyStatResponse }>("/api/v1/stats/monthly", {
    params: { year, month },
  });
  return unwrapData(data);
};
