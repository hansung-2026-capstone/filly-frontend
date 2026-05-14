import { UserAvatar } from "./UserAvatar";

interface IdCardProps {
  avatarUrl: string;
  nickname: string;
  keywords: string[];
}

export function IdCard({ avatarUrl, nickname, keywords }: IdCardProps) {
  const visibleKeywords = keywords.slice(0, 3);

  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-border-medium shadow-medium">
      {/* 상단 헤더 */}
      <div className="bg-tab-recommend px-4 py-2.5 flex items-center justify-between">
        <span className="text-[15px] font-black tracking-[3px] text-tab-recommend-text">
          FILLY
        </span>
        <span className="text-[10px] font-bold tracking-[1.5px] text-tab-recommend-text opacity-70 uppercase">
          ID Card
        </span>
      </div>

      {/* 본문 */}
      <div className="bg-notebook-page flex flex-col items-center px-4 pt-4 pb-3 gap-3">
        {/* 아바타 */}
        <UserAvatar
          avatarUrl={avatarUrl}
          className="w-[72px] h-[72px] border-[3px] border-border-medium shadow-small"
        />

        {/* 닉네임 */}
        <div className="text-center">
          <div className="text-[14px] font-bold text-text-strong leading-tight">
            {nickname}
          </div>
          <div className="text-[10px] tracking-[2px] text-text-secondary uppercase mt-1">
            Member
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full border-t border-border-light" />

        {/* 취향 키워드 */}
        {visibleKeywords.length > 0 ? (
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[10px] tracking-[2px] text-text-secondary uppercase">
              취향 키워드
            </span>
            <div className="flex flex-wrap gap-1">
              {visibleKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-border-light text-text-muted bg-bg-beige-subtle"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[12px] text-text-secondary italic">
            신입 사원
          </span>
        )}
      </div>

      {/* 하단 바코드 */}
      <div className="bg-bg-beige-subtle px-4 py-2.5 flex flex-col items-center gap-1.5">
        <div className="flex items-end gap-[2px] h-4">
          {[
            3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1,
            2,
          ].map((h, i) => (
            <div
              key={i}
              className="w-[2px] bg-text-primary opacity-25"
              style={{ height: `${h * 20}%` }}
            />
          ))}
        </div>
        <span className="text-[10px] tracking-[2px] text-text-secondary">
          FL-2026-FILLY
        </span>
      </div>
    </div>
  );
}

export function IdCardSkeleton() {
  return (
    <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-border-medium">
      <div className="bg-tab-recommend opacity-60 h-9" />
      <div className="bg-notebook-page flex flex-col items-center px-4 pt-4 pb-3 gap-3">
        <div className="w-[72px] h-[72px] rounded-full bg-bg-hover animate-pulse" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-3 w-20 rounded bg-bg-hover animate-pulse" />
          <div className="h-2 w-10 rounded bg-bg-hover animate-pulse" />
        </div>
        <div className="w-full border-t border-border-light" />
        <div className="w-full flex flex-wrap gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-12 rounded-full bg-bg-hover animate-pulse"
            />
          ))}
        </div>
      </div>
      <div className="bg-bg-beige-subtle px-4 py-2.5 flex flex-col items-center gap-1.5">
        <div className="h-4 w-full rounded bg-bg-hover animate-pulse opacity-40" />
        <div className="h-2 w-14 rounded bg-bg-hover animate-pulse" />
      </div>
    </div>
  );
}
