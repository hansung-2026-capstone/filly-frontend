import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  invalidateArchiveQueries,
  useArchiveDiariesQuery,
  useArchivesQuery,
  useCreateArchiveMutation,
  useDeleteArchiveMutation,
  useUpdateArchiveMutation,
  type CreateArchiveInput,
  type UpdateArchiveInput,
} from "../queries/archive";
import type { Archive } from "../../types/archive";
import type { Diary } from "../../types/diary";

const EMPTY_ARCHIVES: Archive[] = [];
const EMPTY_DIARIES: Diary[] = [];

const ARCHIVE_LIST_ERROR = "아카이브 목록을 불러오지 못했습니다.";
const ARCHIVE_DIARY_ERROR = "일기 목록을 불러오지 못했습니다.";
const CREATE_ARCHIVE_ERROR = "아카이브를 생성하지 못했습니다.";
const UPDATE_ARCHIVE_ERROR = "아카이브를 수정하지 못했습니다.";
const DELETE_ARCHIVE_ERROR = "아카이브를 삭제하지 못했습니다.";

function useArchiveList() {
  const query = useArchivesQuery();

  return {
    archives: query.data ?? EMPTY_ARCHIVES,
    loadingArchives: query.isLoading,
    archiveError: query.error ? ARCHIVE_LIST_ERROR : null,
    refetchArchives: query.refetch,
  };
}

function useArchiveDiaries(selectedArchiveId: number | null) {
  const query = useArchiveDiariesQuery(selectedArchiveId);

  return {
    diaries: query.data ?? EMPTY_DIARIES,
    loadingDiaries: query.isLoading,
    diaryError: query.error ? ARCHIVE_DIARY_ERROR : null,
    refetchDiaries: query.refetch,
  };
}

export function useArchive() {
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    archives,
    loadingArchives,
    archiveError,
    refetchArchives,
  } = useArchiveList();
  const {
    diaries,
    loadingDiaries,
    diaryError,
    refetchDiaries,
  } = useArchiveDiaries(selectedArchiveId);

  const invalidateQueries = useCallback(
    () => invalidateArchiveQueries(queryClient),
    [queryClient],
  );

  const createMutation = useCreateArchiveMutation();
  const updateMutation = useUpdateArchiveMutation();
  const deleteMutation = useDeleteArchiveMutation();

  const addArchive = useCallback(
    async (input: CreateArchiveInput) => {
      setMutationError(null);
      try {
        const newArchive = await createMutation.mutateAsync(input);
        setSelectedArchiveId(newArchive.id);
        await invalidateQueries();
        return newArchive;
      } catch (error) {
        setMutationError(CREATE_ARCHIVE_ERROR);
        throw error;
      }
    },
    [createMutation, invalidateQueries],
  );

  const editArchive = useCallback(
    async (archiveId: number, input: UpdateArchiveInput) => {
      setMutationError(null);
      try {
        const archive = await updateMutation.mutateAsync({ archiveId, input });
        await invalidateQueries();
        return archive;
      } catch (error) {
        setMutationError(UPDATE_ARCHIVE_ERROR);
        throw error;
      }
    },
    [invalidateQueries, updateMutation],
  );

  const removeArchive = useCallback(
    async (archiveId: number) => {
      setMutationError(null);
      try {
        await deleteMutation.mutateAsync(archiveId);
        setSelectedArchiveId((currentId) => (currentId === archiveId ? null : currentId));
        await invalidateQueries();
      } catch (error) {
        setMutationError(DELETE_ARCHIVE_ERROR);
        throw error;
      }
    },
    [deleteMutation, invalidateQueries],
  );

  const mutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return {
    archives,
    selectedArchiveId,
    setSelectedArchiveId,
    diaries,
    loading: loadingArchives || loadingDiaries,
    loadingArchives,
    loadingDiaries,
    mutating,
    error: mutationError ?? archiveError ?? diaryError,
    addArchive,
    editArchive,
    removeArchive,
    refetchArchives,
    refetchDiaries,
  };
}
