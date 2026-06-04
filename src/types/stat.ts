export interface HabitDiscovery {
  category: string
  patternKey: string
  pattern: string
  count: number
  message: string
}

export interface MonthlyStat {
  recordMonth: string
  diaryCount: number
  totalChars: number
  emotionDistribution: Record<string, number>
  keywordCloud: Record<string, number>
  topPeople: string[]
  dailyPattern: Record<string, Record<string, number>>
  personalPatternCandidates?: Record<string, number>
  habitDiscoveries?: HabitDiscovery[]
}
