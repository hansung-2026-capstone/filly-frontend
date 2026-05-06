import { useCallback, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDiaries } from "../api/diary";
import type { DiaryItem } from "../types/diary";
import { useAsyncResource } from "./useAsyncResource";

const EMPTY_DIARY_MAP: Record<string, DiaryItem> = {};

function toDiaryMap(list: DiaryItem[]) {
  return list.reduce<Record<string, DiaryItem>>((map, diary) => {
    map[diary.writtenAt] = diary;
    return map;
  }, {});
}

export function useMonthlyDiaries(year: number, month: number) {
  const [tick, setTick] = useState(0);
  const location = useLocation();

  const refetch = useCallback(() => setTick((currentTick) => currentTick + 1), []);
  const loadMonthlyDiaries = useCallback(
    async () => {
      void location.key;
      void tick;
      return toDiaryMap(await getDiaries(year, month));
    },
    [location.key, month, tick, year],
  );
  const { data: diaries, loading } = useAsyncResource(
    loadMonthlyDiaries,
    EMPTY_DIARY_MAP,
  );

  return { diaries, loading, refetch };
}
