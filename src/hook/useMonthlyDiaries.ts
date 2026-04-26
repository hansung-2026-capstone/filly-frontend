import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getDiaries, type DiaryItem } from "../api/diary";

export function useMonthlyDiaries(year: number, month: number) {
  const [diaries, setDiaries] = useState<Record<string, DiaryItem>>({});
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const location = useLocation();

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDiaries(year, month)
      .then((list) => {
        if (cancelled) return;
        const map: Record<string, DiaryItem> = {};
        for (const d of list) {
          map[d.writtenAt] = d;
        }
        setDiaries(map);
      })
      .catch(() => {
        if (!cancelled) setDiaries({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  // tick: 수동 refetch 트리거 / location.key: 페이지 진입마다 재요청
  }, [year, month, location.key, tick]);

  return { diaries, loading, refetch };
}
