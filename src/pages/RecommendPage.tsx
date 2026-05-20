import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, Check } from "lucide-react";
import { toPng } from "html-to-image";
import { isAxiosError } from "axios";
import tarotCardImage from "../assets/tarot/card.png";
import {
  getRecommendationHistory,
  revealRecommendationCard,
  shuffleRecommendationDraw,
  startRecommendationDraw,
} from "../api/recommendation";
import { useIdCard } from "../hook/common/useIdCard";
import { useReceipt } from "../hook/common/useReceipt";
import { useMonthlyStat } from "../hook/common/useMonthlyStat";
import { isFutureMonth } from "../lib/date";
import { IdCard, IdCardSkeleton } from "../components/IdCard";
import { Receipt, ReceiptSkeleton } from "../components/Receipt";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { KeywordCloud } from "../components/KeywordCloud";
import { NotebookDetailModal } from "../components/NotebookDetailModal";
import { Portal } from "../components/Portal";
import type {
  RecommendationDetail,
  RecommendationDraw,
} from "../types/recommendation";

const CARD_COUNT = 3;
const CARD_RESET_DURATION_MS = 700;
const CARD_RESET_SETTLE_BUFFER_MS = 120;
const SHUFFLE_MIN_VISIBLE_MS = 1200;
const SHUFFLE_STEP_DURATION_MS = 600;
const RECOMMENDATION_REQUEST_COOLDOWN_MS = 1800;

type CaptureTarget = "idCard" | "receipt" | "keywordCloud";
type CaptureResultFile = {
  id: string;
  file: File;
  name: string;
  url: string;
};

const captureTargetOptions: {
  id: CaptureTarget;
  label: string;
  description: string;
}[] = [
  { id: "idCard", label: "사원증", description: "ID Card" },
  { id: "receipt", label: "영수증", description: "Receipt" },
  {
    id: "keywordCloud",
    label: "키워드 클라우드",
    description: "Keyword Cloud",
  },
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

  return Array.from({ length: CARD_COUNT }, (_, index) => {
    const position = index + 1;
    return (
      draw.cards.find(
        (card) => card.position === position && !card.revealed,
      ) ?? draw.cards.find((card) => card.position === position)
    )?.cardId;
  }).filter((cardId): cardId is number => typeof cardId === "number");
}

function swapOrderByIndex(
  currentOrder: number[],
  firstIndex: number,
  secondIndex: number,
) {
  if (
    firstIndex < 0 ||
    secondIndex < 0 ||
    firstIndex >= currentOrder.length ||
    secondIndex >= currentOrder.length
  ) {
    return currentOrder;
  }

  const nextOrder = [...currentOrder];
  [nextOrder[firstIndex], nextOrder[secondIndex]] = [
    nextOrder[secondIndex],
    nextOrder[firstIndex],
  ];
  return nextOrder;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [metadata, data] = dataUrl.split(",");
  if (!metadata || !data) {
    throw new Error("이미지 데이터 형식이 올바르지 않아요.");
  }

  const mimeType = metadata.match(/data:([^;]+)/)?.[1] ?? "image/png";
  if (!metadata.includes(";base64")) {
    return new Blob([decodeURIComponent(data)], { type: mimeType });
  }

  const binary = window.atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mimeType });
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: blob.type || "image/png" });
}

function isShareCancel(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function getShareTitle(files: File[]) {
  return files.length === 1 ? files[0].name : "Filly 공유 컨텐츠";
}

function moveMonth(year: number, month: number, delta: number) {
  const nextDate = new Date(year, month - 1 + delta, 1);
  return {
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() + 1,
  };
}

function getRevealedDrawDetail(
  draw: RecommendationDraw,
  history: RecommendationDetail[],
) {
  const revealedCard = draw.cards.find((card) => card.revealed);
  if (!revealedCard) return null;

  return (
    history.find(
      (item) =>
        item.drawId === draw.drawId && item.cardId === revealedCard.cardId,
    ) ?? null
  );
}

function isDrawCardRevealed(
  draw: RecommendationDraw | null,
  cardId: number | null,
) {
  if (!draw || cardId === null) return false;

  return draw.cards.some((card) => card.cardId === cardId && card.revealed);
}

function markDrawCardRevealed(draw: RecommendationDraw, cardId: number) {
  return {
    ...draw,
    cards: draw.cards.map((card) =>
      card.cardId === cardId ? { ...card, revealed: true } : card,
    ),
  };
}

function getApiErrorMessage(error: unknown) {
  if (!isAxiosError(error)) return null;

  const data = error.response?.data;
  if (!data || typeof data !== "object" || !("message" in data)) return null;

  const message = data.message;
  return typeof message === "string" && message.trim() ? message : null;
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
  const [selectedRecommendationHistory, setSelectedRecommendationHistory] =
    useState<RecommendationDetail | null>(null);
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
  const [isShuffleLocked, setIsShuffleLocked] = useState(false);
  const [showCapturePicker, setShowCapturePicker] = useState(false);
  const [captureResultFiles, setCaptureResultFiles] = useState<
    CaptureResultFile[]
  >([]);
  const [selectedCaptureTargets, setSelectedCaptureTargets] = useState(
    initialCaptureTargetSelection,
  );

  const { idCard, loading: idCardLoading } = useIdCard();
  const { receipt, loading: receiptLoading } = useReceipt(
    selectedYear,
    selectedMonth,
  );
  const { stat, loading: statLoading } = useMonthlyStat(
    selectedYear,
    selectedMonth,
  );
  const [receiptAtBottom, setReceiptAtBottom] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);
  const receiptScrollRef = useRef<HTMLDivElement>(null);
  const receiptWrapRef = useRef<HTMLDivElement>(null);
  const keywordCloudRef = useRef<HTMLDivElement>(null);
  const lastRecommendationRequestAtRef = useRef(0);
  const isMountedRef = useRef(false);
  const shuffleIntervalRef = useRef<number | null>(null);

  function isRateLimitError(error: unknown) {
    return isAxiosError(error) && error.response?.status === 429;
  }

  function canRequestRecommendationNow() {
    return (
      Date.now() - lastRecommendationRequestAtRef.current >=
      RECOMMENDATION_REQUEST_COOLDOWN_MS
    );
  }

  function markRecommendationRequested() {
    lastRecommendationRequestAtRef.current = Date.now();
  }

  function clearShuffleInterval() {
    if (shuffleIntervalRef.current === null) return;

    window.clearInterval(shuffleIntervalRef.current);
    shuffleIntervalRef.current = null;
  }

  function getActiveRevealedCardId() {
    const [firstRevealedCardId] = Object.keys(revealedRecommendations);
    const activeCardId = firstRevealedCardId
      ? Number(firstRevealedCardId)
      : null;

    if (
      activeCardId === null ||
      !cardOrder.includes(activeCardId)
    ) {
      return null;
    }

    return activeCardId;
  }

  function isLockedByActiveCard(cardId: number) {
    const activeCardId = selectedCardId ?? getActiveRevealedCardId();
    return activeCardId !== null && activeCardId !== cardId;
  }

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearShuffleInterval();
    };
  }, []);

  useEffect(() => {
    const cardBackImage = new Image();
    cardBackImage.decoding = "async";
    cardBackImage.src = tarotCardImage;
    void cardBackImage.decode().catch(() => undefined);
  }, []);

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

        setRecommendationDraw(draw);
        setRecommendationHistory(history);
        const revealedDetail = getRevealedDrawDetail(draw, history);
        setRevealedRecommendations(
          revealedDetail ? { [revealedDetail.cardId]: revealedDetail } : {},
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

  useEffect(
    () => () => {
      captureResultFiles.forEach((file) => URL.revokeObjectURL(file.url));
    },
    [captureResultFiles],
  );

  function showCaptureResults(files: File[]) {
    setCaptureResultFiles((currentFiles) => {
      currentFiles.forEach((file) => URL.revokeObjectURL(file.url));

      return files.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        file,
        name: file.name,
        url: URL.createObjectURL(file),
      }));
    });
  }

  function closeCaptureResults() {
    setCaptureResultFiles((currentFiles) => {
      currentFiles.forEach((file) => URL.revokeObjectURL(file.url));
      return [];
    });
  }

  async function shareFiles(files: File[]) {
    if (typeof navigator.share !== "function") return "unsupported" as const;

    try {
      await navigator.share({
        files,
        title: getShareTitle(files),
      });
      return "shared" as const;
    } catch (error) {
      if (isShareCancel(error)) return "cancelled" as const;
      console.warn("[capture] 공유 실패", error);
      return "failed" as const;
    }
  }

  async function shareCaptureResult(files: File[]) {
    const result = await shareFiles(files);

    if (result === "shared") {
      closeCaptureResults();
      return;
    }
  }

  async function capturePngFile(
    element: HTMLElement,
    filename: string,
    options: Parameters<typeof toPng>[1],
  ) {
    const dataUrl = await toPng(element, options);
    return dataUrlToFile(dataUrl, filename);
  }

  async function captureElementAsShown(element: HTMLElement, filename: string) {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
    });
    return dataUrlToFile(dataUrl, filename);
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

  function handlePreviousMonth() {
    const next = moveMonth(selectedYear, selectedMonth, -1);
    setSelectedYear(next.year);
    setSelectedMonth(next.month);
  }

  const nextMonth = moveMonth(selectedYear, selectedMonth, 1);

  function handleNextMonth() {
    if (isFutureMonth(nextMonth.year, nextMonth.month)) {
      return;
    }

    setSelectedYear(nextMonth.year);
    setSelectedMonth(nextMonth.month);
  }

  async function handleCapture(targets: CaptureTarget[]) {
    if (targets.length === 0) return;

    setCapturing(true);
    const prefix = `filly-${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

    try {
      const files: File[] = [];

      // 사원증: 첫 번째 자식(IdCard div, rounded-2xl)을 직접 캡처 → 투명 배경으로 라운딩 살림
      const idCardEl = idCardRef.current
        ?.firstElementChild as HTMLElement | null;
      if (targets.includes("idCard") && idCardEl) {
        files.push(
          await captureElementAsShown(idCardEl, `${prefix}-사원증.png`),
        );
      }

      // 영수증: 펼쳐진 스크롤 컨테이너 전체 캡처
      if (targets.includes("receipt") && receiptScrollRef.current) {
        const receiptEl = receiptScrollRef.current;
        const prevHeight = receiptEl.style.height;
        const prevOverflow = receiptEl.style.overflowY;
        const width = receiptEl.scrollWidth;
        const height = receiptEl.scrollHeight;

        receiptEl.style.height = `${height}px`;
        receiptEl.style.overflowY = "visible";

        try {
          files.push(
            await capturePngFile(receiptEl, `${prefix}-영수증.png`, {
              backgroundColor:
                getComputedStyle(document.documentElement)
                  .getPropertyValue("--receipt-barcode-light")
                  .trim() || "#ffffff",
              height,
              pixelRatio: 2,
              style: {
                height: `${height}px`,
                overflowY: "visible",
                width: `${width}px`,
              },
              width,
            }),
          );
        } finally {
          receiptEl.style.height = prevHeight;
          receiptEl.style.overflowY = prevOverflow;
        }
      }

      // 키워드 클라우드: 라운딩 영역만 캡처 → 투명 배경
      const cloudEl = keywordCloudRef.current
        ?.firstElementChild as HTMLElement | null;
      if (targets.includes("keywordCloud") && cloudEl) {
        files.push(
          await captureElementAsShown(cloudEl, `${prefix}-키워드클라우드.png`),
        );
      }

      if (files.length === 0) return;

      setShowCapturePicker(false);
      const shareResult = await shareFiles(files);
      if (shareResult === "shared" || shareResult === "cancelled") return;

      showCaptureResults(files);
    } catch (e) {
      if (isShareCancel(e)) return;

      console.error("[capture] 실패", e);
      window.alert("이미지 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setCapturing(false);
    }
  }

  function handleReceiptScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setReceiptAtBottom(scrollHeight - scrollTop - clientHeight < 8);
  }

  async function handleRecommendationCardClick(cardId: number) {
    if (
      !recommendationDraw ||
      isShuffling ||
      isShuffleLocked ||
      isPreparingShuffle ||
      revealingCardId !== null ||
      isLockedByActiveCard(cardId)
    ) {
      return;
    }
    if (!canRequestRecommendationNow()) {
      setRecommendationError("요청이 많아요. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (revealedRecommendations[cardId]) {
      setSelectedCardId(cardId);
      return;
    }

    setSelectedCardId(cardId);
    setRevealingCardId(cardId);
    setRecommendationError(null);
    markRecommendationRequested();

    try {
      const detail = await revealRecommendationCard(
        recommendationDraw.drawId,
        cardId,
      );

      setRevealedRecommendations({ [cardId]: detail });
      setRecommendationHistory((currentHistory) => {
        const filteredHistory = currentHistory.filter(
          (item) =>
            item.drawId !== detail.drawId || item.cardId !== detail.cardId,
        );

        return [detail, ...filteredHistory];
      });
      setRecommendationDraw((currentDraw) =>
        currentDraw?.drawId === recommendationDraw.drawId
          ? markDrawCardRevealed(currentDraw, cardId)
          : currentDraw,
      );
    } catch (error) {
      const existingDetail = recommendationHistory.find(
        (item) =>
          item.drawId === recommendationDraw.drawId && item.cardId === cardId,
      );
      const currentDrawDetail = recommendationHistory.find(
        (item) =>
          item.drawId === recommendationDraw.drawId &&
          recommendationDraw.cards.some((card) => card.cardId === item.cardId),
      );

      if (isAxiosError(error) && error.response?.status === 400 && existingDetail) {
        setRevealedRecommendations({ [cardId]: existingDetail });
        setRecommendationError(null);
        return;
      }

      if (
        isAxiosError(error) &&
        error.response?.status === 400 &&
        currentDrawDetail
      ) {
        setRevealedRecommendations({
          [currentDrawDetail.cardId]: currentDrawDetail,
        });
        setSelectedCardId(currentDrawDetail.cardId);
        setRecommendationError(null);
        return;
      }

      console.error("[recommendation] 추천 카드를 공개하지 못했어요.", error);
      setSelectedCardId(null);
      setRecommendationError(
        getApiErrorMessage(error) ??
          (isRateLimitError(error)
            ? "요청이 많아요. 잠시 후 다시 시도해주세요."
            : "추천 카드를 공개하지 못했어요."),
      );
    } finally {
      setRevealingCardId(null);
    }
  }

  function handleCloseSelectedCard() {
    if (!recommendationDraw || revealingCardId !== null) return;

    setSelectedCardId(null);
  }

  function getRecommendationHistoryKey(item: RecommendationDetail) {
    return `${item.drawId}-${item.cardId}`;
  }

  async function handleShuffleCards() {
    if (
      !recommendationDraw ||
      isShuffling ||
      isShuffleLocked ||
      isPreparingShuffle ||
      revealingCardId !== null ||
      !isDrawCardRevealed(recommendationDraw, selectedCardId)
    ) {
      return;
    }
    if (!canRequestRecommendationNow()) {
      setRecommendationError("요청이 많아요. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (selectedCardId === null) {
      return;
    }

    setIsShuffleLocked(true);
    setRecommendationError(null);
    markRecommendationRequested();
    const previousRevealedRecommendations = revealedRecommendations;
    const nextDrawPromise = shuffleRecommendationDraw(recommendationDraw.drawId);

    setRevealedRecommendations({});
    setIsPreparingShuffle(true);
    setSelectedCardId(null);
    setCardOrder(getCardOrder(recommendationDraw));
    await wait(CARD_RESET_DURATION_MS + CARD_RESET_SETTLE_BUFFER_MS);
    if (!isMountedRef.current) {
      await nextDrawPromise.catch(() => undefined);
      return;
    }
    setIsPreparingShuffle(false);

    setIsShuffling(true);
    const stepPairs: [number, number][] = [
      [0, 1],
      [1, 2],
      [0, 1],
    ];
    let stepIndex = 0;
    clearShuffleInterval();
    shuffleIntervalRef.current = window.setInterval(() => {
      if (!isMountedRef.current) return;

      const [firstIndex, secondIndex] = stepPairs[stepIndex % stepPairs.length];
      stepIndex += 1;
      setCardOrder((currentOrder) =>
        swapOrderByIndex(currentOrder, firstIndex, secondIndex),
      );
    }, SHUFFLE_STEP_DURATION_MS);

    try {
      const [nextDraw] = await Promise.all([
        nextDrawPromise,
        wait(SHUFFLE_MIN_VISIBLE_MS),
      ]);
      if (!isMountedRef.current) return;

      setRecommendationDraw(nextDraw);
      setCardOrder(getCardOrder(nextDraw));
      setSelectedCardId(null);
    } catch (error) {
      if (!isMountedRef.current) return;

      console.error("[recommendation] 추천 카드를 섞지 못했어요.", error);
      setRevealedRecommendations(previousRevealedRecommendations);
      setCardOrder(getCardOrder(recommendationDraw));
      setSelectedCardId(null);
      setRecommendationError(
        getApiErrorMessage(error) ??
          (isRateLimitError(error)
            ? "요청이 많아요. 잠시 후 다시 시도해주세요."
            : "추천 카드를 섞지 못했어요."),
      );
    } finally {
      clearShuffleInterval();

      if (isMountedRef.current) {
        setIsShuffling(false);
        setIsShuffleLocked(false);
      }
    }
  }

  const selectedTargets = captureTargetOptions
    .filter(
      ({ id }) =>
        selectedCaptureTargets[id] && getCaptureTargetAvailability(id),
    )
    .map(({ id }) => id);

  const hasDownloadableContent = captureTargetOptions.some(({ id }) =>
    getCaptureTargetAvailability(id),
  );
  const isWaitingForInitialRecommendation =
    recommendationLoading || !recommendationDraw;
  const selectedRecommendationDetail =
    selectedCardId !== null ? revealedRecommendations[selectedCardId] : null;
  const showSelectedCardPopup =
    selectedCardId !== null &&
    !isPreparingShuffle &&
    !isShuffling &&
    !isShuffleLocked;
  const canShuffleSelectedCard = isDrawCardRevealed(
    recommendationDraw,
    selectedCardId,
  );

  return (
    <>
      <div className="flex h-auto w-full flex-col font-['Nanum_Myeongjo'] md:h-full md:flex-row">
        {/* Left page - 추천 */}
        <div className="flex h-auto flex-col gap-3 px-3 py-4 md:h-full md:max-h-[680px] md:flex-1 md:overflow-hidden md:py-3">
          <div className="flex flex-col md:min-h-0 md:flex-1">
            <div className="flex items-center justify-between pb-2.5 border-b border-border-light mb-1 flex-shrink-0">
              <div className="text-base font-bold text-[var(--text-stats-heading)] tracking-wide">
                추천 컨텐츠
              </div>
              <div
                aria-hidden="true"
                className="invisible h-7 w-[116px] rounded-md border border-border-light"
              />
            </div>

            <div className="flex flex-col gap-4 pt-5 md:min-h-0 md:flex-1">
              <div className="flex flex-col gap-4 flex-shrink-0">
                <div className="relative flex h-[164px] w-full gap-2 px-1 md:h-[232px] md:gap-3 md:px-2">
                  {cardOrder.map((cardId, slotIndex) => {
                    const card = recommendationDraw?.cards.find(
                      (item) => item.cardId === cardId,
                    );
                    const isSelected = selectedCardId === cardId;
                    const isSelectedCardPopped =
                      showSelectedCardPopup && isSelected;
                    const isRevealing = revealingCardId === cardId;
                    const isCardLocked = isLockedByActiveCard(cardId);
                    const showCardFilter =
                      isWaitingForInitialRecommendation ||
                      (!isPreparingShuffle &&
                        !isShuffling &&
                        !isShuffleLocked &&
                        isCardLocked);
                    const isCardDisabled =
                      isWaitingForInitialRecommendation ||
                      isShuffling ||
                      isShuffleLocked ||
                      isPreparingShuffle ||
                      (revealingCardId !== null && !isRevealing) ||
                      isCardLocked;
                    const cardLabel = `추천 카드 ${card?.position ?? slotIndex + 1}`;
                    return (
                      <motion.div
                        layout
                        key={cardId}
                        role="button"
                        tabIndex={isCardDisabled ? -1 : 0}
                        onClick={() => {
                          if (!isCardDisabled)
                            handleRecommendationCardClick(cardId);
                        }}
                        onKeyDown={(event) => {
                          if (isCardDisabled) return;
                          if (event.key !== "Enter" && event.key !== " ")
                            return;

                          event.preventDefault();
                          handleRecommendationCardClick(cardId);
                        }}
                        aria-pressed={isSelected}
                        aria-disabled={isCardDisabled}
                        aria-label={cardLabel}
                        className={`group relative z-[1] h-full flex-1 min-w-0 self-center text-left [perspective:1000px] focus:outline-none ${
                          isWaitingForInitialRecommendation ? "opacity-55" : ""
                        } ${
                          isSelectedCardPopped ? "opacity-0" : ""
                        } ${
                          showCardFilter ? "pointer-events-none" : ""
                        } ${
                          isCardDisabled ? "cursor-default" : "cursor-pointer"
                        }`}
                        transition={{
                          layout: {
                            duration: isShuffling
                              ? SHUFFLE_STEP_DURATION_MS / 1000
                              : 0.45,
                            ease: [0.22, 0.61, 0.36, 1],
                          },
                        }}
                        style={{ zIndex: 1 }}
                      >
                        <div
                          className="relative left-1/2 top-1/2 aspect-[1023/1537] h-full -translate-x-1/2 -translate-y-1/2"
                        >
                          <div className="absolute inset-0 overflow-hidden rounded-md bg-[var(--bg-card-back)] shadow-[var(--shadow-subtle)] transition-[box-shadow,background-color] duration-200 [backface-visibility:hidden] group-hover:bg-[var(--bg-card-back-hover)]">
                            <img
                              src={tarotCardImage}
                              alt={
                                recommendationLoading ? "LOADING" : cardLabel
                              }
                              decoding="async"
                              loading="eager"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          {showCardFilter && (
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 z-[3] rounded-md bg-white/70"
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                  {showSelectedCardPopup && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                      <motion.div
                        key={selectedCardId}
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: 180 }}
                        transition={{
                          duration: 0.95,
                          ease: [0.22, 0.61, 0.36, 1],
                        }}
                        className="pointer-events-auto relative aspect-[1023/1537] h-[238px] [transform-style:preserve-3d] md:h-[348px]"
                      >
                        <div className="absolute inset-0 overflow-hidden rounded-md bg-[var(--bg-card-back)] shadow-[var(--shadow-subtle)] [backface-visibility:hidden]">
                          <img
                            src={tarotCardImage}
                            alt="선택된 추천 카드"
                            decoding="async"
                            loading="eager"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="absolute inset-0 overflow-hidden rounded-md bg-[#fefefe] p-5 shadow-[0_18px_34px_rgba(0,0,0,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                          <div className="absolute inset-0 opacity-20 paper-texture" />
                          <div className="absolute inset-3 rounded-md border border-border-medium" />
                          <div className="pointer-events-none absolute inset-3 z-[2]">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCloseSelectedCard();
                              }}
                              aria-label="카드 닫기"
                              className="pointer-events-auto absolute right-1 top-1 p-1 text-[var(--text-icon-muted)] transition-colors hover:text-[var(--text-icon-soft)]"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="relative z-[1] flex h-full flex-col gap-2.5 overflow-x-hidden overflow-y-auto text-text-heading">
                            {revealingCardId === selectedCardId ? (
                              <div className="flex h-full items-center justify-center text-center text-[13px] leading-[1.7] text-text-muted">
                                추천을 펼치는 중...
                              </div>
                            ) : selectedRecommendationDetail ? (
                              <>
                                <div className="flex items-center gap-2 text-[10px] tracking-[1.4px] text-text-secondary">
                                  <span className="truncate">
                                    {selectedRecommendationDetail.category}
                                    {selectedRecommendationDetail.subCategory
                                      ? ` / ${selectedRecommendationDetail.subCategory}`
                                      : ""}
                                  </span>
                                </div>
                                <div className="text-[15px] font-bold leading-[1.35]">
                                  {selectedRecommendationDetail.title}
                                </div>
                                <div className="text-[11.5px] leading-[1.6] text-text-muted">
                                  {selectedRecommendationDetail.description}
                                </div>
                                <div className="border-t border-border-medium pt-2 text-[10.5px] leading-[1.6] text-text-secondary">
                                  {selectedRecommendationDetail.reason}
                                </div>
                                {selectedRecommendationDetail.searchKeyword && (
                                  <div className="truncate text-[9.5px] text-text-secondary">
                                    #{selectedRecommendationDetail.searchKeyword}
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
                                    isShuffleLocked ||
                                    isPreparingShuffle ||
                                    revealingCardId !== null ||
                                    !canShuffleSelectedCard
                                  }
                                  className="mt-1 self-center rounded-full border border-border-medium px-3 py-1 text-[10.5px] text-text-muted transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isShuffling || isPreparingShuffle
                                    ? "뽑는 중..."
                                    : "다른 카드 뽑기"}
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-none flex-col overflow-hidden border-t border-border-light pt-2 md:min-h-[180px] md:flex-1">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="text-[12px] tracking-[2px] text-[var(--text-page-label)] uppercase">
                    추천 히스토리
                  </div>
                </div>

                <div className="flex-none overflow-x-auto overflow-y-hidden pr-1 md:flex-1 md:overflow-x-hidden md:overflow-y-auto">
                  {recommendationLoading ? (
                    <div className="flex gap-2 md:block md:space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-14 min-w-[150px] rounded-md border border-border-light bg-bg-beige-subtle animate-pulse md:min-w-0"
                        />
                      ))}
                    </div>
                  ) : recommendationError &&
                    recommendationHistory.length === 0 ? (
                    <div className="h-full min-h-[116px] flex items-center justify-center rounded-lg border border-dashed border-border-dashed bg-bg-beige-subtle px-4 text-center">
                      <span className="text-[12px] leading-[1.7] text-text-muted">
                        {recommendationError}
                      </span>
                    </div>
                  ) : recommendationHistory.length === 0 ? (
                    <div className="h-full min-h-[116px] flex items-center justify-center rounded-lg border border-dashed border-border-dashed bg-bg-beige-subtle px-4 text-center">
                      <span className="text-[12px] leading-[1.7] text-text-muted">
                        아직 추천 기록이 없어요.
                        <br />
                        카드를 선택하면 히스토리가 이곳에 쌓일 예정이에요.
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2 md:block md:space-y-2">
                      {recommendationError && (
                        <div className="min-w-[150px] rounded-md border border-border-light bg-bg-beige-subtle px-3 py-2 text-[12px] leading-[1.5] text-text-muted md:min-w-0">
                          {recommendationError}
                        </div>
                      )}
                      {recommendationHistory.map((item) => {
                        const historyKey = getRecommendationHistoryKey(item);

                        return (
                          <button
                            key={historyKey}
                            type="button"
                            onClick={() =>
                              setSelectedRecommendationHistory(item)
                            }
                            className="w-[150px] flex-shrink-0 rounded-md border border-border-light bg-bg-beige-subtle px-2.5 py-2 text-left transition-colors md:w-full md:px-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1 truncate text-[12px] font-bold text-text-heading">
                                {item.title}
                              </div>
                              <div className="flex-shrink-0 text-[11px] text-text-secondary">
                                {contentTypeLabels[item.contentType]}
                              </div>
                            </div>
                            <div className="mt-1 line-clamp-2 text-[12px] leading-[1.45] text-text-muted">
                              {item.reason}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right page - 공유 컨텐츠 */}
        <div className="flex h-auto flex-col gap-3 border-t border-border-light px-3 py-4 md:h-full md:max-h-[680px] md:flex-1 md:overflow-hidden md:border-t-0 md:py-3">
          {/* 헤더 */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border-light mb-1 flex-shrink-0">
            <div className="text-base font-bold text-[var(--text-stats-heading)] tracking-wide">
              공유용 컨텐츠 (Shared Content)
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

          {/* 사원증 + 영수증 */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-2.5 md:flex-shrink-0">
            {/* 사원증 컬럼 */}
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[12px] tracking-[1.5px] text-text-secondary uppercase">
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
                <span className="text-[12px] tracking-[1.5px] text-text-secondary uppercase">
                  영수증 <span className="normal-case">(Receipt)</span>
                </span>
                {receipt && (
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="text-[12px] text-text-muted hover:text-text-strong transition-colors underline underline-offset-2"
                  >
                    전체보기
                  </button>
                )}
              </div>
              <div
                ref={receiptWrapRef}
                className="relative h-[280px] max-h-[56vh] md:max-h-none"
              >
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
            <span className="text-[12px] tracking-[1.5px] text-text-secondary uppercase">
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
                text-[12px] text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-50"
            >
              <Download className="w-3 h-3" />
              {capturing ? "캡처 중..." : "이미지 공유 및 저장"}
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

      <NotebookDetailModal
        isOpen={selectedRecommendationHistory !== null}
        onClose={() => setSelectedRecommendationHistory(null)}
        accent="var(--tab-recommend)"
        eyebrow="Recommendation"
        title={selectedRecommendationHistory?.title ?? ""}
        meta={
          selectedRecommendationHistory ? (
            <span>
              {contentTypeLabels[selectedRecommendationHistory.contentType]} ·{" "}
              {selectedRecommendationHistory.category}
              {selectedRecommendationHistory.subCategory
                ? ` / ${selectedRecommendationHistory.subCategory}`
                : ""}
            </span>
          ) : null
        }
        widthClassName="w-[400px] max-w-[calc(100vw-32px)]"
      >
        {selectedRecommendationHistory && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-[16px] border border-border-light bg-bg-beige-subtle px-3 py-2.5">
                <div className="text-[10px] tracking-[1.4px] text-[var(--text-page-label)] uppercase">
                  유형
                </div>
                <div className="mt-1 text-[12px] font-bold text-text-heading">
                  {contentTypeLabels[selectedRecommendationHistory.contentType]}
                </div>
              </div>
              <div className="rounded-[16px] border border-border-light bg-bg-beige-subtle px-3 py-2.5">
                <div className="text-[10px] tracking-[1.4px] text-[var(--text-page-label)] uppercase">
                  기록
                </div>
                <div className="mt-1 text-[12px] font-bold text-text-heading">
                  #{selectedRecommendationHistory.cardId}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-border-light bg-bg-beige-subtle px-4 py-3">
              <div className="mb-2 text-[11px] tracking-[1.6px] text-[var(--text-page-label)] uppercase">
                설명
              </div>
              <div className="text-[13px] leading-[1.85] text-text-muted">
                {selectedRecommendationHistory.description}
              </div>
            </div>

            <div className="rounded-[16px] border border-border-light bg-[var(--bg-page)] px-4 py-3 shadow-[var(--shadow-subtle)]">
              <div className="mb-2 text-[11px] tracking-[1.6px] text-[var(--text-page-label)] uppercase">
                추천 이유
              </div>
              <div className="whitespace-pre-line text-[13px] leading-[1.85] text-text-muted">
                {selectedRecommendationHistory.reason}
              </div>
            </div>

            {selectedRecommendationHistory.searchKeyword && (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border-light bg-bg-beige-subtle px-3 py-1 text-[11px] text-text-secondary">
                  #{selectedRecommendationHistory.searchKeyword}
                </span>
              </div>
            )}
          </div>
        )}
      </NotebookDetailModal>

      {showCapturePicker && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-overlay backdrop-blur-[2px]"
            onClick={() => {
              if (!capturing) setShowCapturePicker(false);
            }}
          >
            <div
              className="w-[320px] max-w-[calc(100vw-32px)] rounded-xl bg-notebook-page shadow-[var(--shadow-modal)]
                overflow-hidden font-['Nanum_Myeongjo']"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <div>
                  <div className="text-[14px] text-text-heading tracking-wide">
                    저장할 이미지 선택
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-secondary">
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
                        ${
                          checked
                            ? "border-border-strong bg-bg-active text-text-heading"
                            : "border-border-medium bg-transparent text-text-muted hover:bg-bg-hover"
                        }`}
                    >
                      <span>
                        <span className="block text-[13px]">
                          {option.label}
                        </span>
                        <span className="block text-[11px] text-text-secondary">
                          {disabled ? "아직 준비 중이에요" : option.description}
                        </span>
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center
                          ${
                            checked
                              ? "border-border-strong bg-bg-selected"
                              : "border-border-medium bg-bg-beige-subtle"
                          }`}
                      >
                        {checked && (
                          <Check className="w-3 h-3 text-text-heading" />
                        )}
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
                  className="px-3 py-1.5 rounded-full border border-border-medium text-[12px]
                    text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleCapture(selectedTargets)}
                  disabled={capturing || selectedTargets.length === 0}
                  className="px-3 py-1.5 rounded-full border border-border-strong text-[12px]
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

      {captureResultFiles.length > 0 && (
        <Portal>
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-overlay backdrop-blur-[2px]"
            onClick={closeCaptureResults}
          >
            <div
              className="w-[340px] max-w-[calc(100vw-32px)] rounded-xl bg-notebook-page shadow-[var(--shadow-modal)]
                overflow-hidden font-['Nanum_Myeongjo']"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                <div>
                  <div className="text-[14px] text-text-heading tracking-wide">
                    이미지 준비 완료
                  </div>
                  <div className="mt-0.5 text-[11px] text-text-secondary">
                    여러 장 공유가 막히면 이미지를 하나씩 공유하거나 열어서
                    저장해주세요.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeCaptureResults}
                  className="w-7 h-7 flex items-center justify-center rounded-md
                    hover:bg-bg-hover transition-colors"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>

              <div className="border-b border-border-light px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    void shareCaptureResult(
                      captureResultFiles.map((file) => file.file),
                    )
                  }
                  className="w-full rounded-full border border-border-strong bg-bg-active px-3 py-2
                    text-[12px] text-text-heading transition-colors hover:bg-bg-active-hover"
                >
                  전체 공유
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                {captureResultFiles.map((file) => (
                  <div
                    key={file.id}
                    className="rounded-lg border border-border-medium bg-bg-beige-subtle p-2"
                  >
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener"
                      className="block text-text-muted transition-colors hover:text-text-heading"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="mb-2 max-h-40 w-full rounded-md object-contain bg-notebook-page"
                      />
                      <span className="flex items-center justify-between gap-2 text-[12px]">
                        <span className="truncate">{file.name}</span>
                        <span className="flex-shrink-0 text-text-heading">
                          열기
                        </span>
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => void shareCaptureResult([file.file])}
                      className="mt-2 w-full rounded-full border border-border-medium bg-transparent px-3 py-1.5
                        text-[12px] text-text-muted transition-colors hover:bg-bg-hover"
                    >
                      이 이미지 공유
                    </button>
                  </div>
                ))}
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
