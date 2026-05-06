import {
  queryOptions,
  useMutation,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import {
  addDiaryToArchive,
  createArchive,
  deleteArchive,
  getAllDiaries,
  getArchiveDiaries,
  getArchives,
  removeDiaryFromArchive,
  updateArchive,
  type CreateArchiveInput,
  type UpdateArchiveInput,
} from "../../api/archive";
import type { Archive } from "../../types/archive";
import type { Diary } from "../../types/diary";
import { queryKeys } from "./keys";

export type { CreateArchiveInput, UpdateArchiveInput };

export interface ArchiveDiaryMutationInput {
  archiveId: number;
  diaryId: number;
}

export interface UpdateArchiveMutationInput {
  archiveId: number;
  input: UpdateArchiveInput;
}

export interface ArchiveStatusData {
  archives: Archive[];
  archivedArchiveIds: Set<number>;
}

const sortDiariesByLatest = (diaries: Diary[]) =>
  [...diaries].sort(
    (a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime(),
  );

export const archivesQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.archives.all,
    queryFn: getArchives,
  });

export const archiveDiariesQueryOptions = (selectedArchiveId: number | null) =>
  queryOptions({
    queryKey: queryKeys.archiveDiaries.byArchive(selectedArchiveId),
    queryFn: async () => {
      const diaries =
        selectedArchiveId === null
          ? await getAllDiaries()
          : await getArchiveDiaries(selectedArchiveId);

      return sortDiariesByLatest(diaries);
    },
  });

export const archiveStatusQueryOptions = (diaryId: number) =>
  queryOptions({
    queryKey: queryKeys.archiveStatus(diaryId),
    queryFn: async (): Promise<ArchiveStatusData> => {
      const archives = await getArchives();
      const archiveDiaries = await Promise.all(
        archives.map(async (archive) => ({
          archiveId: archive.id,
          diaries: await getArchiveDiaries(archive.id),
        })),
      );
      const archivedArchiveIds = new Set(
        archiveDiaries
          .filter(({ diaries }) => diaries.some((diary) => diary.id === diaryId))
          .map(({ archiveId }) => archiveId),
      );

      return { archives, archivedArchiveIds };
    },
  });

export function useArchivesQuery() {
  return useQuery(archivesQueryOptions());
}

export function useArchiveDiariesQuery(selectedArchiveId: number | null) {
  return useQuery(archiveDiariesQueryOptions(selectedArchiveId));
}

export function useArchiveStatusQuery(diaryId: number) {
  return useQuery(archiveStatusQueryOptions(diaryId));
}

export function useCreateArchiveMutation() {
  return useMutation({ mutationFn: createArchive });
}

export function useUpdateArchiveMutation() {
  return useMutation({
    mutationFn: ({ archiveId, input }: UpdateArchiveMutationInput) =>
      updateArchive(archiveId, input),
  });
}

export function useDeleteArchiveMutation() {
  return useMutation({ mutationFn: deleteArchive });
}

export function useAddDiaryToArchiveMutation() {
  return useMutation({
    mutationFn: ({ archiveId, diaryId }: ArchiveDiaryMutationInput) =>
      addDiaryToArchive(archiveId, diaryId),
  });
}

export function useRemoveDiaryFromArchiveMutation() {
  return useMutation({
    mutationFn: ({ archiveId, diaryId }: ArchiveDiaryMutationInput) =>
      removeDiaryFromArchive(archiveId, diaryId),
  });
}

export async function invalidateArchiveQueries(queryClient: QueryClient, diaryId?: number) {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: queryKeys.archives.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.archiveDiaries.all }),
  ];

  if (typeof diaryId === "number") {
    invalidations.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.archiveStatus(diaryId) }),
    );
  }

  await Promise.all(invalidations);
}
