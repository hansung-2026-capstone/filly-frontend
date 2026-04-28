import { useIdCard } from "../hook/useIdCard";
import { useReceipt } from "../hook/useReceipt";
import { IdCard, IdCardSkeleton } from "../components/share/IdCard";
import { Receipt, ReceiptSkeleton } from "../components/share/Receipt";

export function RecommendPage() {
  const now = new Date();
  const { idCard, loading: idCardLoading } = useIdCard();
  const { receipt, loading: receiptLoading } = useReceipt(now.getFullYear(), now.getMonth() + 1);

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - 추천 */}
      <div className="flex-1 flex flex-col py-4 px-4 pl-5 overflow-y-auto" />

      {/* Right page - 공유 */}
      <div className="flex-1 flex flex-row items-center justify-center gap-3 py-4 px-3 overflow-y-auto">
        {idCardLoading ? (
          <IdCardSkeleton />
        ) : idCard ? (
          <IdCard
            avatarUrl={idCard.avatarUrl}
            nickname={idCard.nickname}
            keywords={idCard.keywords}
          />
        ) : null}

        {receiptLoading ? (
          <ReceiptSkeleton />
        ) : receipt ? (
          <Receipt
            receipt={receipt}
            nickname={idCard?.nickname ?? ""}
            year={now.getFullYear()}
            month={now.getMonth() + 1}
          />
        ) : null}
      </div>
    </div>
  );
}
