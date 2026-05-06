export interface IdCard {
  avatarUrl: string
  nickname: string
  keywords: string[]
}

export interface Receipt {
  orderNumber: string
  diaryCount: number
  totalChars: number
  emotionDistribution: Record<string, number>
  personaTitle: string | null
}
