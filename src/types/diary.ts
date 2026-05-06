export interface Diary {
  id: number
  writtenAt: string // 'YYYY-MM-DD'
  rawContent?: string
  emoji: string
  starRating: number
  mediaUrls: string[]
  archiveId?: number
}


export interface DiaryItem {
  id: number
  writtenAt: string
  emoji: string
  rawContent: string
  starRating: number
  mediaUrls: string[]
}
