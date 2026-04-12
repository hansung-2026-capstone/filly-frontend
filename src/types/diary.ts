export interface Diary {
  id: number
  writtenAt: string // 'YYYY-MM-DD'
  mode: string
  finalText: string
  emoji: string
  starRating: number
  thumbnailUrl?: string
  media: { type: 'IMAGE' | 'VIDEO'; url: string }[]
  archiveId: number
}