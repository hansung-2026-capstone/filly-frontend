import { useState } from 'react'
import type { Archive } from '../types/archive'
import type { Diary } from '../types/diary'
 
interface CreateArchiveInput {
  name: string
  icon: string | null
  color: string
}
 
export function useArchive() {
  const [archives, setArchives] = useState<Archive[]>([])
  const [allDiaries] = useState<Diary[]>([])
  const [selectedArchiveId, setSelectedArchiveId] = useState<number | null>(null)
 
  const diaries = selectedArchiveId === null
    ? allDiaries
    : allDiaries.filter(d => d.archiveId === selectedArchiveId)
 
  const createArchive = (input: CreateArchiveInput) => {
    setArchives(prev => [...prev, { id: Date.now(), ...input, entryCount: 0 }])
  }
 
  return { archives, selectedArchiveId, setSelectedArchiveId, diaries, createArchive }
}