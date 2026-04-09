import { useState } from 'react'
import type { Archive } from '../types/archive'
import type { Diary } from '../types/diary'
 
interface CreateArchiveInput {
  name: string
  icon: string | null
  color: string
}
 
export function useArchive() {
  const [archives, setArchives] = useState<Archive[]>(mockArchives)
  const [allDiaries] = useState<Diary[]>(mockDiaries)
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null)
 
  const diaries = selectedArchiveId === null
    ? allDiaries
    : allDiaries.filter(d => d.archiveId === selectedArchiveId)
 
  const createArchive = (input: CreateArchiveInput) => {
    setArchives(prev => [...prev, { id: Date.now(), ...input, entryCount: 0 }])
  }
 
  return { archives, selectedArchiveId, setSelectedArchiveId, diaries, createArchive }
}

const mockArchives: Archive[] = [
  { id: 1, name: '일상',  icon: '☀️', color: '#ffb3c1', entryCount: 12 },
  { id: 2, name: '여행',  icon: '✈️', color: '#b3d9ff', entryCount: 5  },
  { id: 3, name: '영화',  icon: '🎬', color: '#e6b3ff', entryCount: 8  },
  { id: 4, name: '독서',  icon: '📚', color: '#ffe599', entryCount: 3  },
  { id: 5, name: '감사',  icon: '🌿', color: '#b3e5d4', entryCount: 7  },
]
 
const mockDiaries: Diary[] = [
  { id: 101, archiveId: 1, writtenAt: '2025-03-10', emoji: '☕', starRating: 4, mode: 'default', finalText: '', media: [] },
  { id: 102, archiveId: 1, writtenAt: '2025-03-14', emoji: '🌙', starRating: 3, mode: 'default', finalText: '', media: [] },
  { id: 103, archiveId: 1, writtenAt: '2025-03-20', emoji: '🌸', starRating: 5, mode: 'default', finalText: '', media: [] },
  { id: 201, archiveId: 2, writtenAt: '2025-01-05', emoji: '🌊', starRating: 5, mode: 'default', finalText: '', media: [] },
  { id: 202, archiveId: 2, writtenAt: '2025-01-08', emoji: '🏖️', starRating: 4, mode: 'default', finalText: '', media: [] },
  { id: 301, archiveId: 3, writtenAt: '2025-02-15', emoji: '🎭', starRating: 4, mode: 'default', finalText: '', media: [] },
  { id: 302, archiveId: 3, writtenAt: '2025-02-22', emoji: '🎞️', starRating: 5, mode: 'default', finalText: '', media: [] },
  { id: 303, archiveId: 3, writtenAt: '2025-03-01', emoji: '🌅', starRating: 3, mode: 'default', finalText: '', media: [] },
  { id: 401, archiveId: 4, writtenAt: '2025-03-05', emoji: '🌱', starRating: 4, mode: 'default', finalText: '', media: [] },
  { id: 402, archiveId: 4, writtenAt: '2025-03-18', emoji: '📖', starRating: 3, mode: 'default', finalText: '', media: [] },
  { id: 501, archiveId: 5, writtenAt: '2025-03-25', emoji: '✨', starRating: 5, mode: 'default', finalText: '', media: [] },
  { id: 502, archiveId: 5, writtenAt: '2025-03-28', emoji: '🌿', starRating: 4, mode: 'default', finalText: '', media: [] },
]