import { useIdCard } from "../hook/useIdCard";
import { useReceipt } from "../hook/useReceipt";

export function RecommendPage() {
  const now = new Date();
  const { idCard, loading } = useIdCard();
  useReceipt(now.getFullYear(), now.getMonth() + 1);

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - 추천 */}
      <div className="flex-1 flex flex-col py-4 px-4 pl-5 overflow-y-auto" />

      {/* Right page - 공유 */}
      <div className="flex-1 flex flex-col items-center justify-center py-3.5 px-5 pl-6 overflow-y-auto">
        {loading ? (
          <IdCardSkeleton />
        ) : idCard ? (
          <IdCard
            avatarUrl={idCard.avatarUrl}
            nickname={idCard.nickname}
            keywords={idCard.keywords}
          />
        ) : null}
      </div>
    </div>
  );
}

interface IdCardProps {
  avatarUrl: string;
  nickname: string;
  keywords: string[];
}

function IdCard({ avatarUrl, nickname, keywords }: IdCardProps) {
  return (
    <div className="w-[185px] flex flex-col rounded-2xl overflow-hidden border border-border-medium shadow-medium">
      {/* 상단 헤더 */}
      <div className="bg-tab-recommend px-4 py-3 flex items-center justify-between">
        <span className="text-[15px] font-black tracking-[3px] text-tab-recommend-text">FILLY</span>
        <span className="text-[7px] font-bold tracking-[1.5px] text-tab-recommend-text opacity-60 uppercase">ID Card</span>
      </div>

      {/* 본문 */}
      <div className="bg-notebook-page flex flex-col items-center px-5 pt-5 pb-4 gap-3">
        {/* 아바타 */}
        <div className="w-[88px] h-[88px] rounded-full overflow-hidden border-[3px] border-border-medium bg-bg-hover flex items-center justify-center flex-shrink-0 shadow-small">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">👤</span>
          )}
        </div>

        {/* 닉네임 */}
        <div className="text-center">
          <div className="text-[15px] font-bold text-text-strong leading-tight">{nickname}</div>
          <div className="text-[8px] tracking-[2px] text-text-secondary uppercase mt-1">Member</div>
        </div>

        {/* 구분선 */}
        <div className="w-full border-t border-border-light" />

        {/* 취향 키워드 */}
        {keywords.length > 0 ? (
          <div className="w-full flex flex-col gap-1.5">
            <span className="text-[7px] tracking-[2px] text-text-secondary uppercase">취향 키워드</span>
            <div className="flex flex-wrap gap-1">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="text-[8px] px-2 py-0.5 rounded-full border border-border-light text-text-muted bg-bg-beige-subtle"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-text-secondary italic">신입 사원</span>
        )}
      </div>

      {/* 하단 바코드 영역 */}
      <div className="bg-bg-beige-subtle px-5 py-3 flex flex-col items-center gap-1.5">
        <div className="flex items-end gap-[2px] h-5">
          {[3,1,2,1,3,2,1,2,1,3,1,2,3,1,2,1,3,2,1,2,1,3,1,2].map((h, i) => (
            <div
              key={i}
              className="w-[2px] bg-text-primary opacity-25"
              style={{ height: `${h * 20}%` }}
            />
          ))}
        </div>
        <span className="text-[7px] tracking-[2px] text-text-secondary">FL-2026-FILLY</span>
      </div>
    </div>
  );
}

function IdCardSkeleton() {
  return (
    <div className="w-[185px] flex flex-col rounded-2xl overflow-hidden border border-border-medium">
      <div className="bg-tab-recommend opacity-60 px-4 py-3 h-10" />
      <div className="bg-notebook-page flex flex-col items-center px-5 pt-5 pb-4 gap-3">
        <div className="w-[88px] h-[88px] rounded-full bg-bg-hover animate-pulse" />
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-4 w-24 rounded bg-bg-hover animate-pulse" />
          <div className="h-2 w-12 rounded bg-bg-hover animate-pulse" />
        </div>
        <div className="w-full border-t border-border-light" />
        <div className="w-full flex flex-col gap-1.5">
          <div className="h-2 w-14 rounded bg-bg-hover animate-pulse" />
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-12 rounded-full bg-bg-hover animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-bg-beige-subtle px-5 py-3 flex flex-col items-center gap-1.5">
        <div className="h-5 w-full rounded bg-bg-hover animate-pulse opacity-40" />
        <div className="h-2 w-16 rounded bg-bg-hover animate-pulse" />
      </div>
    </div>
  );
}
