import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getMonthlyStat, type MonthlyStatResponse } from "../api/stat";
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
  const { data: stat, loading } = useAsyncResource<MonthlyStatResponse | null>(
    loadMonthlyStat,
    null,
    "[useMonthlyStat]",
  );

  return { stat, loading };
}
