export interface Diary {
  id: number
  writtenAt: string // 'YYYY-MM-DD'
  mode: string
  finalText: string
  emoji: string
  starRating: number
  mediaUrls: string[]
  archiveId: number
}