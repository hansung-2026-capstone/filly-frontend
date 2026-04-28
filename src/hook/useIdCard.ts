import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getIdCard, type IdCardResponse } from "../api/share";

export function useIdCard() {
  const [idCard, setIdCard] = useState<IdCardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getIdCard()
      .then((data) => {
        if (cancelled) return;
        console.log("[useIdCard]", data);
        setIdCard(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useIdCard] error", err);
        setIdCard(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [location.key]);

  return { idCard, loading };
}
