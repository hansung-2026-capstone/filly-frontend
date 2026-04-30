import { api } from "../instance";

export interface PersonaCurrent {
  title: string;
  description: string;
}

export interface PersonaHistoryItem {
  name: string;
  startDate: string;
  endDate: string;
  color: string;
}

export const getPersonaCurrent = async () => {
  const { data } = await api.get<{ data: PersonaCurrent }>("/api/v1/persona/current");
  return data.data;
};

export const getPersonaHistory = async () => {
  const { data } = await api.get<{ data: PersonaHistoryItem[] }>("/api/v1/persona/history");
  return data.data ?? [];
};
