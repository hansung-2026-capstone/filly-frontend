export interface Diary {
  id: number
  writtenAt: string // 'YYYY-MM-DD'
  emoji: string
  starRating: number
  thumbnailUrl?: string
  archiveId: number
}