import { useMemo } from "react";
import { usePersonasQuery } from "../queries/persona";
import type { Persona } from "../../types/persona";

const EMPTY_PERSONAS: Persona[] = [];

const historyColors = [
  "var(--tab-stats)",
  "var(--tab-archive)",
  "var(--tab-recommend)",
  "var(--tab-home)",
];

export interface PersonaHistoryItem extends Persona {
  generatedAtLabel: string;
  color: string;
}

const formatGeneratedAt = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "생성일 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export function usePersona() {
  const query = usePersonasQuery();
  const personas = query.data ?? EMPTY_PERSONAS;

  const current: Persona | null = personas[0] ?? null;
  const history = useMemo<PersonaHistoryItem[]>(
    () =>
      personas.map((persona, index) => ({
        ...persona,
        generatedAtLabel: formatGeneratedAt(persona.generatedAt),
        color: historyColors[index % historyColors.length],
      })),
    [personas],
  );

  return {
    current,
    history,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
