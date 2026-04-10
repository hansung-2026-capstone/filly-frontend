import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
}

export function ToolbarButton({
  icon: Icon,
  strokeWidth = 2,
  className = "",
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 flex items-center justify-center hover:bg-[rgba(160,140,120,0.12)]
        rounded transition-all duration-150 border-none bg-transparent cursor-pointer ${className}`}
    >
      <Icon
        className="w-3.5 h-3.5 text-[rgba(60,45,30,0.7)]"
        strokeWidth={strokeWidth}
      />
    </button>
  );
}
