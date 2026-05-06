import { useMemo } from "react";
import { useMonthlyDiariesQuery } from "../queries/diary";
import type { DiaryItem } from "../../types/diary";

const EMPTY_DIARY_MAP: Record<string, DiaryItem> = {};

function toDiaryMap(list: DiaryItem[]) {
  return list.reduce<Record<string, DiaryItem>>((map, diary) => {
    map[diary.writtenAt] = diary;
    return map;
  }, {});
}

export function useMonthlyDiaries(year: number, month: number) {
  const query = useMonthlyDiariesQuery(year, month);

  const diaries = useMemo(
    () => (query.data ? toDiaryMap(query.data) : EMPTY_DIARY_MAP),
    [query.data],
  );

  return { diaries, loading: query.isLoading, refetch: query.refetch };
}
