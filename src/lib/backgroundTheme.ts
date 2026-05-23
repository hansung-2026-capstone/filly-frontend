export const BACKGROUND_THEME_IDS = [
  "classic",
  "rose",
  "forest",
  "ocean",
] as const;

export type BackgroundThemeId = (typeof BACKGROUND_THEME_IDS)[number];

export interface BackgroundThemePreset {
  id: BackgroundThemeId;
  label: string;
  description: string;
  swatches: [string, string, string];
}

export const DEFAULT_BACKGROUND_THEME: BackgroundThemeId = "classic";
export const BACKGROUND_THEME_STORAGE_KEY = "background-theme";
export const BACKGROUND_THEME_PREVIEW_EVENT = "background-theme-preview";

export const BACKGROUND_THEME_PRESETS: BackgroundThemePreset[] = [
  {
    id: "classic",
    label: "클래식",
    description: "따뜻한 종이와 갈색 책상",
    swatches: [
      "var(--theme-preview-classic-1)",
      "var(--theme-preview-classic-2)",
      "var(--theme-preview-classic-3)",
    ],
  },
  {
    id: "rose",
    label: "로즈",
    description: "부드러운 분홍빛 노트",
    swatches: [
      "var(--theme-preview-rose-1)",
      "var(--theme-preview-rose-2)",
      "var(--theme-preview-rose-3)",
    ],
  },
  {
    id: "forest",
    label: "포레스트",
    description: "차분한 초록 숲 분위기",
    swatches: [
      "var(--theme-preview-forest-1)",
      "var(--theme-preview-forest-2)",
      "var(--theme-preview-forest-3)",
    ],
  },
  {
    id: "ocean",
    label: "오션",
    description: "맑고 시원한 푸른빛",
    swatches: [
      "var(--theme-preview-ocean-1)",
      "var(--theme-preview-ocean-2)",
      "var(--theme-preview-ocean-3)",
    ],
  },
];

export function getBackgroundThemeId(theme: string | null | undefined): BackgroundThemeId {
  return BACKGROUND_THEME_IDS.includes(theme as BackgroundThemeId)
    ? (theme as BackgroundThemeId)
    : DEFAULT_BACKGROUND_THEME;
}

export function getStoredBackgroundThemeId(): BackgroundThemeId | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme = localStorage.getItem(BACKGROUND_THEME_STORAGE_KEY);

  if (!storedTheme) {
    return null;
  }

  return BACKGROUND_THEME_IDS.includes(storedTheme as BackgroundThemeId)
    ? (storedTheme as BackgroundThemeId)
    : null;
}

export function setStoredBackgroundThemeId(backgroundTheme: BackgroundThemeId) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(BACKGROUND_THEME_STORAGE_KEY, backgroundTheme);
}

export function setPreviewBackgroundThemeId(
  backgroundTheme: BackgroundThemeId | null,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<BackgroundThemeId | null>(BACKGROUND_THEME_PREVIEW_EVENT, {
      detail: backgroundTheme,
    }),
  );
}
