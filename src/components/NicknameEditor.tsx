import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { getMe, updateNickname } from "../api/user";

export function NicknameEditor() {
  const [nickname, setNickname] = useState("");
  const [draft, setDraft] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMe()
      .then((user) => {
        setNickname(user.nickname);
        setDraft(user.nickname);
      })
      .catch(() => {
        setNickname("이름 없음");
        setDraft("이름 없음");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleEdit = () => {
    setDraft(nickname);
    setError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === nickname || saving) return;

    setSaving(true);
    setError(null);

    try {
      await updateNickname(trimmed);
      setNickname(trimmed);
      setDraft(trimmed);
      setIsEditing(false);
    } catch {
      setError("닉네임을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(nickname);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="relative flex flex-col items-center w-full px-2">
      {/* 보기 모드 */}
      {!isEditing ? (
        <div
          onClick={handleEdit}
          className="group relative flex items-center justify-center cursor-pointer py-2 w-full rounded-lg transition-all"
        >
          {/* 닉네임 */}
          <span className="text-[15px] font-bold tracking-[1px] text-text-stronger font-['Nanum_Myeongjo'] transition-colors group-hover:text-[var(--text-dark)]">
            {loading ? "···" : nickname}
          </span>

          {/* 연필 아이콘  */}
          <div className="ml-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <Pencil className="w-3.5 h-3.5 text-text-stronger" />
          </div>
        </div>
      ) : (
        /* 수정 모드 */
        <div className="flex flex-col items-center w-full gap-2.5 py-1 animate-in fade-in duration-200">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={saving}
            maxLength={10}
            placeholder="이름 입력"
            className="w-full text-center text-[14px] font-medium text-[var(--text-dark)] bg-[var(--bg-editor-panel)] border-b-2 border-[var(--border-input-strong)] py-1.5 outline-none focus:border-[var(--border-input-focus-strong)] tracking-[0.5px] font-['Nanum_Myeongjo'] placeholder:text-[var(--text-placeholder)]"
          />

          {error && (
            <p className="text-[10px] font-bold text-red-500 leading-none">
              {error}
            </p>
          )}

          <div className="flex items-center justify-center gap-4 mt-1">
            <button
              onClick={handleSave}
              disabled={!draft.trim() || draft.trim() === nickname || saving}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-control-muted)] hover:text-[var(--text-control-strong)] transition-colors whitespace-nowrap disabled:opacity-35 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" /> {saving ? "저장 중" : "저장"}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-control-muted)] hover:text-[var(--text-control-strong)] transition-colors whitespace-nowrap opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-3.5 h-3.5" /> 취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
