import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { useCurrentUser } from "../hook/common/useCurrentUser";
import { useUpdateNickname } from "../hook/common/useUpdateNickname";
import { UserAvatar } from "./UserAvatar";

const NICKNAME_MAX_LENGTH = 10;

export function SettingsProfileSection() {
  const { data: user, isLoading } = useCurrentUser();
  const { updateNickname, saving, error, clearError } = useUpdateNickname();
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const nickname = user?.nickname ?? "이름 없음";
  const trimmedNickname = nicknameDraft.trim();
  const canSaveNickname =
    Boolean(trimmedNickname) && trimmedNickname !== nickname && !saving;

  useEffect(() => {
    if (isEditingNickname) inputRef.current?.focus();
  }, [isEditingNickname]);

  const startNicknameEdit = () => {
    setNicknameDraft(nickname);
    clearError();
    setIsEditingNickname(true);
  };

  const cancelNicknameEdit = () => {
    setNicknameDraft(nickname);
    clearError();
    setIsEditingNickname(false);
  };

  const saveNickname = async () => {
    if (!canSaveNickname) return;

    await updateNickname(trimmedNickname)
      .then(() => setIsEditingNickname(false))
      .catch(() => undefined);
  };

  const handleNicknameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") void saveNickname();
    if (event.key === "Escape") cancelNicknameEdit();
  };

  return (
    <section className="w-full border-b border-border-light pb-5" aria-label="사용자 프로필">
      <div className="flex items-center gap-4">
        <UserAvatar
          avatarUrl={user?.currentAvatarUrl ?? null}
          className="w-[72px] h-[72px]"
        />

        <div className="min-w-0 flex-1">
          <div className="text-[12px] tracking-[2px] text-[var(--text-page-label)] uppercase">
            사용자 프로필
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            {isEditingNickname ? (
              <input
                id="settings-nickname"
                ref={inputRef}
                value={nicknameDraft}
                onChange={(event) => setNicknameDraft(event.target.value)}
                onKeyDown={handleNicknameKeyDown}
                disabled={saving}
                maxLength={NICKNAME_MAX_LENGTH}
                placeholder="이름 입력"
                className="min-w-0 flex-1 border-0 border-b border-[var(--border-input-strong)] bg-transparent px-0 py-1 text-[16px] font-bold tracking-[0.5px] text-[var(--text-dark)] outline-none transition-colors placeholder:text-[var(--text-placeholder)] focus:border-[var(--border-input-focus-strong)] disabled:opacity-60"
              />
            ) : (
              <div className="min-w-0 flex-1 text-[16px] font-bold tracking-[0.5px] text-text-stronger truncate">
                {isLoading ? "···" : nickname}
              </div>
            )}

            {isEditingNickname ? (
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => void saveNickname()}
                  disabled={!canSaveNickname}
                  aria-label="닉네임 저장"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-strong-control)] text-[var(--text-white-soft)] transition-colors hover:bg-[var(--bg-strong-control-hover)] disabled:opacity-35 disabled:cursor-not-allowed"
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={cancelNicknameEdit}
                  disabled={saving}
                  aria-label="닉네임 수정 취소"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-text-control-muted transition-colors hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startNicknameEdit}
                disabled={isLoading}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-bg-hover px-3 py-1.5 text-[12px] font-bold text-text-control hover:bg-[var(--bg-hover-medium)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Pencil className="w-3 h-3" aria-hidden="true" />
                변경
              </button>
            )}
          </div>

          {error && isEditingNickname && (
            <p className="mt-1 text-[12px] font-bold text-[var(--text-error)]">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
