import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPersonas, type PersonaCurrent, type PersonaResponse } from "../api/persona";

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
  const [personas, setPersonas] = useState<PersonaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [tick, setTick] = useState(0);
  const location = useLocation();

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPersonas()
      .then((data) => {
        if (cancelled) return;
        setPersonas(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[usePersona] error", err);
        setPersonas([]);
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [location.key, tick]);

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
