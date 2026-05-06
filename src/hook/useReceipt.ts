import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getReceipt } from "../api/share";
import type { Receipt } from "../types/share";
import { useAsyncResource } from "./useAsyncResource";

export function useReceipt(year: number, month: number) {
  const location = useLocation();
  const loadReceipt = useCallback(
    () => {
      void location.key;
      return getReceipt(year, month);
    },
    [location.key, month, year],
  );
  const { data: receipt, loading } = useAsyncResource<Receipt | null>(
    loadReceipt,
    null,
    "[useReceipt]",
  );

  return { receipt, loading };
}
