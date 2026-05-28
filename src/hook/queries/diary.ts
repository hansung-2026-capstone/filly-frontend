import {
  queryOptions,
  useMutation,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import {
  createDraft,
  deleteDiary,
  getDiaries,
  saveDiary,
  updateDiary,
} from "../../api/diary";
import type { DiaryItem } from "../../types/diary";
import { queryKeys } from "./keys";

export interface UpdateDiaryMutationInput {
  id: number;
  body: {
    rawContent?: string;
    emoji?: string;
  };
}

export interface DiaryQueryMonth {
  year: number;
  month: number;
}

export const monthlyDiariesQueryOptions = (year: number, month: number) =>
  queryOptions({
    queryKey: queryKeys.diaries.month(year, month),
    queryFn: () => getDiaries(year, month),
  });

export function useMonthlyDiariesQuery(year: number, month: number) {
  return useQuery(monthlyDiariesQueryOptions(year, month));
}

export function useCreateDraftMutation() {
  return useMutation({ mutationFn: createDraft });
}

export function useSaveDiaryMutation() {
  return useMutation({ mutationFn: saveDiary });
}

export function useUpdateDiaryMutation() {
  return useMutation({
    mutationFn: ({ id, body }: UpdateDiaryMutationInput) => updateDiary(id, body),
  });
}

export function useDeleteDiaryMutation() {
  return useMutation({ mutationFn: deleteDiary });
}

export function fetchMonthlyDiaries(
  queryClient: QueryClient,
  year: number,
  month: number,
): Promise<DiaryItem[]> {
  return queryClient.fetchQuery({
    ...monthlyDiariesQueryOptions(year, month),
    staleTime: 0,
  });
}

export async function invalidateDiaryQueries(
  queryClient: QueryClient,
  targetMonth?: DiaryQueryMonth,
) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: queryKeys.diaries.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.archiveDiaries.all }),
  ];

  if (targetMonth) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: queryKeys.monthlyStat(targetMonth.year, targetMonth.month),
      }),
    );
  }

  await Promise.all(invalidations);
}
