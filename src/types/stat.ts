export interface MonthlyStat {
  recordMonth: string
  diaryCount: number
  totalChars: number
  emotionDistribution: Record<string, number>
  keywordCloud: Record<string, number>
  topPeople: string[]
  dailyPattern: Record<string, Record<string, number>>
  personalPatternCandidates?: Record<string, number>
}
