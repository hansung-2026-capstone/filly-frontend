import { Check } from "lucide-react";
import {
  BACKGROUND_THEME_PRESETS,
  getBackgroundThemeId,
  type BackgroundThemeId,
} from "../lib/backgroundTheme";
import { useCurrentUser } from "../hook/common/useCurrentUser";
import { useUpdateBackgroundTheme } from "../hook/common/useUpdateBackgroundTheme";
import { useState } from "react";

function getThemeCardClass(isSelected: boolean) {
  return `rounded-xl border px-3 py-3 text-left transition-all ${
    isSelected
      ? "border-[var(--border-input-strong)] bg-bg-active shadow-[var(--shadow-subtle)]"
      : "border-border-light bg-transparent hover:bg-bg-hover"
  }`;
}

export function SettingsThemeSection() {
  const { data: user, isLoading } = useCurrentUser();
  const { updateBackgroundTheme, saving, error, clearError } = useUpdateBackgroundTheme();
  const savedTheme = getBackgroundThemeId(user?.backgroundTheme);
  const [draftTheme, setDraftTheme] = useState<BackgroundThemeId | null>(null);
  const selectedTheme = draftTheme ?? savedTheme;
  const isDirty = draftTheme !== null && draftTheme !== savedTheme;

  const selectTheme = (themeId: BackgroundThemeId) => {
    clearError();
    setDraftTheme(themeId);
  };

  const saveTheme = async () => {
    if (!isDirty || saving) return;

    await updateBackgroundTheme(selectedTheme)
      .then(() => setDraftTheme(null))
      .catch(() => undefined);
  };

  return (
    <section className="w-full pt-6" aria-label="테마 선택">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-bold tracking-[1px] text-text-muted">
            테마
          </h3>
          <p className="mt-1 text-[11px] leading-[1.6] text-text-secondary">
            노트북의 배경과 종이 분위기를 골라요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void saveTheme()}
          disabled={!isDirty || saving || isLoading}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--bg-strong-control)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-white-soft)] transition-colors hover:bg-[var(--bg-strong-control-hover)] disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Check className="w-3 h-3" aria-hidden="true" />
          {saving ? "저장 중" : "저장"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {BACKGROUND_THEME_PRESETS.map((theme) => {
          const isSelected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => selectTheme(theme.id)}
              className={getThemeCardClass(isSelected)}
              aria-pressed={isSelected}
            >
              <span className="mb-3 flex gap-1.5" aria-hidden="true">
                {theme.swatches.map((swatch) => (
                  <span
                    key={swatch}
                    className="h-5 flex-1 rounded-full border border-border-light"
                    style={{ background: swatch }}
                  />
                ))}
              </span>
              <span className="block text-[11px] font-bold text-text-strong">
                {theme.label}
              </span>
              <span className="mt-1 block text-[10px] leading-[1.5] text-text-secondary">
                {theme.description}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 text-[11px] font-bold text-[var(--text-error)]">
          {error}
        </p>
      )}
    </section>
  );
}
