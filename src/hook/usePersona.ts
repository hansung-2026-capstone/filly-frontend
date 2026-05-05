import { useCallback, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPersonas, type PersonaCurrent, type PersonaResponse } from "../api/persona";
import { useAsyncResource } from "./useAsyncResource";

const EMPTY_PERSONAS: PersonaResponse[] = [];

const historyColors = [
  "var(--tab-stats)",
  "var(--tab-archive)",
  "var(--tab-recommend)",
  "var(--tab-home)",
];

export interface PersonaHistoryItem extends PersonaResponse {
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
  const [tick, setTick] = useState(0);
  const location = useLocation();

  const refetch = useCallback(() => setTick((currentTick) => currentTick + 1), []);
  const loadPersonas = useCallback(() => {
    void location.key;
    void tick;
    return getPersonas();
  }, [location.key, tick]);
  const {
    data: personas,
    loading,
    error,
  } = useAsyncResource(loadPersonas, EMPTY_PERSONAS, "[usePersona]");

  const current: PersonaCurrent | null = personas[0] ?? null;
  const history = useMemo<PersonaHistoryItem[]>(
    () =>
      personas.map((persona, index) => ({
        ...persona,
        generatedAtLabel: formatGeneratedAt(persona.generatedAt),
        color: historyColors[index % historyColors.length],
      })),
    [personas],
  );

  return { current, history, loading, error, refetch };
}
