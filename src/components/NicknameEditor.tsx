import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

interface NicknameEditorProps {
  initialNickname: string;
}

export function NicknameEditor({ initialNickname }: NicknameEditorProps) {
  const [nickname, setNickname] = useState(initialNickname);
  const [draft, setDraft] = useState(initialNickname);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleEdit = () => {
    setDraft(nickname);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    // TODO: 백엔드 연결 시 아래 주석을 해제하세요
    // const token = localStorage.getItem('accessToken');
    // await fetch('/api/user/nickname', {
    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({ nickname: trimmed }),
    // });

    setNickname(trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(nickname);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={20}
          className="w-[90px] text-xs text-[rgba(60,45,30,0.8)] bg-white/70 border border-[rgba(160,140,120,0.35)]
            rounded-md px-2 py-0.5 outline-none focus:border-[rgba(120,95,65,0.6)] tracking-[0.5px]
            font-['Nanum_Myeongjo'] transition-colors"
        />
        <button
          onClick={handleSave}
          className="w-5 h-5 flex items-center justify-center rounded-md bg-[rgba(100,80,55,0.08)]
            hover:bg-[rgba(100,80,55,0.18)] transition-colors"
        >
          <Check className="w-3 h-3 text-[rgba(80,60,40,0.7)]" />
        </button>
        <button
          onClick={handleCancel}
          className="w-5 h-5 flex items-center justify-center rounded-md bg-[rgba(100,80,55,0.08)]
            hover:bg-[rgba(100,80,55,0.18)] transition-colors"
        >
          <X className="w-3 h-3 text-[rgba(80,60,40,0.7)]" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 group">
      <span className="text-xs text-[rgba(80,60,40,0.7)] tracking-[0.5px] font-['Nanum_Myeongjo']">
        {nickname}
      </span>
      <button
        onClick={handleEdit}
        className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100
          transition-opacity hover:bg-[rgba(160,140,120,0.15)]"
      >
        <Pencil className="w-2.5 h-2.5 text-[rgba(120,100,75,0.6)]" />
      </button>
    </div>
  );
}
