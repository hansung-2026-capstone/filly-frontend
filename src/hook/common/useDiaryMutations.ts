import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchMonthlyDiaries,
  invalidateDiaryQueries,
  useCreateDraftMutation,
  useSaveDiaryMutation,
  useUpdateDiaryMutation,
  type UpdateDiaryMutationInput,
} from "../queries/diary";

const getDateMonth = (date: Date) => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
});

export function useDiaryMutations(targetDate: Date) {
  const queryClient = useQueryClient();
  const draftMutation = useCreateDraftMutation();
  const saveMutation = useSaveDiaryMutation();
  const updateMutation = useUpdateDiaryMutation();

  const invalidateDiaries = useCallback(
    () => invalidateDiaryQueries(queryClient, getDateMonth(targetDate)),
    [queryClient, targetDate],
  );

  const loadMonthlyDiaries = useCallback(
    () => {
      const { year, month } = getDateMonth(targetDate);
      return fetchMonthlyDiaries(queryClient, year, month);
    },
    [queryClient, targetDate],
  );

  const createDraft = useCallback(
    (form: FormData) => draftMutation.mutateAsync(form),
    [draftMutation],
  );

  const saveDiary = useCallback(
    (form: FormData) => saveMutation.mutateAsync(form),
    [saveMutation],
  );

  const updateDiary = useCallback(
    (input: UpdateDiaryMutationInput) => updateMutation.mutateAsync(input),
    [updateMutation],
  );

  return {
    createDraft,
    saveDiary,
    updateDiary,
    loadMonthlyDiaries,
    invalidateDiaries,
    draftPending: draftMutation.isPending,
    savePending: saveMutation.isPending,
    updatePending: updateMutation.isPending,
  };
}
