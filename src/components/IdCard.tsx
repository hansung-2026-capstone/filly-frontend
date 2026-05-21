import { UserAvatar } from "./UserAvatar";

interface IdCardProps {
  avatarUrl: string;
  nickname: string;
  keywords: string[];
  variant?: "compact" | "story";
}

export function IdCard({
  avatarUrl,
  nickname,
  keywords,
  variant = "compact",
}: IdCardProps) {
  const visibleKeywords = keywords.slice(0, 3);
  const isStory = variant === "story";

  return (
    <div
      className={`paper-texture w-full flex flex-col rounded-2xl overflow-hidden border border-border-medium shadow-medium ${
        isStory ? "aspect-[9/16]" : "aspect-[5/7]"
      }`}
    >
      {/* 상단 헤더 */}
      <div
        className={`flex flex-none items-center justify-between bg-tab-recommend px-4 ${
          isStory ? "px-7 py-7" : "py-2.5"
        }`}
      >
        <span
          className={`font-black tracking-[3px] text-tab-recommend-text ${
            isStory ? "text-[28px]" : "text-[15px]"
          }`}
        >
          FILLY
        </span>
        <span
          className={`font-bold tracking-[1.5px] text-tab-recommend-text opacity-70 uppercase ${
            isStory ? "text-[17px]" : "text-[10px]"
          }`}
        >
          ID Card
        </span>
      </div>

      {/* 본문 */}
      <div
        className={`flex flex-col items-center bg-notebook-page ${
          isStory
            ? "flex-1 justify-center gap-9 px-9 py-10"
            : "flex-1 justify-center gap-3 px-4 pb-3 pt-4"
        }`}
      >
        {/* 아바타 */}
        <UserAvatar
          avatarUrl={avatarUrl}
          className={`border-[3px] border-border-medium ${
            isStory ? "h-[150px] w-[150px]" : "h-[72px] w-[72px]"
          } ${isStory ? "" : "shadow-small"}`}
          imageClassName={isStory ? "scale-100" : undefined}
          captureSafe={isStory}
        />

        {/* 닉네임 */}
        <div className="text-center">
          <div
            className={`font-bold text-text-strong leading-tight ${
              isStory ? "text-[30px]" : "text-[14px]"
            }`}
          >
            {nickname}
          </div>
          <div
            className={`tracking-[2px] text-text-secondary uppercase ${
              isStory ? "mt-4 text-[17px]" : "mt-1 text-[10px]"
            }`}
          >
            Member
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full border-t border-border-light" />

        {/* 취향 키워드 */}
        {visibleKeywords.length > 0 ? (
          <div
            className={`flex w-full flex-col ${
              isStory ? "items-center gap-5" : "gap-1.5"
            }`}
          >
            <span
              className={`tracking-[2px] text-text-secondary uppercase ${
                isStory ? "text-[17px]" : "text-[10px]"
              }`}
            >
              취향 키워드
            </span>
            <div
              className={`flex flex-wrap ${
                isStory ? "justify-center gap-3" : "gap-1"
              }`}
            >
              {visibleKeywords.map((kw, i) => (
                <span
                  key={i}
                  className={`whitespace-nowrap rounded-full border border-border-light bg-bg-beige-subtle leading-none text-text-muted ${
                    isStory
                      ? "px-5 py-2.5 text-[18px]"
                      : "px-2 py-0.5 text-[11px]"
                  }`}
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
      <div
        className={`flex flex-none flex-col items-center bg-bg-beige-subtle px-4 ${
          isStory ? "gap-5 py-10" : "gap-1.5 py-2.5"
        }`}
      >
        <div
          className={`flex items-end gap-[2px] ${isStory ? "h-8" : "h-4"}`}
        >
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
        <span
          className={`tracking-[2px] text-text-secondary ${
            isStory ? "text-[17px]" : "text-[10px]"
          }`}
        >
          FL-2026-FILLY
        </span>
      </div>
    </div>
  );
}

export function IdCardSkeleton() {
  return (
    <div className="paper-texture aspect-[5/7] w-full flex flex-col rounded-2xl overflow-hidden border border-border-medium">
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
