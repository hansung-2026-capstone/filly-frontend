import type { Persona } from "../../types/persona";
import { api } from "../instance";

export const getPersonas = async () => {
  const { data } = await api.get<{ data?: Persona[] | null }>("/api/v1/personas");
  return data.data ?? [];
};
