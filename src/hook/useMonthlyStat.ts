import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getMonthlyStat, type MonthlyStatResponse } from "../api/stat";

export function useMonthlyStat(year: number, month: number) {
  const [stat, setStat] = useState<MonthlyStatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getMonthlyStat(year, month)
      .then((data) => {
        if (cancelled) return;
        setStat(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useMonthlyStat] error", err);
        setStat(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year, month, location.key]);

  return { stat, loading };
}
