import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getMonthlyStat } from "../api/stat";
import type { MonthlyStat } from "../types/stat";
import { useAsyncResource } from "./useAsyncResource";

export function useMonthlyStat(year: number, month: number) {
  const location = useLocation();
  const loadMonthlyStat = useCallback(
    () => {
      void location.key;
      return getMonthlyStat(year, month);
    },
    [location.key, month, year],
  );
  const { data: stat, loading } = useAsyncResource<MonthlyStat | null>(
    loadMonthlyStat,
    null,
    "[useMonthlyStat]",
  );

  return { stat, loading };
}
