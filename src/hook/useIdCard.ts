import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getIdCard, type IdCardResponse } from "../api/share";
import { useAsyncResource } from "./useAsyncResource";

export function useIdCard() {
  const location = useLocation();
  const loadIdCard = useCallback(() => {
    void location.key;
    return getIdCard();
  }, [location.key]);
  const { data: idCard, loading } = useAsyncResource<IdCardResponse | null>(
    loadIdCard,
    null,
    "[useIdCard]",
  );

  return { idCard, loading };
}
