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

    // TODO: 백엔드 연결 시 아래 주석 해제
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

  return (
    <div className="relative flex flex-col items-center">
      {/* [보기 모드] */}
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

      {/* [수정 모드 - 팝오버] */}
      {isEditing && (
        <div 
          className="absolute top-5 -translate-y-1/2 left-0 z-[100] 
            flex items-center gap-2 p-1.5 px-2
            bg-[#fafaf8] border border-[rgba(160,140,120,0.3)] rounded-lg shadow-xl"
          style={{ width: '200px' }} 
        >
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={10}
            className="flex-1 min-w-0 text-[11px] text-[rgba(60,45,30,0.8)] bg-white border border-[rgba(160,140,120,0.2)]
              rounded px-2 py-1 outline-none focus:border-[rgba(120,95,65,0.5)] tracking-[0.5px]
              font-['Nanum_Myeongjo']"
          />
          
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSave}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-green-50 text-green-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancel}
              className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-50 text-red-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}