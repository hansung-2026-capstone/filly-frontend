import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLocation } from "react-router-dom";
import {
  createArchive,
  deleteArchive,
  getAllDiaries,
  getArchiveDiaries,
  getArchives,
  updateArchive,
  type CreateArchiveInput,
  type UpdateArchiveInput,
} from "../api/archive";
import type { Archive } from "../types/archive";
import type { Diary } from "../types/diary";
import { useAsyncResource } from "./useAsyncResource";

const EMPTY_ARCHIVES: Archive[] = [];
const EMPTY_DIARIES: Diary[] = [];

const ARCHIVE_LIST_ERROR = "아카이브 목록을 불러오지 못했습니다.";
const ARCHIVE_DIARY_ERROR = "일기 목록을 불러오지 못했습니다.";
const CREATE_ARCHIVE_ERROR = "아카이브를 생성하지 못했습니다.";
const UPDATE_ARCHIVE_ERROR = "아카이브를 수정하지 못했습니다.";
const DELETE_ARCHIVE_ERROR = "아카이브를 삭제하지 못했습니다.";

const sortDiariesByLatest = (diaries: Diary[]) =>
  [...diaries].sort(
    (a, b) => new Date(b.writtenAt).getTime() - new Date(a.writtenAt).getTime(),
  );

function useArchiveList(locationKey: string) {
  const [archiveTick, setArchiveTick] = useState(0);
  const refetchArchives = useCallback(
    () => setArchiveTick((currentTick) => currentTick + 1),
    [],
  );
  const loadArchives = useCallback(() => {
    void locationKey;
    void archiveTick;
    return getArchives();
  }, [archiveTick, locationKey]);

  const {
    data: archives,
    setData: setArchives,
    loading: loadingArchives,
    error,
  } = useAsyncResource(loadArchives, EMPTY_ARCHIVES, "[useArchiveList]");

  return {
    archives,
    setArchives,
    loadingArchives,
    archiveError: error ? ARCHIVE_LIST_ERROR : null,
    refetchArchives,
  };
}

function useArchiveDiaries(selectedArchiveId: number | null, locationKey: string) {
  const [diaryTick, setDiaryTick] = useState(0);
  const refetchDiaries = useCallback(
    () => setDiaryTick((currentTick) => currentTick + 1),
    [],
  );
  const loadDiaries = useCallback(async () => {
    void locationKey;
    void diaryTick;
    const diaries =
      selectedArchiveId === null
        ? await getAllDiaries()
        : await getArchiveDiaries(selectedArchiveId);

    return sortDiariesByLatest(diaries);
  }, [diaryTick, locationKey, selectedArchiveId]);

  const {
    data: diaries,
    loading: loadingDiaries,
    error,
  } = useAsyncResource(loadDiaries, EMPTY_DIARIES, "[useArchiveDiaries]");

  return {
    diaries,
    loadingDiaries,
    diaryError: error ? ARCHIVE_DIARY_ERROR : null,
    refetchDiaries,
  };
}

interface UseArchiveMutationsParams {
  setArchives: Dispatch<SetStateAction<Archive[]>>;
  setSelectedArchiveId: Dispatch<SetStateAction<number | null>>;
  refetchDiaries: () => void;
}

function useArchiveMutations({
  setArchives,
  setSelectedArchiveId,
  refetchDiaries,
}: UseArchiveMutationsParams) {
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const runMutation = useCallback(
    async <T,>(mutation: () => Promise<T>, errorMessage: string) => {
      setMutating(true);
      setMutationError(null);

      try {
        return await mutation();
      } catch {
        setMutationError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const addArchive = useCallback(
    (input: CreateArchiveInput) =>
      runMutation(async () => {
        const newArchive = await createArchive(input);
        setArchives((archives) => [newArchive, ...archives]);
        setSelectedArchiveId(newArchive.id);
        refetchDiaries();
        return newArchive;
      }, CREATE_ARCHIVE_ERROR),
    [refetchDiaries, runMutation, setArchives, setSelectedArchiveId],
  );

  const editArchive = useCallback(
    (archiveId: number, input: UpdateArchiveInput) =>
      runMutation(async () => {
        const nextArchive = await updateArchive(archiveId, input);
        setArchives((archives) =>
          archives.map((archive) => (archive.id === archiveId ? nextArchive : archive)),
        );
        return nextArchive;
      }, UPDATE_ARCHIVE_ERROR),
    [runMutation, setArchives],
  );

  const removeArchive = useCallback(
    (archiveId: number) =>
      runMutation(async () => {
        await deleteArchive(archiveId);
        setArchives((archives) =>
          archives.filter((archive) => archive.id !== archiveId),
        );
        setSelectedArchiveId((currentId) =>
          currentId === archiveId ? null : currentId,
        );
        refetchDiaries();
      }, DELETE_ARCHIVE_ERROR),
    [refetchDiaries, runMutation, setArchives, setSelectedArchiveId],
  );

  return {
    mutating,
    mutationError,
    addArchive,
    editArchive,
    removeArchive,
  };
}

export function useArchive() {
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
  const location = useLocation();
  const {
    archives,
    setArchives,
    loadingArchives,
    archiveError,
    refetchArchives,
  } = useArchiveList(location.key);
  const {
    diaries,
    loadingDiaries,
    diaryError,
    refetchDiaries,
  } = useArchiveDiaries(selectedArchiveId, location.key);
  const {
    mutating,
    mutationError,
    addArchive,
    editArchive,
    removeArchive,
  } = useArchiveMutations({
    setArchives,
    setSelectedArchiveId,
    refetchDiaries,
  });

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
