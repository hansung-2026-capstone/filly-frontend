export interface Diary {
  id: number
  writtenAt: string // 'YYYY-MM-DD'
  rawContent?: string
  emoji: string
  starRating: number
  mediaUrls: string[]
  archiveId?: number
}
