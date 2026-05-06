import type { IdCard, Receipt } from "../../types/share";
import { api } from "../instance";

export const getIdCard = async () => {
  const { data } = await api.get<{ data: IdCard }>("/api/v1/share/id-card");
  return data.data;
};

export const getReceipt = async (year: number, month: number) => {
  const { data } = await api.get<{ data: Receipt }>("/api/v1/share/receipt", {
    params: { year, month },
  });
  return data.data;
};
