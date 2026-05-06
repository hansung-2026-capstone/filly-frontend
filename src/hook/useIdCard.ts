import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getIdCard } from "../api/share";
import type { IdCard } from "../types/share";
import { useAsyncResource } from "./useAsyncResource";

export function useIdCard() {
  const location = useLocation();
  const loadIdCard = useCallback(() => {
    void location.key;
    return getIdCard();
  }, [location.key]);
  const { data: idCard, loading } = useAsyncResource<IdCard | null>(
    loadIdCard,
    null,
    "[useIdCard]",
  );

  return { idCard, loading };
}
