import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useIdCard } from "../hook/useIdCard";
import { useReceipt } from "../hook/useReceipt";
import { IdCard, IdCardSkeleton } from "../components/IdCard";
import { Receipt, ReceiptSkeleton } from "../components/Receipt";
import { MonthPickerModal } from "../components/MonthPickerModal";

export function RecommendPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { idCard, loading: idCardLoading } = useIdCard();
  const { receipt, loading: receiptLoading } = useReceipt(selectedYear, selectedMonth);
  const [receiptAtBottom, setReceiptAtBottom] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  function handleReceiptScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setReceiptAtBottom(scrollHeight - scrollTop - clientHeight < 8);
  }

  return (
    <>
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - 추천 */}
      <div className="flex-1 flex flex-col py-4 px-4 pl-5 overflow-y-auto" />

      {/* Right page - 공유 컨텐츠 */}
      <div className="flex-1 flex flex-col py-3 px-3 gap-3 overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(160,140,120,0.12)] mb-1 flex-shrink-0">
          <div className="text-sm text-[rgba(70,55,35,0.65)] tracking-wide">
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
            <div className="flex-1">
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
            <div className="relative h-[280px]">
              <div
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
                  background: "linear-gradient(to bottom, transparent, #faf6ed)",
                }}
              />
            </div>
          </div>
        </div>

        {/* 키워드 클라우드 */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <span className="text-[9px] tracking-[1.5px] text-text-secondary uppercase">
            키워드 클라우드 <span className="normal-case">(Keyword Cloud)</span>
          </span>
          <KeywordCloud />
        </div>
      </div>
    </div>

    <MonthPickerModal
      isOpen={showMonthPicker}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      onSelect={(year, month) => { setSelectedYear(year); setSelectedMonth(month); }}
      onClose={() => setShowMonthPicker(false)}
    />

    {/* 영수증 전체보기 모달 */}
    {showReceiptModal && receipt && createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(0,0,0,0.4)]"
        onClick={() => setShowReceiptModal(false)}
      >
        <div
          className="relative z-[10000] flex flex-col w-[240px] max-h-[80vh] rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setShowReceiptModal(false)}
            className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center
              rounded-full bg-[rgba(0,0,0,0.08)] hover:bg-[rgba(0,0,0,0.15)] transition-colors"
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

const MOCK_KEYWORDS = [
  { text: "일기", weight: 9 },
  { text: "취향", weight: 8 },
  { text: "통계", weight: 8 },
  { text: "활동", weight: 7 },
  { text: "페르소나", weight: 7 },
  { text: "AI", weight: 6 },
  { text: "사교", weight: 5 },
  { text: "음식", weight: 5 },
  { text: "학습", weight: 5 },
  { text: "별점", weight: 4 },
  { text: "패턴", weight: 4 },
  { text: "밀라도", weight: 3 },
  { text: "얼게", weight: 3 },
];

function KeywordCloud() {
  return (
    <div className="rounded-lg border border-border-medium bg-bg-beige-subtle px-3 py-3 flex flex-wrap gap-x-2 gap-y-1.5 items-center justify-center min-h-[100px]">
      {MOCK_KEYWORDS.map(({ text, weight }) => {
        const size = 9 + weight * 1.6;
        const opacity = 0.4 + weight * 0.06;
        return (
          <span
            key={text}
            className="font-['Nanum_Myeongjo'] font-bold text-text-strong leading-tight cursor-default select-none"
            style={{ fontSize: `${size}px`, opacity }}
          >
            {text}
          </span>
        );
      })}
    </div>
  );
}
