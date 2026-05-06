import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateArchiveQueries,
  useAddDiaryToArchiveMutation,
  useArchiveStatusQuery,
  useCreateArchiveMutation,
  useRemoveDiaryFromArchiveMutation,
} from "../queries/archive";
import { invalidateDiaryQueries, useDeleteDiaryMutation } from "../queries/diary";
import type { Archive } from "../../types/archive";

const EMPTY_ARCHIVES: Archive[] = [];
const EMPTY_ARCHIVED_IDS = new Set<number>();
const ARCHIVE_LIST_ERROR = "아카이브 목록을 불러오지 못했습니다.";

export function useDiaryArchiveStatus(diaryId: number) {
  const queryClient = useQueryClient();
  const statusQuery = useArchiveStatusQuery(diaryId);
  const deleteMutation = useDeleteDiaryMutation();
  const createArchiveMutation = useCreateArchiveMutation();
  const addDiaryToArchiveMutation = useAddDiaryToArchiveMutation();
  const removeDiaryFromArchiveMutation = useRemoveDiaryFromArchiveMutation();

  const archives = statusQuery.data?.archives ?? EMPTY_ARCHIVES;
  const archivedArchiveIds = statusQuery.data?.archivedArchiveIds ?? EMPTY_ARCHIVED_IDS;

  const invalidateArchiveStatus = useCallback(
    () => invalidateArchiveQueries(queryClient, diaryId),
    [diaryId, queryClient],
  );

  const deleteDiary = useCallback(async () => {
    await deleteMutation.mutateAsync(diaryId);
    await Promise.all([
      invalidateDiaryQueries(queryClient),
      invalidateArchiveStatus(),
    ]);
  }, [deleteMutation, diaryId, invalidateArchiveStatus, queryClient]);

  const addDiaryToArchive = useCallback(
    async (archiveId: number) => {
      await addDiaryToArchiveMutation.mutateAsync({ archiveId, diaryId });
      await invalidateArchiveStatus();
    },
    [addDiaryToArchiveMutation, diaryId, invalidateArchiveStatus],
  );

  const removeDiaryFromArchive = useCallback(
    async (archiveId: number) => {
      await removeDiaryFromArchiveMutation.mutateAsync({ archiveId, diaryId });
      await invalidateArchiveStatus();
    },
    [diaryId, invalidateArchiveStatus, removeDiaryFromArchiveMutation],
  );

  const createArchiveAndAddDiary = useCallback(
    async (name: string) => {
      const archive = await createArchiveMutation.mutateAsync({ name, color: "pink" });
      await addDiaryToArchiveMutation.mutateAsync({ archiveId: archive.id, diaryId });
      await invalidateArchiveStatus();
      return archive;
    },
    [addDiaryToArchiveMutation, createArchiveMutation, diaryId, invalidateArchiveStatus],
  );

  const mutating = useMemo(
    () =>
      deleteMutation.isPending ||
      createArchiveMutation.isPending ||
      addDiaryToArchiveMutation.isPending ||
      removeDiaryFromArchiveMutation.isPending,
    [
      addDiaryToArchiveMutation.isPending,
      createArchiveMutation.isPending,
      deleteMutation.isPending,
      removeDiaryFromArchiveMutation.isPending,
    ],
  );

  return {
    archives,
    archivedArchiveIds,
    loadingArchives: statusQuery.isLoading,
    archiveError: statusQuery.error ? ARCHIVE_LIST_ERROR : null,
    refetchArchiveStatus: statusQuery.refetch,
    deleteDiary,
    addDiaryToArchive,
    removeDiaryFromArchive,
    createArchiveAndAddDiary,
    mutating,
  };
}
