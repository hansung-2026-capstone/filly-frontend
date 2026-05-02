import { useCallback, useEffect, useState } from "react";
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

export function useArchive() {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [loadingDiaries, setLoadingDiaries] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archiveTick, setArchiveTick] = useState(0);
  const [diaryTick, setDiaryTick] = useState(0);
  const location = useLocation();

  const refetchArchives = useCallback(() => setArchiveTick((tick) => tick + 1), []);
  const refetchDiaries = useCallback(() => setDiaryTick((tick) => tick + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoadingArchives(true);
    setError(null);

    getArchives()
      .then((data) => {
        if (!cancelled) setArchives(data);
      })
      .catch(() => {
        if (!cancelled) {
          setArchives([]);
          setError("아카이브 목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingArchives(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location.key, archiveTick]);

  useEffect(() => {
    let cancelled = false;
    setLoadingDiaries(true);
    setError(null);

    const fetcher =
      selectedArchiveId === null ? getAllDiaries() : getArchiveDiaries(selectedArchiveId);

    fetcher
      .then((data) => {
        if (!cancelled) setDiaries(data);
      })
      .catch(() => {
        if (!cancelled) {
          setDiaries([]);
          setError("일기 목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDiaries(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedArchiveId, location.key, diaryTick]);

  const addArchive = useCallback(async (input: CreateArchiveInput) => {
    setMutating(true);
    setError(null);

    try {
      const newArchive = await createArchive(input);
      setArchives((prev) => [newArchive, ...prev]);
      setSelectedArchiveId(newArchive.id);
      refetchDiaries();
      return newArchive;
    } catch {
      setError("아카이브를 생성하지 못했습니다.");
      throw new Error("Failed to create archive");
    } finally {
      setMutating(false);
    }
  }, [refetchDiaries]);

  const editArchive = useCallback(async (archiveId: number, input: UpdateArchiveInput) => {
    setMutating(true);
    setError(null);

    try {
      const nextArchive = await updateArchive(archiveId, input);
      setArchives((prev) =>
        prev.map((archive) => (archive.id === archiveId ? nextArchive : archive)),
      );
      return nextArchive;
    } catch {
      setError("아카이브를 수정하지 못했습니다.");
      throw new Error("Failed to update archive");
    } finally {
      setMutating(false);
    }
  }, []);

  const removeArchive = useCallback(async (archiveId: number) => {
    setMutating(true);
    setError(null);

    try {
      await deleteArchive(archiveId);
      setArchives((prev) => prev.filter((archive) => archive.id !== archiveId));
      setSelectedArchiveId((current) => (current === archiveId ? null : current));
      refetchDiaries();
    } catch {
      setError("아카이브를 삭제하지 못했습니다.");
      throw new Error("Failed to delete archive");
    } finally {
      setMutating(false);
    }
  }, [refetchDiaries]);

  return {
    archives,
    selectedArchiveId,
    setSelectedArchiveId,
    diaries,
    loading: loadingArchives || loadingDiaries,
    loadingArchives,
    loadingDiaries,
    mutating,
    error,
    addArchive,
    editArchive,
    removeArchive,
    refetchArchives,
    refetchDiaries,
  };
}
