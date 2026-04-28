import { useIdCard } from "../hook/useIdCard";
import { useReceipt } from "../hook/useReceipt";

export function RecommendPage() {
  const now = new Date();
  useIdCard();
  useReceipt(now.getFullYear(), now.getMonth() + 1);

  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      {/* Left page - 추천 */}
      <div className="flex-1 flex flex-col py-4 px-4 pl-5 overflow-y-auto" />

      {/* Right page - 공유 */}
      <div className="flex-1 flex flex-col py-3.5 px-5 pl-6 gap-2.5 overflow-y-auto" />
    </div>
  );
}
