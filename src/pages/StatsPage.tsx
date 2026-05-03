import { Sparkles } from "lucide-react";
import { usePersona } from "../hook/usePersona";

export function StatsPage() {
  const { current, history, loading, error } = usePersona();

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - Persona */}
      <div className="flex-1 flex flex-col py-4 px-4 pl-5 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Current persona card */}
          <div className="flex-shrink-0 mb-3.5">
            <div className="py-4 px-4 bg-[rgba(100,140,80,0.65)] rounded-[10px] flex flex-col gap-2">
              <div className="flex items-center gap-1 text-[10px] text-[rgba(255,255,255,0.75)] tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[rgba(255,255,255,0.7)]" />
                <span>페르소나 리포트</span>
              </div>
              {loading ? (
                <>
                  <div className="h-5 w-3/4 bg-[rgba(255,255,255,0.2)] rounded animate-pulse" />
                  <div className="h-10 w-full bg-[rgba(255,255,255,0.15)] rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-[15px] text-white font-bold leading-[1.4]">
                    {current?.title ?? "아직 생성된 페르소나가 없어요"}
                  </div>
                  <div className="text-[11px] text-[rgba(255,255,255,0.82)] leading-[1.7]">
                    {current?.summary ??
                      "최근 30일 일기 5개 이상 작성 후 7일이 지나면 자동으로 페르소나가 생성됩니다."}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* History */}
          <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
            <div className="text-[9px] tracking-[2px] text-[rgba(120,105,85,0.4)] uppercase mb-0.5">
              페르소나 히스토리
            </div>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 py-2 px-2.5 rounded-md bg-[rgba(160,140,120,0.04)] border border-[rgba(160,140,120,0.08)]"
                >
                  <div className="w-2 h-9 rounded flex-shrink-0 bg-[rgba(160,140,120,0.15)] animate-pulse" />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <div className="h-3 w-2/3 bg-[rgba(160,140,120,0.15)] rounded animate-pulse" />
                    <div className="h-2 w-1/3 bg-[rgba(160,140,120,0.1)] rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="py-6 px-3 text-center text-[11px] leading-[1.6] text-text-muted bg-bg-beige-subtle border border-border-light rounded-md">
                페르소나 기록을 불러오지 못했어요.
              </div>
            ) : history.length === 0 ? (
              <div className="py-6 px-3 text-center text-[11px] leading-[1.6] text-text-muted bg-bg-beige-subtle border border-border-light rounded-md">
                아직 생성된 페르소나 기록이 없어요.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 py-2 px-2.5 rounded-md bg-[rgba(160,140,120,0.04)]
                    border border-[rgba(160,140,120,0.08)]"
                >
                  <div
                    className="w-2 h-9 rounded flex-shrink-0"
                    style={{ background: item.color }}
                  />
                  <div className="flex flex-col gap-0.5">
                    <div className="text-[11px] text-[rgba(60,45,30,0.6)]">
                      {item.title}
                    </div>
                    <div className="text-[9px] text-[rgba(120,105,85,0.35)]">
                      {item.generatedAtLabel}
                    </div>
                    <div className="text-[9px] leading-[1.45] text-[rgba(80,60,40,0.48)] max-h-[40px] overflow-hidden">
                      {item.summary}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right page - Stats */}
      <div className="flex-1 h-full max-h-[680px] flex flex-col py-4 px-5 gap-3.5 overflow-hidden">
        <div className="flex gap-5 flex-shrink-0">
          <div className="w-[110px] flex flex-col gap-3.5">
            <div className="h-[88px] border border-[rgba(70,95,45,0.35)] rounded-md bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
              <span className="text-[21px] text-[rgba(60,45,30,0.65)]">개수</span>
            </div>

            <div className="h-[88px] border border-[rgba(70,95,45,0.35)] rounded-md bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
              <span className="text-[21px] text-[rgba(60,45,30,0.65)]">글자수</span>
            </div>

            <div className="h-[88px] border border-[rgba(70,95,45,0.35)] rounded-md bg-[rgba(255,255,255,0.2)] flex items-center justify-center">
              <span className="text-[21px] text-[rgba(60,45,30,0.65)]">사람</span>
            </div>
          </div>

          <div className="flex-1 h-[292px] border border-[rgba(70,95,45,0.35)] rounded-md bg-[rgba(255,255,255,0.2)] p-5">
            <div className="text-[18px] text-[rgba(60,45,30,0.72)] mb-9">
              감정 - 그래프
            </div>

            <div className="flex items-center justify-center gap-9">
              <div className="w-[125px] h-[125px] rounded-full border-[14px] border-[rgba(70,95,45,0.25)]" />
            </div>
          </div>
        </div>

        <div className="h-[154px] flex-shrink-0 border border-[rgba(70,95,45,0.35)] rounded-md bg-[rgba(255,255,255,0.2)]">
          <span className="text-[21px] text-[rgba(60,45,30,0.65)]">클라우드 키워드</span>
        </div>
        <div className="h-[154px] flex-shrink-0 border border-[rgba(70,95,45,0.35)] rounded-md bg-[rgba(255,255,255,0.2)]">
          <span className="text-[21px] text-[rgba(60,45,30,0.65)]">일상 패턴</span>
        </div>
      </div>
    </div>
  );
}
