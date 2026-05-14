export type GenderPreference = "male" | "female" | "none"

export type AgeGroupPreference =
  | "10대"
  | "20대"
  | "30대"
  | "40대"
  | "50대"
  | "60대"
  | "70대 이상"
  | "none"

export type AiDraftTonePreference =
  | "calm"
  | "warm"
  | "lively"
  | "literary"
  | "reflective"
  | "none"

export interface UserPreferencesUpdateRequest {
  gender: GenderPreference
  ageGroup: AgeGroupPreference
  aiDraftTone: AiDraftTonePreference
}

export interface BackgroundThemeUpdateRequest {
  backgroundTheme: string
}

export interface User {
  id: number
  nickname: string
  currentAvatarUrl: string | null
  currentBgUrl: string | null
  backgroundTheme: string | null
  gender: GenderPreference
  ageGroup: AgeGroupPreference
  aiDraftTone: AiDraftTonePreference
  createdAt: string
}
