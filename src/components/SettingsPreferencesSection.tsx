import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useCurrentUser } from "../hook/common/useCurrentUser";
import { useUpdatePreferences } from "../hook/common/useUpdatePreferences";
import type {
  AgeGroupPreference,
  AiDraftTonePreference,
  GenderPreference,
  UserPreferencesUpdateRequest,
} from "../types/user";

const DEFAULT_PREFERENCE = "none";

const GENDER_OPTIONS: Array<{ value: GenderPreference; label: string }> = [
  { value: "none", label: "선택 안 함" },
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
];

const AGE_GROUP_OPTIONS: Array<{ value: AgeGroupPreference; label: string }> = [
  { value: "none", label: "선택 안 함" },
  { value: "10대", label: "10대" },
  { value: "20대", label: "20대" },
  { value: "30대", label: "30대" },
  { value: "40대", label: "40대" },
  { value: "50대", label: "50대" },
  { value: "60대", label: "60대" },
  { value: "70대 이상", label: "70대 이상" },
];

const AI_DRAFT_TONE_OPTIONS: Array<{ value: AiDraftTonePreference; label: string; description: string }> = [
  { value: "none", label: "기본", description: "특정 어투를 고정하지 않아요" },
  { value: "calm", label: "차분하게", description: "담담하고 안정적인 문장" },
  { value: "warm", label: "따뜻하게", description: "부드럽고 다정한 문장" },
  { value: "lively", label: "발랄하게", description: "가볍고 생동감 있는 문장" },
  { value: "literary", label: "문학적으로", description: "감각적인 표현이 있는 문장" },
  { value: "reflective", label: "성찰적으로", description: "생각을 깊게 정리하는 문장" },
];

function getOptionClass(isSelected: boolean) {
  return `rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
    isSelected
      ? "border-[var(--border-input-strong)] bg-bg-active text-text-control-strong"
      : "border-border-light bg-transparent text-text-secondary hover:bg-bg-hover"
  }`;
}

export function SettingsPreferencesSection() {
  const { data: user, isLoading } = useCurrentUser();
  const { updatePreferences, saving, error, clearError } = useUpdatePreferences();
  const [draft, setDraft] = useState<Partial<UserPreferencesUpdateRequest>>({});
  const currentPreferences = useMemo<UserPreferencesUpdateRequest>(() => ({
    gender: user?.gender ?? DEFAULT_PREFERENCE,
    ageGroup: user?.ageGroup ?? DEFAULT_PREFERENCE,
    aiDraftTone: user?.aiDraftTone ?? DEFAULT_PREFERENCE,
  }), [user?.ageGroup, user?.aiDraftTone, user?.gender]);
  const preferences: UserPreferencesUpdateRequest = {
    ...currentPreferences,
    ...draft,
  };
  const isDirty =
    preferences.gender !== currentPreferences.gender ||
    preferences.ageGroup !== currentPreferences.ageGroup ||
    preferences.aiDraftTone !== currentPreferences.aiDraftTone;

  const selectPreference = <Key extends keyof UserPreferencesUpdateRequest>(
    key: Key,
    value: UserPreferencesUpdateRequest[Key],
  ) => {
    clearError();
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  };

  const savePreferences = async () => {
    if (!isDirty || saving) return;

    await updatePreferences(preferences)
      .then(() => setDraft({}))
      .catch(() => undefined);
  };

  return (
    <section className="w-full pt-6" aria-label="AI 초안 스타일">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-bold tracking-[1px] text-text-muted">
            AI 초안 스타일
          </h3>
          <p className="mt-1 text-[11px] leading-[1.6] text-text-secondary">
            일기 초안을 만들 때 참고할 기본 정보를 설정해요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void savePreferences()}
          disabled={!isDirty || saving || isLoading}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--bg-strong-control)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-white-soft)] transition-colors hover:bg-[var(--bg-strong-control-hover)] disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <Check className="w-3 h-3" aria-hidden="true" />
          {saving ? "저장 중" : "저장"}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 text-[11px] font-bold text-text-strong">성별</div>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectPreference("gender", option.value)}
                className={getOptionClass(preferences.gender === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-bold text-text-strong">나이대</div>
          <div className="flex flex-wrap gap-2">
            {AGE_GROUP_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectPreference("ageGroup", option.value)}
                className={getOptionClass(preferences.ageGroup === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-[11px] font-bold text-text-strong">초안 어투</div>
          <div className="grid grid-cols-2 gap-2">
            {AI_DRAFT_TONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => selectPreference("aiDraftTone", option.value)}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                  preferences.aiDraftTone === option.value
                    ? "border-[var(--border-input-strong)] bg-bg-active"
                    : "border-border-light bg-transparent hover:bg-bg-hover"
                }`}
              >
                <span className="block text-[11px] font-bold text-text-strong">
                  {option.label}
                </span>
                <span className="mt-1 block text-[10px] leading-[1.5] text-text-secondary">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-[11px] font-bold text-[var(--text-error)]">
          {error}
        </p>
      )}
    </section>
  );
}
