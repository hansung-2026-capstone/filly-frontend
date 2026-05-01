import { api } from "../instance";

export interface PersonaCurrent {
  id: number;
  title: string;
  summary: string;
  generatedAt: string;
}

export interface PersonaResponse {
  id: number;
  title: string;
  summary: string;
  generatedAt: string;
}

export const getPersonas = async () => {
  const { data } = await api.get<{ data: PersonaResponse[] }>("/api/v1/personas");
  return data.data ?? [];
};
