import type { MonthlyStat } from "../../types/stat";
import { api } from "../instance";

export const getMonthlyStat = async (year: number, month: number) => {
  const { data } = await api.get<{ data: MonthlyStat }>("/api/v1/stats/monthly", {
    params: { year, month },
  });
  return data.data;
};
