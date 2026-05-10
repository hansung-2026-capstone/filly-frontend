import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Download, Check } from "lucide-react";
import { toPng } from "html-to-image";
import {
  getRecommendationHistory,
  revealRecommendationCard,
  shuffleRecommendationDraw,
  startRecommendationDraw,
} from "../api/recommendation";
import { useIdCard } from "../hook/common/useIdCard";
import { useReceipt } from "../hook/common/useReceipt";
import { useMonthlyStat } from "../hook/common/useMonthlyStat";
import { IdCard, IdCardSkeleton } from "../components/IdCard";
import { Receipt, ReceiptSkeleton } from "../components/Receipt";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { KeywordCloud } from "../components/KeywordCloud";
import type {
  RecommendationDetail,
  RecommendationDraw,
} from "../types/recommendation";

const CARD_COUNT = 3;
const CARD_RESET_DURATION_MS = 700;
const SHUFFLE_DURATION_MS = 950;
const SHUFFLE_REORDER_DELAY_MS = 320;
const SHUFFLE_PATHS = [
  {
    x: ["0%", "66%", "134%", "72%", "116%", "28%", "0%"],
    y: [0, -14, 10, -8, 12, -4, 0],
  },
  {
    x: ["0%", "-46%", "58%", "-66%", "62%", "-24%", "0%"],
    y: [0, 12, -10, 14, -8, 6, 0],
  },
  {
    x: ["0%", "-66%", "-134%", "-72%", "-116%", "-28%", "0%"],
    y: [0, -10, 12, -14, 8, -6, 0],
  },
];
import { Portal } from "../components/Portal";

type CaptureTarget = "idCard" | "receipt" | "keywordCloud";

const captureTargetOptions: { id: CaptureTarget; label: string; description: string }[] = [
  { id: "idCard", label: "사원증", description: "ID Card" },
  { id: "receipt", label: "영수증", description: "Receipt" },
  { id: "keywordCloud", label: "키워드 클라우드", description: "Keyword Cloud" },
];

const initialCaptureTargetSelection: Record<CaptureTarget, boolean> = {
  idCard: false,
  receipt: false,
  keywordCloud: false,
};

const contentTypeLabels: Record<RecommendationDetail["contentType"], string> = {
  MOVIE: "영화",
  BOOK: "책",
  MUSIC: "음악",
  FOOD: "음식",
  PLACE: "장소",
  ADVICE: "조언",
};

function getCardOrder(draw: RecommendationDraw | null) {
  if (!draw) return Array.from({ length: CARD_COUNT }, (_, index) => index);

  return [...draw.cards]
    .sort((a, b) => a.position - b.position)
    .map((card) => card.cardId);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function RecommendPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [recommendationDraw, setRecommendationDraw] =
    useState<RecommendationDraw | null>(null);
  const [recommendationHistory, setRecommendationHistory] = useState<
    RecommendationDetail[]
  >([]);
  const [revealedRecommendations, setRevealedRecommendations] = useState<
    Record<number, RecommendationDetail>
  >({});
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [revealingCardId, setRevealingCardId] = useState<number | null>(null);
  const [cardOrder, setCardOrder] = useState(() => getCardOrder(null));
  const [recommendationLoading, setRecommendationLoading] = useState(true);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null,
  );
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPreparingShuffle, setIsPreparingShuffle] = useState(false);
  const [showCapturePicker, setShowCapturePicker] = useState(false);
  const [selectedCaptureTargets, setSelectedCaptureTargets] = useState(
    initialCaptureTargetSelection,
  );

  const { idCard, loading: idCardLoading } = useIdCard();
  const { receipt, loading: receiptLoading } = useReceipt(
    selectedYear,
    selectedMonth,
  );
  const { stat, loading: statLoading } = useMonthlyStat(selectedYear, selectedMonth);
  const [receiptAtBottom, setReceiptAtBottom] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);
  const receiptScrollRef = useRef<HTMLDivElement>(null);
  const receiptWrapRef = useRef<HTMLDivElement>(null);
  const keywordCloudRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;

    async function loadRecommendations() {
      setRecommendationLoading(true);
      setRecommendationError(null);

      try {
        const [draw, history] = await Promise.all([
          startRecommendationDraw(),
          getRecommendationHistory(),
        ]);

        if (ignore) return;

        const currentDrawDetails = history.filter(
          (item) => item.drawId === draw.drawId,
        );

        setRecommendationDraw(draw);
        setRecommendationHistory(history);
        setRevealedRecommendations(
          currentDrawDetails.reduce<Record<number, RecommendationDetail>>(
            (details, item) => ({
              ...details,
              [item.cardId]: item,
            }),
            {},
          ),
        );
        setCardOrder(getCardOrder(draw));
      } catch (error) {
        if (ignore) return;

        console.error("[recommendation] 추천 정보를 불러오지 못했어요.", error);
        setRecommendationError("추천 정보를 불러오지 못했어요.");
      } finally {
        if (!ignore) setRecommendationLoading(false);
      }
    }

    loadRecommendations();

    return () => {
      ignore = true;
    };
  }, []);

  function downloadPng(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function getCaptureTargetAvailability(target: CaptureTarget) {
    if (target === "idCard") return !idCardLoading && !!idCard;
    if (target === "receipt") return !receiptLoading && !!receipt;
    return !statLoading;
  }

  function toggleCaptureTarget(target: CaptureTarget) {
    if (!getCaptureTargetAvailability(target)) return;

    setSelectedCaptureTargets((targets) => ({
      ...targets,
      [target]: !targets[target],
    }));
  }

  function openCapturePicker() {
    setSelectedCaptureTargets(initialCaptureTargetSelection);
    setShowCapturePicker(true);
  }

  async function handleCapture(targets: CaptureTarget[]) {
    if (targets.length === 0) return;

    setCapturing(true);
    const prefix = `filly-${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

    const shouldCaptureReceipt = targets.includes("receipt");
    const receiptEl = shouldCaptureReceipt ? receiptScrollRef.current : null;
    const prevHeight = receiptEl?.style.height ?? "";
    const prevOverflow = receiptEl?.style.overflowY ?? "";
    if (receiptEl) {
      receiptEl.style.height = "auto";
      receiptEl.style.overflowY = "visible";
    }

    try {
      // 사원증: 첫 번째 자식(IdCard div, rounded-2xl)을 직접 캡처 → 투명 배경으로 라운딩 살림
      const idCardEl = idCardRef.current?.firstElementChild as HTMLElement | null;
      if (targets.includes("idCard") && idCardEl)
        downloadPng(
          await toPng(idCardEl, { pixelRatio: 2 }),
          `${prefix}-사원증.png`,
        );

      // 영수증: 펼쳐진 스크롤 컨테이너 전체 캡처
      if (shouldCaptureReceipt && receiptScrollRef.current)
        downloadPng(
          await toPng(receiptScrollRef.current, {
            backgroundColor: "var(--receipt-barcode-light)",
            pixelRatio: 2,
          }),
          `${prefix}-영수증.png`,
        );

      // 키워드 클라우드: 라운딩 영역만 캡처 → 투명 배경
      const cloudEl = keywordCloudRef.current?.firstElementChild as HTMLElement | null;
      if (targets.includes("keywordCloud") && cloudEl)
        downloadPng(
          await toPng(cloudEl, { pixelRatio: 2 }),
          `${prefix}-키워드클라우드.png`,
        );

      setShowCapturePicker(false);
    } catch (e) {
      console.error("[capture] 실패", e);
    } finally {
      if (receiptEl) {
        receiptEl.style.height = prevHeight;
        receiptEl.style.overflowY = prevOverflow;
      }
      setCapturing(false);
    }
  }

  function handleReceiptScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setReceiptAtBottom(scrollHeight - scrollTop - clientHeight < 8);
  }

  const currentRevealedCardId =
    recommendationDraw?.cards.find(
      (card) => card.revealed || revealedRecommendations[card.cardId],
    )?.cardId ?? null;

  function startShuffleMotion() {
    setIsShuffling(true);
    window.setTimeout(() => {
      setCardOrder((currentOrder) => [...currentOrder].sort(() => Math.random() - 0.5));
    }, SHUFFLE_REORDER_DELAY_MS);
    window.setTimeout(() => setIsShuffling(false), SHUFFLE_DURATION_MS);
  }

  async function handleRecommendationCardClick(cardId: number) {
    if (
      !recommendationDraw ||
      isShuffling ||
      isPreparingShuffle ||
      revealingCardId !== null
    ) {
      return;
    }

    if (currentRevealedCardId !== null && currentRevealedCardId !== cardId) {
      return;
    }

    if (revealedRecommendations[cardId]) {
      setSelectedCardId(cardId);
      return;
    }

    setSelectedCardId(cardId);
    setRevealingCardId(cardId);
    setRecommendationError(null);

    try {
      const detail = await revealRecommendationCard(
        recommendationDraw.drawId,
        cardId,
      );

      setRevealedRecommendations((currentDetails) => ({
        ...currentDetails,
        [cardId]: detail,
      }));
      setRecommendationHistory((currentHistory) => {
        const filteredHistory = currentHistory.filter(
          (item) =>
            item.drawId !== detail.drawId || item.cardId !== detail.cardId,
        );

        return [detail, ...filteredHistory];
      });
    } catch (error) {
      console.error("[recommendation] 추천 카드를 공개하지 못했어요.", error);
      setSelectedCardId(null);
      setRecommendationError("추천 카드를 공개하지 못했어요.");
    } finally {
      setRevealingCardId(null);
    }
  }

  function handleRecommendationHistoryClick(item: RecommendationDetail) {
    if (item.drawId !== recommendationDraw?.drawId) return;

    setRevealedRecommendations((currentDetails) => ({
      ...currentDetails,
      [item.cardId]: item,
    }));
    setSelectedCardId(item.cardId);
  }

  async function handleShuffleCards() {
    if (
      !recommendationDraw ||
      isShuffling ||
      isPreparingShuffle ||
      revealingCardId !== null
    ) {
      return;
    }

    setRecommendationError(null);
    const previousRevealedRecommendations = revealedRecommendations;
    const previousSelectedCardId = selectedCardId;

    if (selectedCardId !== null) {
      setIsPreparingShuffle(true);
      setSelectedCardId(null);
      await wait(CARD_RESET_DURATION_MS);
      setIsPreparingShuffle(false);
    }

    try {
      const nextDraw = await shuffleRecommendationDraw(recommendationDraw.drawId);
      setRevealedRecommendations({});
      setRecommendationDraw(nextDraw);
      setCardOrder(getCardOrder(nextDraw));
      setSelectedCardId(null);
      startShuffleMotion();
    } catch (error) {
      console.error("[recommendation] 추천 카드를 섞지 못했어요.", error);
      setRevealedRecommendations(previousRevealedRecommendations);
      setSelectedCardId(previousSelectedCardId);
      setRecommendationError("추천 카드를 섞지 못했어요.");
    }
  }

  const selectedTargets = captureTargetOptions
    .filter(({ id }) => selectedCaptureTargets[id] && getCaptureTargetAvailability(id))
    .map(({ id }) => id);

  const hasDownloadableContent = captureTargetOptions.some(({ id }) =>
    getCaptureTargetAvailability(id),
  );

  return (
    <>
      <div className="flex w-full h-full font-['Nanum_Myeongjo']">
        {/* Left page - 추천 */}
        <div className="flex-1 flex flex-col py-3 px-3 gap-3 overflow-y-auto">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between pb-2.5 border-b border-border-light mb-1 flex-shrink-0">
              <div className="text-sm text-[var(--text-stats-heading)] tracking-wide">
                추천 컨텐츠
              </div>
              <div
                aria-hidden="true"
                className="invisible px-2 py-0.5 rounded border border-border-light text-[10px]"
              >
                카드 섞기
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 min-h-0 pt-5">
              <div className="flex flex-col gap-4 flex-shrink-0">
                <div className="flex h-[232px] w-full gap-3 px-2">
                  {cardOrder.map((cardId, slotIndex) => {
                    const card = recommendationDraw?.cards.find(
                      (item) => item.cardId === cardId,
                    );
                    const detail = revealedRecommendations[cardId];
                    const isSelected = selectedCardId === cardId;
                    const isRevealing = revealingCardId === cardId;
                    const isBlockedByRevealedCard =
                      currentRevealedCardId !== null &&
                      currentRevealedCardId !== cardId;
                    const isCardDisabled =
                      recommendationLoading ||
                      !recommendationDraw ||
                      isShuffling ||
                      isPreparingShuffle ||
                      isBlockedByRevealedCard ||
                      (revealingCardId !== null && !isRevealing);
                    const cardLabel = `추천 카드 ${card?.position ?? slotIndex + 1}`;

                    return (
                      <motion.div
                        layout
                        key={cardId}
                        role="button"
                        tabIndex={isCardDisabled ? -1 : 0}
                        onClick={() => {
                          if (!isCardDisabled) handleRecommendationCardClick(cardId);
                        }}
                        onKeyDown={(event) => {
                          if (isCardDisabled) return;
                          if (event.key !== "Enter" && event.key !== " ") return;

                          event.preventDefault();
                          handleRecommendationCardClick(cardId);
                        }}
                        aria-pressed={isSelected}
                        aria-disabled={isCardDisabled}
                        aria-label={cardLabel}
                        className={`group h-full flex-1 min-w-0 self-center text-left [perspective:1000px] focus:outline-none ${
                          isBlockedByRevealedCard ? "opacity-55" : ""
                        } ${
                          isCardDisabled ? "cursor-default" : "cursor-pointer"
                        }`}
                        animate={{
                          x: isShuffling ? SHUFFLE_PATHS[slotIndex].x : "0%",
                          y: isShuffling
                            ? SHUFFLE_PATHS[slotIndex].y
                            : 0,
                        }}
                        transition={{
                          x: {
                            duration: isShuffling ? SHUFFLE_DURATION_MS / 1000 : 0.5,
                            ease: [0.28, 0, 0.22, 1],
                          },
                          y: {
                            duration: isShuffling ? SHUFFLE_DURATION_MS / 1000 : 0.5,
                            ease: [0.28, 0, 0.22, 1],
                          },
                          layout: {
                            duration: 0.7,
                            ease: [0.4, 0, 0.2, 1],
                          },
                        }}
                        style={{ zIndex: isSelected ? 10 : 1 }}
                      >
                        <div
                          className={`relative left-1/2 top-1/2 transition-[height,width,transform] duration-700 [transform-style:preserve-3d] ${
                            isSelected ? "h-[348px] w-[150%]" : "h-full w-full"
                          }`}
                          style={{
                            transform: isSelected
                              ? "translate(-50%, -50%) rotateY(180deg)"
                              : "translate(-50%, -50%)",
                          }}
                        >
                          <div
                            className="absolute inset-0 overflow-hidden rounded-lg border border-border-medium bg-[var(--bg-card-back)] shadow-[var(--shadow-subtle)] transition-[box-shadow,background-color] duration-200 [backface-visibility:hidden] group-hover:bg-[var(--bg-card-back-hover)]"
                          >
                            <div className="absolute inset-0 opacity-25 paper-texture" />
                            <div className="absolute inset-3 rounded-md border border-[rgba(255,255,255,0.22)]" />
                            <div className="absolute inset-x-8 top-1/2 h-px bg-[rgba(255,255,255,0.24)]" />
                            <div className="absolute left-1/2 top-8 bottom-8 w-px bg-[rgba(255,255,255,0.18)]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[12px] tracking-[2px] text-[rgba(255,255,255,0.72)]">
                                {recommendationLoading ? "LOADING" : cardLabel}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`absolute inset-0 overflow-hidden rounded-lg border border-border-medium bg-[var(--archive-yellow)] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                              isSelected
                                ? "shadow-[0_18px_34px_rgba(0,0,0,0.2)]"
                                : "shadow-[var(--shadow-subtle)]"
                            }`}
                          >
                            <div className="absolute inset-0 opacity-20 paper-texture" />
                            <div className="absolute inset-3 rounded-md border border-[rgba(80,60,40,0.16)]" />
                            <div className="relative z-[1] flex h-full flex-col gap-2.5 overflow-hidden text-text-heading">
                              {isRevealing ? (
                                <div className="flex h-full items-center justify-center text-center text-[12px] leading-[1.7] text-text-muted">
                                  추천을 펼치는 중...
                                </div>
                              ) : detail ? (
                                <>
                                  <div className="flex items-center justify-between gap-2 text-[8.5px] tracking-[1.4px] text-text-secondary">
                                    <span className="truncate">
                                      {detail.category}
                                      {detail.subCategory
                                        ? ` / ${detail.subCategory}`
                                        : ""}
                                    </span>
                                    <span className="flex-shrink-0">
                                      {contentTypeLabels[detail.contentType]}
                                    </span>
                                  </div>
                                  <div className="line-clamp-2 text-[14px] font-bold leading-[1.35]">
                                    {detail.title}
                                  </div>
                                  <div className="line-clamp-4 text-[10.5px] leading-[1.6] text-text-muted">
                                    {detail.description}
                                  </div>
                                  <div className="mt-auto line-clamp-3 border-t border-[rgba(80,60,40,0.18)] pt-2 text-[9.5px] leading-[1.6] text-text-secondary">
                                    {detail.reason}
                                  </div>
                                  {detail.searchKeyword && (
                                    <div className="truncate text-[8px] text-text-secondary">
                                      #{detail.searchKeyword}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleShuffleCards();
                                    }}
                                    disabled={
                                      isShuffling ||
                                      isPreparingShuffle ||
                                      revealingCardId !== null
                                    }
                                    className="mt-1 self-center rounded-full border border-border-medium px-3 py-1 text-[9.5px] text-text-muted transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isShuffling || isPreparingShuffle
                                      ? "뽑는 중..."
                                      : "다른 카드 뽑기"}
                                  </button>
                                </>
                              ) : (
                                <div className="flex h-full items-center justify-center text-center text-[12px] leading-[1.7] text-text-muted">
                                  {isBlockedByRevealedCard ? (
                                    <>
                                      카드 섞기로
                                      <br />
                                      다음 추천을 만나보세요.
                                    </>
                                  ) : (
                                    <>
                                      카드를 선택하면
                                      <br />
                                      오늘의 추천이 열려요.
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 min-h-[180px] flex flex-col overflow-hidden pt-2 border-t border-border-light">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="text-[9px] tracking-[2px] text-[var(--text-page-label)] uppercase">
                    추천 히스토리
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  {recommendationLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-14 rounded-md border border-border-light bg-bg-beige-subtle animate-pulse"
                        />
                      ))}
                    </div>
                  ) : recommendationError && recommendationHistory.length === 0 ? (
                    <div className="h-full min-h-[116px] flex items-center justify-center rounded-lg border border-dashed border-border-dashed bg-bg-beige-subtle px-4 text-center">
                      <span className="text-[11px] leading-[1.7] text-text-muted">
                        {recommendationError}
                      </span>
                    </div>
                  ) : recommendationHistory.length === 0 ? (
                    <div className="h-full min-h-[116px] flex items-center justify-center rounded-lg border border-dashed border-border-dashed bg-bg-beige-subtle px-4 text-center">
                      <span className="text-[11px] leading-[1.7] text-text-muted">
                        아직 추천 기록이 없어요.
                        <br />
                        카드를 선택하면 히스토리가 이곳에 쌓일 예정이에요.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recommendationError && (
                        <div className="rounded-md border border-border-light bg-bg-beige-subtle px-3 py-2 text-[11px] leading-[1.5] text-text-muted">
                          {recommendationError}
                        </div>
                      )}
                      {recommendationHistory.map((item) => (
                        <button
                          key={`${item.drawId}-${item.cardId}`}
                          type="button"
                          onClick={() => handleRecommendationHistoryClick(item)}
                          className="w-full rounded-md border border-border-light bg-bg-beige-subtle px-3 py-2 text-left transition-colors hover:bg-bg-hover disabled:cursor-default disabled:hover:bg-bg-beige-subtle"
                          disabled={item.drawId !== recommendationDraw?.drawId}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1 truncate text-[11px] font-bold text-text-heading">
                              {item.title}
                            </div>
                            <div className="flex-shrink-0 text-[9px] text-text-secondary">
                              {contentTypeLabels[item.contentType]}
                            </div>
                          </div>
                          <div className="mt-1 line-clamp-2 text-[10px] leading-[1.45] text-text-muted">
                            {item.reason}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right page - 공유 컨텐츠 */}
        <div className="flex-1 flex flex-col py-3 px-3 gap-3 overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border-light mb-1 flex-shrink-0">
            <div className="text-sm text-[var(--text-stats-heading)] tracking-wide">
              공유용 컨텐츠 (Shared Content)
            </div>
            <button
              onClick={() => setShowMonthPicker(true)}
              className="px-2 py-0.5 rounded border border-border-light
              text-[11px] text-text-muted hover:bg-bg-hover transition-colors"
            >
              {selectedYear}년 {selectedMonth}월
            </button>
          </div>

          {/* 사원증 + 영수증 */}
          <div className="flex gap-2.5 flex-shrink-0">
            {/* 사원증 컬럼 */}
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[11px] tracking-[1.5px] text-text-secondary uppercase">
                사원증 <span className="normal-case">(ID Card)</span>
              </span>
              <div ref={idCardRef} className="flex-1">
                {idCardLoading ? (
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

            {/* 영수증 컬럼 */}
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[1.5px] text-text-secondary uppercase">
                  영수증 <span className="normal-case">(Receipt)</span>
                </span>
                {receipt && (
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="text-[11px] text-text-muted hover:text-text-strong transition-colors underline underline-offset-2"
                  >
                    전체보기
                  </button>
                )}
              </div>
              <div ref={receiptWrapRef} className="relative h-[280px]">
                <div
                  ref={receiptScrollRef}
                  className="h-full overflow-y-auto"
                  onScroll={handleReceiptScroll}
                >
                  {receiptLoading ? (
                    <ReceiptSkeleton />
                  ) : receipt ? (
                    <Receipt
                      receipt={receipt}
                      nickname={idCard?.nickname ?? ""}
                      year={selectedYear}
                      month={selectedMonth}
                    />
                  ) : null}
                </div>
                {/* 하단 페이드 — 끝까지 스크롤하면 사라짐 */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 transition-opacity duration-300"
                  style={{
                    opacity: receiptAtBottom ? 0 : 1,
                    background:
                      "linear-gradient(to bottom, transparent, var(--notebook-page))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 키워드 클라우드 */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <span className="text-[11px] tracking-[1.5px] text-text-secondary uppercase">
              키워드 클라우드{" "}
              <span className="normal-case">(Keyword Cloud)</span>
            </span>
            <div ref={keywordCloudRef}>
              <KeywordCloud keywords={stat?.keywordCloud ?? null} />
            </div>
          </div>

          {/* 캡처 버튼 */}
          <div className="flex justify-center flex-shrink-0">
            <button
              onClick={openCapturePicker}
              disabled={capturing || !hasDownloadableContent}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border-medium
                text-[11px] text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-50"
            >
              <Download className="w-3 h-3" />
              {capturing ? "캡처 중..." : "이미지 저장"}
            </button>
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

      {showCapturePicker && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-overlay backdrop-blur-[2px]"
            onClick={() => {
              if (!capturing) setShowCapturePicker(false);
            }}
          >
            <div
              className="w-[320px] rounded-xl bg-notebook-page shadow-[var(--shadow-modal)]
                overflow-hidden font-['Nanum_Myeongjo']"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <div>
                  <div className="text-[13px] text-text-heading tracking-wide">
                    저장할 이미지 선택
                  </div>
                  <div className="mt-0.5 text-[10px] text-text-secondary">
                    원하는 공유 컨텐츠만 다운로드돼요.
                  </div>
                </div>
                <button
                  onClick={() => setShowCapturePicker(false)}
                  disabled={capturing}
                  className="w-7 h-7 flex items-center justify-center rounded-md
                    hover:bg-bg-hover transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              <div className="p-4 space-y-2">
                {captureTargetOptions.map((option) => {
                  const checked = selectedCaptureTargets[option.id];
                  const disabled = !getCaptureTargetAvailability(option.id);

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleCaptureTarget(option.id)}
                      disabled={disabled || capturing}
                      aria-pressed={checked}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5
                        text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45
                        ${checked
                          ? "border-border-strong bg-bg-active text-text-heading"
                          : "border-border-medium bg-transparent text-text-muted hover:bg-bg-hover"
                        }`}
                    >
                      <span>
                        <span className="block text-[12px]">{option.label}</span>
                        <span className="block text-[10px] text-text-secondary">
                          {disabled ? "아직 준비 중이에요" : option.description}
                        </span>
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center
                          ${checked
                            ? "border-border-strong bg-bg-selected"
                            : "border-border-medium bg-bg-beige-subtle"
                          }`}
                      >
                        {checked && <Check className="w-3 h-3 text-text-heading" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 px-4 py-3 border-t border-border-light">
                <button
                  type="button"
                  onClick={() => setShowCapturePicker(false)}
                  disabled={capturing}
                  className="px-3 py-1.5 rounded-full border border-border-medium text-[11px]
                    text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleCapture(selectedTargets)}
                  disabled={capturing || selectedTargets.length === 0}
                  className="px-3 py-1.5 rounded-full border border-border-strong text-[11px]
                    text-text-heading bg-bg-active hover:bg-bg-active-hover transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {capturing ? "저장 중..." : "선택 저장"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 영수증 전체보기 모달 */}
      {showReceiptModal && receipt && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-overlay"
            onClick={() => setShowReceiptModal(false)}
          >
            <div
              className="relative z-[10000] flex flex-col w-[240px] max-h-[80vh] rounded-lg shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowReceiptModal(false)}
                className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center
              rounded-full bg-[var(--bg-black-subtle)] hover:bg-[var(--bg-black-subtle-hover)] transition-colors"
              >
                <X className="w-3.5 h-3.5 text-text-muted" />
              </button>
              <div className="overflow-y-auto">
                <Receipt
                  receipt={receipt}
                  nickname={idCard?.nickname ?? ""}
                  year={selectedYear}
                  month={selectedMonth}
                />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
