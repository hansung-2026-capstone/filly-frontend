import { Settings, type LucideIcon } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

type TabConfig = {
  path: string;
  label: string;
  icon?: LucideIcon;
  bgClass: string;
  textClass: string;
};

const TABS: TabConfig[] = [
  { path: "home", label: "홈", bgClass: "bg-[var(--tab-home)]", textClass: "text-[var(--tab-home-text)]" },
  { path: "stats", label: "통계", bgClass: "bg-[var(--tab-stats)]", textClass: "text-[var(--tab-stats-text)]" },
  { path: "recommend", label: "추천", bgClass: "bg-[var(--tab-recommend)]", textClass: "text-[var(--tab-recommend-text)]" },
  { path: "archive", label: "아카이브", bgClass: "bg-[var(--tab-archive)]", textClass: "text-[var(--tab-archive-text)]" },
  { path: "settings", label: "설정", icon: Settings, bgClass: "bg-[var(--tab-settings)]", textClass: "text-[var(--tab-settings-text)]" },
];

const NOTEBOOK_LAYOUT = {
  baseWidth: 1064,
  baseHeight: 728,
  maxScale: 1.12,
  pageWidth: 1000,
  pageHeight: 680,
  shadowWidth: 1040,
  shadowHeight: 720,
  pageOffsetX: 20,
  pageOffsetY: 24,
  shadowOffsetY: 4,
  padding: 24,
};

function getNotebookScale() {
  if (typeof window === "undefined") return 1;

  const availableWidth = window.innerWidth - NOTEBOOK_LAYOUT.padding;
  const availableHeight = window.innerHeight - NOTEBOOK_LAYOUT.padding;

  return Math.max(0.25, Math.min(
    NOTEBOOK_LAYOUT.maxScale,
    availableWidth / NOTEBOOK_LAYOUT.baseWidth,
    availableHeight / NOTEBOOK_LAYOUT.baseHeight,
  ));
}

function NotebookPage({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <div className="w-[500px] h-[680px] relative overflow-hidden">
      <div
        className={`w-full h-full relative overflow-hidden ${isLeft ? "rounded-l-md" : "rounded-r-md"}`}
        style={{
          background: isLeft
            ? "var(--notebook-page-gradient-left)"
            : "var(--notebook-page-gradient-right)",
          boxShadow: isLeft
            ? "var(--notebook-left-page-shadow)"
            : "var(--notebook-right-page-shadow)",
        }}
      >
        <div
          className={`absolute top-2 bottom-2 ${isLeft ? "right-0" : "left-0"} w-[25px] pointer-events-none`}
          style={{
            background: isLeft
              ? "var(--notebook-left-edge-gradient)"
              : "var(--notebook-right-edge-gradient)",
          }}
        />
        <div
          className={`paper-texture absolute inset-0 pointer-events-none ${isLeft ? "rounded-l-md" : "rounded-r-md"}`}
        />
      </div>
    </div>
  );
}

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notebookScale, setNotebookScale] = useState(getNotebookScale);
  const activePage = location.pathname === "/" ? "home" : location.pathname.slice(1);

  useEffect(() => {
    const updateNotebookScale = () => {
      setNotebookScale(getNotebookScale());
    };

    updateNotebookScale();
    window.addEventListener("resize", updateNotebookScale);

    return () => {
      window.removeEventListener("resize", updateNotebookScale);
    };
  }, []);

  const handleTabClick = (path: string) => {
    navigate(path === "home" ? "/" : `/${path}`);
  };

  const shellStyle: CSSProperties = {
    width: NOTEBOOK_LAYOUT.baseWidth * notebookScale,
    height: NOTEBOOK_LAYOUT.baseHeight * notebookScale,
  };

  const scaledStageStyle: CSSProperties = {
    transform: `scale(${notebookScale})`,
    transformOrigin: "top left",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--notebook-bg)] relative overflow-hidden p-3">
      <div
        className="absolute inset-0 opacity-50"
        style={{ background: "var(--notebook-bg-radial)" }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "var(--notebook-texture-lines)" }}
      />

      <div className="relative z-[2]" style={shellStyle}>
        <div
          className="absolute left-0 rounded-xl z-[1] pointer-events-none"
          style={{
            ...scaledStageStyle,
            top: NOTEBOOK_LAYOUT.shadowOffsetY * notebookScale,
            width: NOTEBOOK_LAYOUT.shadowWidth,
            height: NOTEBOOK_LAYOUT.shadowHeight,
            boxShadow: "var(--notebook-desk-shadow)",
          }}
        />

        <div
          className="absolute flex z-[2]"
          style={{
            ...scaledStageStyle,
            left: NOTEBOOK_LAYOUT.pageOffsetX * notebookScale,
            top: NOTEBOOK_LAYOUT.pageOffsetY * notebookScale,
            width: NOTEBOOK_LAYOUT.pageWidth,
            height: NOTEBOOK_LAYOUT.pageHeight,
          }}
        >
          <NotebookPage side="left" />
          <NotebookPage side="right" />

          <div
            className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 z-10 pointer-events-none"
            style={{ background: "var(--notebook-spine-gradient)" }}
          >
            <div
              className="absolute left-1/2 top-[30px] bottom-[30px] w-0.5 -translate-x-1/2"
              style={{ background: "var(--notebook-spine-stitches)" }}
            />
          </div>

          <div
            className="absolute left-2 right-2 h-[5px] top-[-4px] z-[3] rounded-t-sm"
            style={{
              background: "var(--notebook-page-edge-gradient)",
              boxShadow: "var(--notebook-page-edge-top-shadow)",
            }}
          />
          <div
            className="absolute left-2 right-2 h-[5px] bottom-[-4px] z-[3] rounded-b-sm"
            style={{
              background: "var(--notebook-page-edge-gradient)",
              boxShadow: "var(--notebook-page-edge-bottom-shadow)",
            }}
          />

          <div className="absolute top-0 left-0 w-[1000px] h-[680px] z-[9] flex pointer-events-none">
            <div className="pointer-events-auto w-full h-full">
              <Outlet />
            </div>
          </div>

          <div className="absolute left-full top-10 bottom-10 flex flex-col items-start gap-1.5 z-20">
            {TABS.map((tab) => (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                data-page={tab.path}
                aria-label={tab.label}
                title={tab.label}
                className={`w-11 h-auto border-none rounded-r-md cursor-pointer flex items-center justify-center
                  font-['Nanum_Pen_Script'] text-sm tracking-wider relative transition-all duration-[0.25s]
                  shadow-[var(--shadow-tab)] py-4 px-3.5 ${tab.bgClass} ${tab.textClass}
                  hover:w-14 hover:shadow-[var(--shadow-tab-hover)]
                  ${tab.path === "settings" ? "mt-auto" : ""}
                  ${activePage === tab.path ? "active shadow-[var(--shadow-tab-active)] font-bold" : ""}`}
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                <div
                  className="absolute inset-0 rounded-r-md pointer-events-none"
                  style={{ boxShadow: "var(--notebook-tab-inset-shadow)" }}
                />
                {tab.icon ? <tab.icon className="h-5 w-5" aria-hidden="true" /> : tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
