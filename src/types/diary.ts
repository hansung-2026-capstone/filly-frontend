export interface Diary {
  id: number
  writtenAt: string // 'YYYY-MM-DD'
  mode: string
  rawContent?: string
  emoji: string
  starRating: number
  mediaUrls: string[]
  archiveId?: number
}
