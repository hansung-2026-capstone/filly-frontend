import { useState } from "react";
import { Sparkles } from "lucide-react";
import { usePersona } from "../hook/common/usePersona";
import { useMonthlyStat } from "../hook/common/useMonthlyStat";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { KeywordCloud } from "../components/KeywordCloud";
import { NotebookDetailModal } from "../components/NotebookDetailModal";
import { isFutureMonth } from "../lib/date";

const EMOTION_COLORS = [
  "var(--emotion-chart-1)",
  "var(--emotion-chart-2)",
  "var(--emotion-chart-3)",
  "var(--emotion-chart-4)",
  "var(--emotion-chart-5)",
  "var(--emotion-chart-6)",
];
const DAILY_PATTERN_EXCLUDED_VALUES = new Set([
  "언급없음",
  "없음",
  "false",
  "보통",
]);

function buildEmotionGradient(entries: [string, number][]) {
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return "var(--emotion-chart-empty)";

  let cursor = 0;
  const stops = entries.map(([, value], index) => {
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    const color = EMOTION_COLORS[index % EMOTION_COLORS.length];
    return `${color} ${start}% ${end}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}

function moveMonth(year: number, month: number, delta: number) {
  const nextDate = new Date(year, month - 1 + delta, 1);
  return {
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() + 1,
  };
}

function isMeaningfulPatternValue(value: string) {
  return !DAILY_PATTERN_EXCLUDED_VALUES.has(value.trim().toLowerCase());
}

export function StatsPage() {
  const { current, history, loading: personaLoading, error } = usePersona();
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedPersonaHistory, setSelectedPersonaHistory] = useState<
    (typeof history)[number] | null
  >(null);
  const { stat, loading: statLoading } = useMonthlyStat(
    selectedYear,
    selectedMonth
  );
  const emotionEntries = Object.entries(stat?.emotionDistribution ?? {})
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a);
  const dailyPatternEntries = Object.entries(stat?.dailyPattern ?? {})
    .flatMap(([day, times]) =>
      Object.entries(times)
        .filter(([time, count]) => count > 0 && isMeaningfulPatternValue(time))
        .map(([time, count]) => ({
          label: `${day} ${time}`,
          count,
        })),
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const personalPatternEntries = Object.entries(
    stat?.dailyPattern?.personalPatternCandidates ??
      stat?.personalPatternCandidates ??
      {},
  )
    .filter(([label, count]) => label.trim() && count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  const monthlyPatternEntries =
    personalPatternEntries.length > 0
      ? personalPatternEntries.map(([label]) => ({ label }))
      : dailyPatternEntries.map(({ label, count }) => ({
          label: `${label} ${count}회`,
        }));
  const nextMonth = moveMonth(selectedYear, selectedMonth, 1);
  const handlePreviousMonth = () => {
    const previous = moveMonth(selectedYear, selectedMonth, -1);
    setSelectedYear(previous.year);
    setSelectedMonth(previous.month);
  };
  const handleNextMonth = () => {
    if (isFutureMonth(nextMonth.year, nextMonth.month)) return;

    setSelectedYear(nextMonth.year);
    setSelectedMonth(nextMonth.month);
  };

  return (
    <div className="flex h-auto w-full flex-col font-['Nanum_Myeongjo'] md:h-full md:flex-row">
      {/* Left page - Persona */}
      <div className="flex h-auto flex-col gap-2 px-4 py-4 md:h-full md:max-h-[680px] md:flex-1 md:overflow-hidden md:px-5 md:py-3">
        <div className="flex items-center justify-between pb-2 border-b border-border-light flex-shrink-0">
          <div className="text-base font-bold text-[var(--text-stats-heading)] tracking-wide">
            페르소나
          </div>
          <div
            aria-hidden="true"
            className="invisible h-7 w-[116px] rounded-md border border-border-light"
          />
        </div>

        <div className="flex flex-col md:min-h-0 md:flex-1">
          {/* Current persona card */}
          <div className="flex-shrink-0 mb-3.5">
            <div className="py-4 px-4 bg-[var(--bg-stats-persona)] rounded-[10px] flex flex-col gap-2">
              <div className="flex items-center gap-1 text-[12px] text-[var(--text-white-muted)] tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[var(--text-white-soft)]" />
                <span>페르소나 리포트</span>
              </div>
              {personaLoading ? (
                <>
                  <div className="h-5 w-3/4 bg-[var(--bg-stats-panel)] rounded animate-pulse" />
                  <div className="h-10 w-full bg-[var(--bg-white-skeleton-soft)] rounded animate-pulse" />
                </>
              ) : (
                <>
                  <div className="text-[16px] text-white font-bold leading-[1.4]">
                    {current?.title ?? "아직 생성된 페르소나가 없어요"}
                  </div>
                  <div className="text-[12px] text-[var(--text-white-strong)] leading-[1.7]">
                    {current?.summary ??
                      "최근 30일 일기 5개 이상 작성 후 7일이 지나면 자동으로 페르소나가 생성됩니다."}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* History */}
          <div className="flex flex-none flex-col gap-1.5 md:flex-1 md:overflow-y-auto">
            <div className="text-[12px] tracking-[2px] text-[var(--text-page-label)] uppercase mb-0.5">
              페르소나 히스토리
            </div>

            {personaLoading ? (
              <div className="flex gap-2 overflow-x-auto md:block md:space-y-1.5 md:overflow-visible">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex w-[150px] flex-shrink-0 items-center gap-2.5 rounded-md bg-[var(--bg-stats-row)] px-2.5 py-2
                      border border-[var(--border-faint)] md:w-full"
                  >
                    <div className="h-9 w-2 flex-shrink-0 rounded bg-[var(--bg-hover-soft)] animate-pulse" />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="h-3 w-2/3 rounded bg-[var(--bg-hover-soft)] animate-pulse" />
                      <div className="h-2 w-1/3 rounded bg-[var(--bg-hover-soft)] animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-6 px-3 text-center text-[12px] leading-[1.6] text-text-muted bg-bg-beige-subtle border border-border-light rounded-md">
                페르소나 기록을 불러오지 못했어요.
              </div>
            ) : history.length === 0 ? (
              <div className="py-6 px-3 text-center text-[12px] leading-[1.6] text-text-muted bg-bg-beige-subtle border border-border-light rounded-md">
                아직 생성된 페르소나 기록이 없어요.
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto md:block md:space-y-1.5 md:overflow-visible">
                {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPersonaHistory(item)}
                      className="flex w-[150px] flex-shrink-0 items-start gap-2.5 rounded-md bg-[var(--bg-stats-row)] px-2.5 py-2
                        border border-[var(--border-faint)] text-left transition-colors hover:bg-bg-hover md:w-full"
                    >
                      <div
                        className="h-9 w-2 flex-shrink-0 rounded"
                        style={{ background: item.color }}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="truncate text-[12px] text-text-muted">
                          {item.title}
                        </div>
                        <div className="text-[12px] text-text-secondary">
                          {item.generatedAtLabel}
                        </div>
                        <div className="line-clamp-2 whitespace-pre-line text-[12px] leading-[1.45] text-text-dark-muted">
                          {item.summary}
                        </div>
                      </div>
                    </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right page - Stats */}
      <div className="flex h-auto flex-col gap-3 border-t border-border-light px-4 py-4 md:h-full md:max-h-[680px] md:flex-1 md:gap-2 md:overflow-hidden md:border-t-0 md:px-5 md:py-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-2 border-b border-border-light flex-shrink-0">
          <div className="text-base font-bold text-[var(--text-stats-heading)] tracking-wide">
            월간 리포트
          </div>
          <div className="flex items-center rounded-md border border-border-light overflow-hidden">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="w-7 h-7 border-none text-[14px] text-text-muted hover:bg-bg-hover transition-colors"
              aria-label="이전 달"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => setShowMonthPicker(true)}
              className="px-2 py-0.5 border-x border-border-light text-[12px] text-text-muted hover:bg-bg-hover transition-colors"
            >
              {selectedYear}년 {selectedMonth}월
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isFutureMonth(nextMonth.year, nextMonth.month)}
              className="w-7 h-7 border-none text-[14px] text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              aria-label="다음 달"
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3.5 md:flex-row md:gap-5 md:flex-shrink-0">
          <div className="grid w-full grid-cols-3 gap-2 md:w-[110px] md:flex md:flex-col md:gap-3.5">
            <div className="h-[88px] w-full rounded-lg border border-border-medium bg-bg-beige-subtle overflow-hidden flex flex-col items-center justify-center gap-1">
              <span className="text-[12px] tracking-[1.5px] text-text-secondary">
                일기 개수
              </span>
              <span className="text-[22px] text-[var(--text-stats-primary)]">
                {statLoading ? "..." : `${stat?.diaryCount ?? 0}개`}
              </span>
            </div>

            <div className="h-[88px] w-full rounded-lg border border-border-medium bg-bg-beige-subtle overflow-hidden flex flex-col items-center justify-center gap-1">
              <span className="text-[12px] tracking-[1.5px] text-text-secondary">
                글자 수
              </span>
              <span className="text-[22px] text-[var(--text-stats-primary)]">
                {statLoading ? "..." : `${(stat?.totalChars ?? 0).toLocaleString()}자`}
              </span>
            </div>

            <div className="h-[88px] w-full rounded-lg border border-border-medium bg-bg-beige-subtle overflow-hidden flex flex-col items-center justify-center gap-1 px-2">
              <span className="whitespace-nowrap text-[12px] tracking-[0.5px] text-text-secondary md:tracking-[1.5px]">
                자주 나온 사람
              </span>
              <span className="text-[18px] text-[var(--text-stats-primary)] text-center truncate max-w-full">
                {statLoading ? "..." : stat?.topPeople?.[0] ?? "없음"}
              </span>
            </div>
          </div>

          <div className="h-auto min-h-[260px] flex-1 rounded-lg border border-border-medium bg-bg-beige-subtle p-5 md:h-[292px] md:overflow-hidden">
            <div className="text-[18px] text-[var(--text-stats-primary)] mb-8">
              감정 분포
            </div>

            {statLoading ? (
              <div className="flex flex-col items-center justify-center gap-5 md:flex-row md:gap-9">
                <div className="w-[125px] h-[125px] rounded-full bg-[var(--bg-stats-skeleton)] animate-pulse" />
                <div className="w-[110px] flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-3 rounded bg-[var(--bg-stats-skeleton)] animate-pulse" />
                  ))}
                </div>
              </div>
            ) : emotionEntries.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5 md:flex-row md:gap-9">
                <div
                  className="w-[125px] h-[125px] rounded-full relative flex-shrink-0"
                  style={{ background: buildEmotionGradient(emotionEntries) }}
                >
                  <div className="absolute inset-[18px] rounded-full bg-notebook-page" />
                </div>
                <div className="w-[110px] flex flex-col gap-2">
                  {emotionEntries.slice(0, 5).map(([emotion, value], index) => (
                    <div key={emotion} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background: EMOTION_COLORS[index % EMOTION_COLORS.length],
                          }}
                        />
                        <span className="text-[12px] text-[var(--text-stats-muted)] truncate">
                          {emotion}
                        </span>
                      </div>
                      <span className="text-[12px] text-text-primary">
                        {value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-center">
                <span className="text-[13px] leading-[1.7] text-[var(--text-soft-label)]">
                  아직 감정 기록이 없어요.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="min-h-[144px] rounded-lg border border-border-medium bg-bg-beige-subtle p-4 md:h-[144px] md:flex-shrink-0 md:overflow-hidden">
          <div className="text-[16px] text-[var(--text-stats-primary)] mb-2">
            키워드 클라우드
          </div>
          <div>
            {statLoading ? (
              <div className="h-[88px] rounded-lg bg-[var(--bg-stats-skeleton)] animate-pulse" />
            ) : (
              <KeywordCloud
                keywords={stat?.keywordCloud ?? null}
                height={88}
                framed={false}
                emptyClassName="text-[12px] text-[var(--text-soft-label)]"
              />
            )}
          </div>
        </div>
        <div className="min-h-[156px] rounded-lg border border-border-medium bg-bg-beige-subtle p-4 md:h-[156px] md:flex-shrink-0 md:overflow-hidden">
          <div className="text-[16px] text-[var(--text-stats-primary)] mb-3">
            이번 달 나의 패턴
          </div>
          <div className="flex flex-col gap-2">
            {statLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 rounded bg-[var(--bg-stats-skeleton)] animate-pulse" />
              ))
            ) : monthlyPatternEntries.length > 0 ? (
              monthlyPatternEntries.map(({ label }) => (
                <div key={label} className="flex items-start gap-2 text-[12px]">
                  <span className="mt-[0.45em] h-1 w-1 flex-shrink-0 rounded-full bg-[var(--text-stats-primary)]" />
                  <span className="line-clamp-2 leading-[1.55] text-[var(--text-stats-muted)]">
                    {label}
                  </span>
                </div>
              ))
            ) : (
              <span className="h-[72px] flex items-center justify-center text-center text-[12px] text-[var(--text-soft-label)]">
                아직 발견된 패턴이 없어요.
              </span>
            )}
          </div>
        </div>
      </div>

      <MonthPickerModal
        isOpen={showMonthPicker}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onSelect={(year, month) => {
          setSelectedYear(year);
          setSelectedMonth(month);
        }}
        onClose={() => setShowMonthPicker(false)}
      />

      <NotebookDetailModal
        isOpen={selectedPersonaHistory !== null}
        onClose={() => setSelectedPersonaHistory(null)}
        accent={selectedPersonaHistory?.color ?? "var(--bg-stats-persona)"}
        eyebrow="Persona Report"
        title={selectedPersonaHistory?.title ?? ""}
        meta={selectedPersonaHistory?.generatedAtLabel}
        widthClassName="w-[390px] max-w-[calc(100vw-32px)]"
      >
        <div className="space-y-4">
          <div className="rounded-[16px] border border-border-light bg-bg-beige-subtle px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[11px] tracking-[1.6px] text-[var(--text-page-label)] uppercase">
                요약
              </span>
              <span className="rounded-full border border-border-light bg-bg-page px-2 py-0.5 text-[10px] text-text-secondary">
                {selectedPersonaHistory?.generatedAtLabel}
              </span>
            </div>
            <div className="whitespace-pre-line text-[13px] leading-[1.85] text-text-muted">
              {selectedPersonaHistory?.summary}
            </div>
          </div>
        </div>
      </NotebookDetailModal>
    </div>
  );
}
