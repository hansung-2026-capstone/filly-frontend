import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getReceipt, type ReceiptResponse } from "../api/share";

export function useReceipt(year: number, month: number) {
  const [receipt, setReceipt] = useState<ReceiptResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getReceipt(year, month)
      .then((data) => {
        if (cancelled) return;
        console.log("[useReceipt]", data);
        setReceipt(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[useReceipt] error", err);
        setReceipt(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [year, month, location.key]);

  return { receipt, loading };
}
