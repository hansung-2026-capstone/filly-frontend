import type { ReceiptResponse } from "../../api/share";

interface ReceiptProps {
  receipt: ReceiptResponse;
  nickname: string;
  year: number;
  month: number;
}

export function Receipt({ receipt, nickname, year, month }: ReceiptProps) {
  const emotions = Object.entries(receipt.emotionDistribution);
  const persona = receipt.personaTitle ?? "감정을 탐험하는 신입 사원";
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div className="w-[200px] flex-shrink-0 flex flex-col bg-white border border-border-light shadow-medium font-mono text-[9px] text-text-primary">
      {/* 로고 */}
      <div className="flex flex-col items-center pt-4 pb-3">
        <span className="text-[14px] font-black tracking-[3px] text-text-strong">✿ FILLY</span>
      </div>

      <Dashed />

      {/* 주문번호 + 제목 */}
      <div className="flex flex-col items-center py-2.5 gap-0.5">
        <span className="text-[8px] text-text-secondary">주문번호 {receipt.orderNumber}</span>
        <span className="text-[11px] font-bold text-text-strong mt-1">{nickname}님의 결산내역</span>
      </div>

      <Dashed />

      {/* 가게 정보 */}
      <div className="px-3 py-2.5 flex flex-col gap-0.5 text-text-muted">
        <span className="font-bold text-text-strong">Filly</span>
        <span>사업자: 123-45-67890</span>
        <span>TEL: 010-0000-FILLY</span>
        <span>담당자: 코부기</span>
        <span className="leading-tight">서울특별시 성북구 삼선교로 16길 116</span>
      </div>

      <Dashed />

      {/* 거래 일시 + 페르소나 */}
      <div className="px-3 py-2.5 flex flex-col gap-1">
        <Row label="거래 일시" value={dateStr} col />
        <Row label="페르소나" value={persona} col />
      </div>

      <Dashed />

      {/* 상품명 목록 */}
      <div className="px-3 py-2.5 flex flex-col gap-1">
        <div className="flex justify-between text-text-secondary mb-0.5">
          <span>상품명</span>
          <span>금액</span>
        </div>
        <Row label="· 쓴 글자" value={`${receipt.totalChars.toLocaleString()}자`} />
        <Row label="· 일기 개수" value={`${receipt.diaryCount}편`} />
        <div className="mt-1 flex flex-col gap-0.5">
          {emotions.length > 0 ? (
            emotions.map(([emotion, pct]) => (
              <Row key={emotion} label={`· ${emotion}`} value={`${pct}%`} />
            ))
          ) : (
            <span className="text-text-secondary italic leading-tight">아직 감정 기록이 없어요</span>
          )}
        </div>
      </div>

      <Dashed />

      {/* 바코드 */}
      <div className="flex flex-col items-center py-3 gap-1.5">
        <Barcode value={receipt.orderNumber} />
      </div>

    </div>
  );
}

export function ReceiptSkeleton() {
  return (
    <div className="w-[160px] flex-shrink-0 flex flex-col bg-white border border-border-light shadow-medium gap-3 py-4 px-4">
      <div className="flex flex-col items-center gap-1.5">
        <div className="h-4 w-20 rounded bg-bg-hover animate-pulse" />
        <div className="h-2 w-14 rounded bg-bg-hover animate-pulse" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-2 w-full rounded bg-bg-hover animate-pulse" />
      ))}
      <div className="h-7 w-full rounded bg-bg-hover animate-pulse opacity-40" />
      <div className="h-2 w-24 rounded bg-bg-hover animate-pulse mx-auto" />
    </div>
  );
}

function Row({ label, value, col }: { label: string; value: string; col?: boolean }) {
  if (col) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-text-secondary">{label}</span>
        <span className="text-text-muted leading-tight break-keep">{value}</span>
      </div>
    );
  }
  return (
    <div className="flex justify-between gap-1">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-strong font-bold">{value}</span>
    </div>
  );
}

function Dashed() {
  return <div className="mx-3 border-t border-dashed border-border-light" />;
}

// 흑백 바 교대로 배치해 실제 바코드처럼 보이게 함 (짝수 인덱스=검정 바, 홀수=흰 공백)
const BARCODE_PATTERN = [2,1,3,1,1,2,1,3,2,1,1,3,1,2,1,1,3,2,1,2,3,1,1,2,1,3,1,2,1,3,1,1,2,3,1,2,1,1,3,1,2,2,1,3,1,1,2,1,3,2,1,1,2,3,1,2,1,1,3,2,1,2,1,3,1,1,2,3,1];

function Barcode({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <div className="flex justify-center h-10 w-full bg-white overflow-hidden">
        {BARCODE_PATTERN.map((w, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-full"
            style={{ width: `${w}px`, backgroundColor: i % 2 === 0 ? "#000" : "#fff" }}
          />
        ))}
      </div>
      <span className="text-[7px] tracking-widest text-text-secondary">{value}</span>
    </div>
  );
}
