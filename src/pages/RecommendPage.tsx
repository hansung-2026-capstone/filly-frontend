import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { useIdCard } from "../hook/common/useIdCard";
import { useReceipt } from "../hook/common/useReceipt";
import { useMonthlyStat } from "../hook/common/useMonthlyStat";
import { IdCard, IdCardSkeleton } from "../components/IdCard";
import { Receipt, ReceiptSkeleton } from "../components/Receipt";
import { MonthPickerModal } from "../components/MonthPickerModal";
import { KeywordCloud } from "../components/KeywordCloud";

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

export function RecommendPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [cardOrder, setCardOrder] = useState(() =>
    Array.from({ length: CARD_COUNT }, (_, index) => index),
  );
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPreparingShuffle, setIsPreparingShuffle] = useState(false);

  const { idCard, loading: idCardLoading } = useIdCard();
  const { receipt, loading: receiptLoading } = useReceipt(
    selectedYear,
    selectedMonth,
  );
  const { stat } = useMonthlyStat(selectedYear, selectedMonth);
  const [receiptAtBottom, setReceiptAtBottom] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);
  const receiptScrollRef = useRef<HTMLDivElement>(null);
  const receiptWrapRef = useRef<HTMLDivElement>(null);
  const keywordCloudRef = useRef<HTMLDivElement>(null);

  function downloadPng(dataUrl: string, filename: string) {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleCapture() {
    setCapturing(true);
    const prefix = `filly-${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

    const receiptEl = receiptScrollRef.current;
    const prevHeight = receiptEl?.style.height ?? "";
    const prevOverflow = receiptEl?.style.overflowY ?? "";
    if (receiptEl) {
      receiptEl.style.height = "auto";
      receiptEl.style.overflowY = "visible";
    }

    try {
      // 사원증: 첫 번째 자식(IdCard div, rounded-2xl)을 직접 캡처 → 투명 배경으로 라운딩 살림
      const idCardEl = idCardRef.current?.firstElementChild as HTMLElement | null;
      if (idCardEl)
        downloadPng(
          await toPng(idCardEl, { pixelRatio: 2 }),
          `${prefix}-사원증.png`,
        );

      // 영수증: 펼쳐진 스크롤 컨테이너 전체 캡처
      if (receiptScrollRef.current)
        downloadPng(
          await toPng(receiptScrollRef.current, { backgroundColor: "var(--receipt-barcode-light)", pixelRatio: 2 }),
          `${prefix}-영수증.png`,
        );

      // 키워드 클라우드: 라운딩 영역만 캡처 → 투명 배경
      const cloudEl = keywordCloudRef.current?.firstElementChild as HTMLElement | null;
      if (cloudEl)
        downloadPng(
          await toPng(cloudEl, { pixelRatio: 2 }),
          `${prefix}-키워드클라우드.png`,
        );
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

  function startShuffleMotion() {
    setIsShuffling(true);
    window.setTimeout(() => {
      setCardOrder((currentOrder) => {
        const nextOrder = [...currentOrder].sort(() => Math.random() - 0.5);

        if (
          nextOrder.every((cardIndex, index) => cardIndex === currentOrder[index])
        ) {
          nextOrder.push(nextOrder.shift() ?? 0);
        }

        return nextOrder;
      });
    }, SHUFFLE_REORDER_DELAY_MS);
    window.setTimeout(() => setIsShuffling(false), SHUFFLE_DURATION_MS);
  }

  function handleShuffleCards() {
    if (isShuffling || isPreparingShuffle) return;

    if (selectedCardIndex === null) {
      startShuffleMotion();
      return;
    }

    setIsPreparingShuffle(true);
    setSelectedCardIndex(null);
    window.setTimeout(() => {
      setIsPreparingShuffle(false);
      startShuffleMotion();
    }, CARD_RESET_DURATION_MS);
  }

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
              <div className="flex flex-col gap-5 flex-shrink-0">
                <div className="flex h-[232px] w-full gap-5 px-3">
                  {cardOrder.map((cardIndex, slotIndex) => {
                    const isSelected = selectedCardIndex === cardIndex;

                    return (
                      <motion.button
                        layout
                        key={cardIndex}
                        type="button"
                        onClick={() => setSelectedCardIndex(cardIndex)}
                        disabled={isShuffling || isPreparingShuffle}
                        aria-pressed={isSelected}
                        aria-label={`추천 카드 ${cardIndex + 1}`}
                        className="group h-full flex-1 min-w-0 text-left [perspective:1000px] focus:outline-none disabled:cursor-default"
                        animate={{
                          x: isShuffling ? SHUFFLE_PATHS[slotIndex].x : "0%",
                          y: isShuffling
                            ? SHUFFLE_PATHS[slotIndex].y
                            : 0,
                          scale: isSelected && !isShuffling ? 1.08 : 1,
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
                          scale: {
                            type: "spring",
                            stiffness: 210,
                            damping: 17,
                          },
                          layout: {
                            duration: 0.7,
                            ease: [0.4, 0, 0.2, 1],
                          },
                        }}
                        style={{ zIndex: isSelected ? 10 : 1 }}
                      >
                        <div
                          className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                            isSelected ? "[transform:rotateY(180deg)]" : ""
                          }`}
                        >
                          <div
                            className="absolute inset-0 overflow-hidden rounded-lg border border-border-medium bg-[var(--bg-card-back)] shadow-[var(--shadow-subtle)] transition-[box-shadow,background-color] duration-200 [backface-visibility:hidden] group-hover:bg-[var(--bg-card-back-hover)]"
                          >
                            <div className="absolute inset-0 opacity-25 paper-texture" />
                            <div className="absolute inset-3 rounded-md border border-[rgba(255,255,255,0.22)]" />
                            <div className="absolute inset-x-8 top-1/2 h-px bg-[rgba(255,255,255,0.24)]" />
                            <div className="absolute left-1/2 top-8 bottom-8 w-px bg-[rgba(255,255,255,0.18)]" />
                          </div>

                          <div
                            className={`absolute inset-0 overflow-hidden rounded-lg border border-border-medium bg-[var(--archive-yellow)] [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                              isSelected
                                ? "shadow-[0_18px_34px_rgba(0,0,0,0.2)]"
                                : "shadow-[var(--shadow-subtle)]"
                            }`}
                          >
                            <div className="absolute inset-0 opacity-20 paper-texture" />
                            <div className="absolute inset-3 rounded-md border border-[rgba(80,60,40,0.16)]" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleShuffleCards}
                    disabled={isShuffling || isPreparingShuffle}
                    className="px-4 py-1.5 rounded-full border border-border-medium
                    text-[10px] text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-50"
                  >
                    카드 섞기
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[180px] flex flex-col overflow-hidden pt-2 border-t border-border-light">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <div className="text-[9px] tracking-[2px] text-[var(--text-page-label)] uppercase">
                    추천 히스토리
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="h-full min-h-[116px] flex items-center justify-center rounded-lg border border-dashed border-border-dashed bg-bg-beige-subtle px-4 text-center">
                    <span className="text-[11px] leading-[1.7] text-text-muted">
                      아직 추천 기록이 없어요.
                      <br />
                      카드를 선택하면 히스토리가 이곳에 쌓일 예정이에요.
                    </span>
                  </div>
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
              text-[10px] text-text-muted hover:bg-bg-hover transition-colors"
            >
              {selectedYear}년 {selectedMonth}월
            </button>
          </div>

          {/* 사원증 + 영수증 */}
          <div className="flex gap-2.5 flex-shrink-0">
            {/* 사원증 컬럼 */}
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="text-[9px] tracking-[1.5px] text-text-secondary uppercase">
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
                <span className="text-[9px] tracking-[1.5px] text-text-secondary uppercase">
                  영수증 <span className="normal-case">(Receipt)</span>
                </span>
                {receipt && (
                  <button
                    onClick={() => setShowReceiptModal(true)}
                    className="text-[9px] text-text-muted hover:text-text-strong transition-colors underline underline-offset-2"
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
            <span className="text-[9px] tracking-[1.5px] text-text-secondary uppercase">
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
              onClick={handleCapture}
              disabled={capturing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border-medium
                text-[10px] text-text-muted hover:bg-bg-hover transition-colors disabled:opacity-50"
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

      {/* 영수증 전체보기 모달 */}
      {showReceiptModal &&
        receipt &&
        createPortal(
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
          </div>,
          document.body,
        )}
    </>
  );
}
