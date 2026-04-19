import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getDiaries, type DiaryItem } from "../api/diary";

export function useMonthlyDiaries(year: number, month: number) {
  const [diaries, setDiaries] = useState<Record<string, DiaryItem>>({});
  const [loading, setLoading] = useState(false);
  const location = useLocation();

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
  // location.key: 같은 year/month라도 페이지 진입할 때마다 재요청
  }, [year, month, location.key]);

  return { diaries, loading };
}
