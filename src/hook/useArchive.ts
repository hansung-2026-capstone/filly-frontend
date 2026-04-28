import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  // getArchives,
  // getAllDiaries,
  // getArchiveDiaries,
  // createArchive,
  type CreateArchiveInput,
} from '../api/archive'
import type { Archive } from '../types/archive'
import type { Diary } from '../types/diary'

const mockArchives: Archive[] = [
  { id: 1, name: '일상',  icon: '☀️', color: '#ffb3c1', entryCount: 12 },
  { id: 2, name: '여행',  icon: '✈️', color: '#b3d9ff', entryCount: 5  },
  { id: 3, name: '영화',  icon: '🎬', color: '#e6b3ff', entryCount: 8  },
  { id: 4, name: '독서',  icon: '📚', color: '#ffe599', entryCount: 3  },
  { id: 5, name: '감사',  icon: '🌿', color: '#b3e5d4', entryCount: 7  },
]

const mockAllDiaries: Diary[] = [
  { id: 101, archiveId: 1, writtenAt: '2025-03-10', emoji: '☕', starRating: 4, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 102, archiveId: 1, writtenAt: '2025-03-14', emoji: '🌙', starRating: 3, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 103, archiveId: 1, writtenAt: '2025-03-20', emoji: '🌸', starRating: 5, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 201, archiveId: 2, writtenAt: '2025-01-05', emoji: '🌊', starRating: 5, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 202, archiveId: 2, writtenAt: '2025-01-08', emoji: '🏖️', starRating: 4, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 301, archiveId: 3, writtenAt: '2025-02-15', emoji: '🎭', starRating: 4, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 302, archiveId: 3, writtenAt: '2025-02-22', emoji: '🎞️', starRating: 5, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 303, archiveId: 3, writtenAt: '2025-03-01', emoji: '🌅', starRating: 3, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 401, archiveId: 4, writtenAt: '2025-03-05', emoji: '🌱', starRating: 4, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 402, archiveId: 4, writtenAt: '2025-03-18', emoji: '📖', starRating: 3, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 501, archiveId: 5, writtenAt: '2025-03-25', emoji: '✨', starRating: 5, mode: 'default', finalText: '', mediaUrls: [] },
  { id: 502, archiveId: 5, writtenAt: '2025-03-28', emoji: '🌿', starRating: 4, mode: 'default', finalText: '', mediaUrls: [] },
]

const mockArchiveDiaries: Record<number, Diary[]> = {
  1: mockAllDiaries.filter(d => d.archiveId === 1),
  2: mockAllDiaries.filter(d => d.archiveId === 2),
  3: mockAllDiaries.filter(d => d.archiveId === 3),
  4: mockAllDiaries.filter(d => d.archiveId === 4),
  5: mockAllDiaries.filter(d => d.archiveId === 5),
}

export function useArchive() {
  const [archives, setArchives] = useState<Archive[]>([])
  const [diaries, setDiaries] = useState<Diary[]>([])
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // TODO: API 연동 후 아래 mock 데이터 제거하고 주석 해제
    // getArchives()
    //   .then(data => { if (!cancelled) setArchives(data) })
    //   .catch(() => { if (!cancelled) setArchives([]) })
    //   .finally(() => { if (!cancelled) setLoading(false) })

    if (!cancelled) {
      setArchives(mockArchives)
      setLoading(false)
    }

    return () => { cancelled = true }
  }, [location.key])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    // TODO: API 연동 후 아래 mock 데이터 제거하고 주석 해제
    // const fetcher = selectedArchiveId === null
    //   ? getAllDiaries()
    //   : getArchiveDiaries(selectedArchiveId)
    // fetcher
    //   .then(data => { if (!cancelled) setDiaries(data) })
    //   .catch(() => { if (!cancelled) setDiaries([]) })
    //   .finally(() => { if (!cancelled) setLoading(false) })

    if (!cancelled) {
      setDiaries(selectedArchiveId === null ? mockAllDiaries : (mockArchiveDiaries[selectedArchiveId] ?? []))
      setLoading(false)
    }

    return () => { cancelled = true }
  }, [selectedArchiveId, location.key])

  const addArchive = (input: CreateArchiveInput) => {
    // TODO: API 연동 후 아래 주석 해제 및 mock 로직 제거
    // createArchive(input).then(newArchive => setArchives(prev => [...prev, newArchive]))
    setArchives(prev => [...prev, { id: Date.now(), ...input, entryCount: 0 }])
  }

  return { archives, selectedArchiveId, setSelectedArchiveId, diaries, loading, addArchive }
}
