import idCardHolderImage from "../assets/id-card-holder.png";
import { UserAvatar } from "./UserAvatar";

interface IdCardProps {
  avatarUrl: string;
  nickname: string;
  keywords: string[];
  persona?: string | null;
  issuedDate?: string;
  variant?: "compact" | "story";
}

export function IdCard({
  avatarUrl,
  nickname,
  keywords,
  persona,
  issuedDate,
  variant = "compact",
}: IdCardProps) {
  const visibleKeywords = keywords.slice(0, 3);
  const isStory = variant === "story";
  const personaText = persona?.trim() || "감정을 탐험하는 신입 사원";
  const keywordText =
    visibleKeywords.length > 0 ? visibleKeywords.join(", ") : "신입 사원";
  const cardNumber = `FL-${issuedDate?.replaceAll(".", "") ?? "20260521"}`;

  const card = (
    <div
      className={`relative w-full overflow-hidden ${
        isStory
          ? "h-full bg-transparent"
          : "aspect-[5/7] rounded-[22px] border border-[rgba(137,130,120,0.28)] bg-[#f8f4ee] shadow-medium"
      }`}
    >
      <div
        className={`absolute inset-y-0 right-0 flex items-center justify-center bg-[#948c82] text-[#f8f4ee] ${
          isStory ? "w-[23%] rounded-r-[22px]" : "w-[24%]"
        }`}
      >
        <span
          className={`font-['Nanum_Myeongjo'] font-bold uppercase [writing-mode:vertical-rl] ${
            isStory
              ? "text-[26px] tracking-[12px]"
              : "text-[16px] tracking-[8px]"
          }`}
        >
          FILLY CARD
        </span>
      </div>

      <div
          className={`relative z-10 flex h-full flex-col ${
            isStory
            ? "mr-[23%] px-[9%] pb-[9%] pt-[13%]"
            : "mr-[24%] px-[8%] pb-[7%] pt-[7%]"
        }`}
      >
        <UserAvatar
          avatarUrl={avatarUrl}
          className={`mx-auto border border-[#b4ada4] bg-[#948c82] ${
            isStory ? "h-[190px] w-[142px]" : "h-[118px] w-[88px]"
          }`}
          imageClassName="scale-100"
          captureSafe={isStory}
        />

        <div
          className={`flex min-h-0 flex-1 flex-col justify-end ${
            isStory ? "gap-2 pt-5" : "gap-1 pt-2"
          }`}
        >
          <CardField label="NAME." value={nickname} isStory={isStory} strong />
          <CardField label="PERSONA." value={personaText} isStory={isStory} />
          <CardField
            label="ISSUED DATE."
            value={issuedDate ?? "2026.05.21"}
            isStory={isStory}
            strong
          />
          <CardField label="KEYWORD." value={keywordText} isStory={isStory} />

          <div
            className={`flex flex-col ${
              isStory ? "gap-3 pt-3" : "gap-0.5 pt-0.5"
            }`}
          >
            <Barcode isStory={isStory} />
            <span
              className={`font-mono tracking-[2px] text-[#948c82] ${
                isStory ? "text-[10px]" : "text-[6px]"
              }`}
            >
              {cardNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isStory) return card;

  return (
    <div
      className="relative aspect-[1055/1491] w-full overflow-hidden bg-[length:100%_100%] bg-no-repeat"
      data-capture-bg-src={idCardHolderImage}
      style={{ backgroundImage: `url(${idCardHolderImage})` }}
    >
      <img
        src={idCardHolderImage}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-fill"
        draggable={false}
      />
      <div className="absolute left-[20.4%] top-[20.6%] z-10 h-[74.2%] w-[61.2%] overflow-hidden">
        {card}
      </div>
    </div>
  );
}

function CardField({
  label,
  value,
  isStory,
  strong = false,
}: {
  label: string;
  value: string;
  isStory: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={`border-b border-[#c0b8ad] ${
        isStory ? "pb-1.5" : "pb-0.5"
      }`}
    >
      <div
        className={`font-bold tracking-[1px] text-[#948c82] ${
          isStory ? "text-[11px]" : "text-[7px]"
        }`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 break-keep font-['Nanum_Myeongjo'] leading-[1.15] text-[#25272d] ${
          isStory ? "text-[16px]" : "text-[10px]"
        } ${strong ? "font-bold" : "font-normal"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Barcode({ isStory }: { isStory: boolean }) {
  return (
    <div
      className={`flex items-end gap-[2px] ${
        isStory ? "h-5" : "h-[13px]"
      }`}
    >
      {[
        3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 1,
        2, 3, 1, 1, 2, 3, 1, 2,
      ].map((h, i) => (
        <div
          key={i}
          className={`bg-[#948c82] ${isStory ? "w-[2px]" : "w-[1px]"}`}
          style={{ height: `${h * 20}%` }}
        />
      ))}
    </div>
  );
}

export function IdCardSkeleton() {
  return (
    <div className="relative aspect-[5/7] w-full overflow-hidden rounded-[22px] border border-border-medium bg-[#f8f4ee]">
      <div className="absolute inset-y-0 right-0 w-[24%] bg-[#948c82] opacity-70" />
      <div className="relative z-10 mr-[24%] flex h-full flex-col px-[8%] pb-[7%] pt-[7%]">
        <div className="mx-auto h-[118px] w-[88px] rounded-full bg-bg-hover animate-pulse" />
        <div className="flex flex-1 flex-col justify-end gap-1 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-border-light pb-0.5">
              <div className="h-2 w-14 rounded bg-bg-hover animate-pulse" />
              <div
                className={`mt-1 h-3 rounded bg-bg-hover animate-pulse ${
                  i === 1 ? "w-full" : "w-20"
                }`}
              />
            </div>
          ))}
          <div className="h-[13px] w-24 bg-bg-hover animate-pulse opacity-50" />
        </div>
      </div>
    </div>
  );
}
