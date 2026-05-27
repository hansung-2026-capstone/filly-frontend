import { useState, useRef, useEffect } from "react";
import { Wordcloud } from "@visx/wordcloud";
import { scaleLog } from "@visx/scale";
import { Text } from "@visx/text";

interface KeywordCloudProps {
  keywords: Record<string, number> | null;
  height?: number;
  framed?: boolean;
  emptyMessage?: string;
  emptyClassName?: string;
}

const HEIGHT = 150;
const COLORS = [
  "var(--keyword-cloud-1)",
  "var(--keyword-cloud-2)",
  "var(--keyword-cloud-3)",
  "var(--keyword-cloud-4)",
];

export function KeywordCloud({
  keywords,
  height = HEIGHT,
  framed = true,
  emptyMessage = "아직 키워드 기록이 없어요",
  emptyClassName = "text-[12px] text-text-secondary",
}: KeywordCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const entries: [string, number][] = keywords ? Object.entries(keywords) : [];

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden w-full bg-notebook-page ${
        framed
          ? "rounded-lg border border-border-medium"
          : ""
      }`}
      style={{ height }}
    >
      <div className="paper-texture absolute inset-0 pointer-events-none opacity-30" />
      <div className="relative z-[1] h-full">
        {entries.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <span className={emptyClassName}>{emptyMessage}</span>
          </div>
        ) : width > 0 ? (
          (() => {
            const words = entries.map(([text, value]) => ({ text, value }));
            const maxValue = Math.max(...words.map((w) => w.value));
            const fontScale = scaleLog({ domain: [1, maxValue], range: [10, 26] });
            return (
              <Wordcloud
                words={words}
                width={width}
                height={height}
                fontSize={(w) => fontScale(w.value)}
                font="Nanum Myeongjo, serif"
                fontWeight="bold"
                padding={3}
                rotate={() => 0}
                spiral="archimedean"
                random={() => 0.5}
              >
                {(cloudWords) =>
                  cloudWords.map((w, i) => (
                    <Text
                      key={w.text}
                      fill={COLORS[i % COLORS.length]}
                      textAnchor="middle"
                      transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                      fontSize={w.size}
                      fontFamily={w.font}
                      fontWeight={w.weight}
                    >
                      {w.text}
                    </Text>
                  ))
                }
              </Wordcloud>
            );
          })()
        ) : null}
      </div>
    </div>
  );
}
