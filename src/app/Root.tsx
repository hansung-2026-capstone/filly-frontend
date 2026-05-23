import { Settings, type LucideIcon } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useCurrentUser } from "../hook/common/useCurrentUser";
import {
  BACKGROUND_THEME_PREVIEW_EVENT,
  DEFAULT_BACKGROUND_THEME,
  getBackgroundThemeId,
  getStoredBackgroundThemeId,
  type BackgroundThemeId,
} from "../lib/backgroundTheme";

type TabConfig = {
  path: string;
  label: string;
  icon?: LucideIcon;
  bgClass: string;
  textClass: string;
};

const TABS: TabConfig[] = [
  {
    path: "home",
    label: "홈",
    bgClass: "bg-[var(--tab-home)]",
    textClass: "text-[var(--tab-home-text)]",
  },
  {
    path: "stats",
    label: "통계",
    bgClass: "bg-[var(--tab-stats)]",
    textClass: "text-[var(--tab-stats-text)]",
  },
  {
    path: "recommend",
    label: "추천",
    bgClass: "bg-[var(--tab-recommend)]",
    textClass: "text-[var(--tab-recommend-text)]",
  },
  {
    path: "archive",
    label: "아카이브",
    bgClass: "bg-[var(--tab-archive)]",
    textClass: "text-[var(--tab-archive-text)]",
  },
  {
    path: "settings",
    label: "설정",
    icon: Settings,
    bgClass: "bg-[var(--tab-settings)]",
    textClass: "text-[var(--tab-settings-text)]",
  },
];

const NOTEBOOK_LAYOUT = {
  baseWidth: 1064,
  baseHeight: 728,
  maxScale: 1.12,
  pageWidth: 1000,
  pageHeight: 680,
  shadowWidth: 1040,
  shadowHeight: 700,
  pageOffsetX: 20,
  pageOffsetY: 24,
  shadowOffsetY: 14,
  padding: 24,
};

function getNotebookScale() {
  if (typeof window === "undefined") return 1;

  const availableWidth = window.innerWidth - NOTEBOOK_LAYOUT.padding;
  const availableHeight = window.innerHeight - NOTEBOOK_LAYOUT.padding;

  return Math.max(
    0.25,
    Math.min(
      NOTEBOOK_LAYOUT.maxScale,
      availableWidth / NOTEBOOK_LAYOUT.baseWidth,
      availableHeight / NOTEBOOK_LAYOUT.baseHeight,
    ),
  );
}

function getIsMobileLayout() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
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
  const { data: user, isLoading } = useCurrentUser();
  const [notebookScale, setNotebookScale] = useState(getNotebookScale);
  const [isMobileLayout, setIsMobileLayout] = useState(getIsMobileLayout);
  const [initialStoredTheme] = useState(() => getStoredBackgroundThemeId());
  const [previewTheme, setPreviewTheme] = useState<BackgroundThemeId | null>(
    null,
  );
  const activePage =
    location.pathname === "/" ? "home" : location.pathname.slice(1);
  const savedBackgroundTheme = getBackgroundThemeId(
    user?.backgroundTheme ?? initialStoredTheme ?? DEFAULT_BACKGROUND_THEME,
  );
  const backgroundTheme = previewTheme ?? savedBackgroundTheme;

  useEffect(() => {
    const rootElement = document.documentElement;
    const previousTheme = rootElement.getAttribute("data-background-theme");

    rootElement.setAttribute("data-background-theme", backgroundTheme);

    return () => {
      if (previousTheme) {
        rootElement.setAttribute("data-background-theme", previousTheme);
      } else {
        rootElement.removeAttribute("data-background-theme");
      }
    };
  }, [backgroundTheme]);

  useEffect(() => {
    const updatePreviewTheme = (event: Event) => {
      const nextPreviewTheme = (event as CustomEvent<BackgroundThemeId | null>)
        .detail;

      setPreviewTheme(
        nextPreviewTheme ? getBackgroundThemeId(nextPreviewTheme) : null,
      );
    };

    window.addEventListener(BACKGROUND_THEME_PREVIEW_EVENT, updatePreviewTheme);

    return () => {
      window.removeEventListener(
        BACKGROUND_THEME_PREVIEW_EVENT,
        updatePreviewTheme,
      );
    };
  }, []);

  useEffect(() => {
    const updateNotebookScale = () => {
      setNotebookScale(getNotebookScale());
      setIsMobileLayout(getIsMobileLayout());
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

  const isTabActive = (path: string) => activePage === path;

  const shellStyle: CSSProperties = {
    width: NOTEBOOK_LAYOUT.baseWidth * notebookScale,
    height: NOTEBOOK_LAYOUT.baseHeight * notebookScale,
  };

  const scaledStageStyle: CSSProperties = {
    transform: `scale(${notebookScale})`,
    transformOrigin: "top left",
  };

  if (isLoading && !user && !initialStoredTheme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page-loading)]">
        <div className="text-[12px] font-bold tracking-[2px] text-[var(--text-page-label)]">
          불러오는 중
        </div>
      </div>
    );
  }

  return (
    <div
      data-background-theme={backgroundTheme}
      className="flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[var(--notebook-bg)] p-3 relative"
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{ background: "var(--notebook-bg-radial)" }}
      />

      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{ background: "var(--notebook-texture-lines)" }}
      />

      {!isMobileLayout && (
      <div className="relative z-[2]" style={shellStyle}>
        <div
          className="absolute left-0 rounded-xl z-[1] pointer-events-none"
          style={{
            ...scaledStageStyle,
            top: NOTEBOOK_LAYOUT.shadowOffsetY * notebookScale,
            width: NOTEBOOK_LAYOUT.shadowWidth,
            height: NOTEBOOK_LAYOUT.shadowHeight,
            background: "var(--notebook-cover-background)",
            backgroundSize: "var(--notebook-cover-background-size)",
            boxShadow: "var(--notebook-cover-shadow)",
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

          <div className="absolute top-0 left-0 w-[1000px] h-[680px] z-[9] flex overflow-hidden rounded-md pointer-events-none">
            <div className="pointer-events-auto w-full h-full">
              <Outlet />
            </div>
          </div>

          <div className="absolute left-full top-10 bottom-10 flex flex-col items-start gap-1.5 z-20">
            {TABS.map((tab) => {
              const isActive = isTabActive(tab.path);

              return (
                <button
                  key={tab.path}
                  onClick={() => handleTabClick(tab.path)}
                  data-page={tab.path}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`${tab.label} 탭${isActive ? ", 현재 선택됨" : ""}`}
                  title={tab.label}
                  className={`w-11 h-auto border-none rounded-r-md cursor-pointer flex items-center justify-center
                    font-['Gaegu'] text-[18px] tracking-wider relative transition-all duration-[0.25s]
                    shadow-[var(--shadow-tab)] py-4 px-3.5 ${tab.bgClass} ${tab.textClass}
                    ${tab.path === "settings" ? "mt-auto" : ""}
                    ${
                      isActive
                        ? "active z-30 w-16 font-bold shadow-[var(--shadow-tab-active)]"
                        : "hover:w-14 hover:shadow-[var(--shadow-tab-hover)]"
                    }`}
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-r-md pointer-events-none"
                    style={{ boxShadow: "var(--notebook-tab-inset-shadow)" }}
                  />
                  {tab.icon ? (
                    <tab.icon className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    tab.label
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {isMobileLayout && (
      <div className="relative z-[2] flex h-[calc(100dvh-24px)] max-h-[calc(100dvh-24px)] w-full max-w-[430px] flex-col items-stretch">
        <div className="relative min-h-0 flex-1">
          <div
            className="absolute left-1 right-1 top-1 bottom-1 rounded-[30px] pointer-events-none z-0"
            style={{
              background: "var(--notebook-cover-background)",
              backgroundSize: "var(--notebook-cover-background-size)",
              boxShadow: "var(--notebook-cover-shadow)",
            }}
          />
          <main
            className="relative z-10 mx-4 mt-4 h-[calc(100%-2rem)] overflow-hidden rounded-xl bg-notebook-page shadow-[var(--notebook-right-page-shadow)]"
            style={{ background: "var(--notebook-page-gradient-right)" }}
          >
              <div
                className="absolute left-0 top-2 bottom-2 w-[18px] pointer-events-none"
                style={{ background: "var(--notebook-right-edge-gradient)" }}
              />
              <div className="paper-texture absolute inset-0 pointer-events-none rounded-xl" />
              <div className="relative z-10 h-full overflow-y-auto overscroll-contain">
                <Outlet />
              </div>
          </main>
        </div>

        <nav className="relative z-20 mx-4 -mt-4 grid grid-cols-5 gap-1 px-2">
          {TABS.map((tab) => {
            const isActive = isTabActive(tab.path);

            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => handleTabClick(tab.path)}
                className={`relative flex min-h-10 self-start items-center justify-center rounded-b-md border-none px-1 pb-1.5 pt-3 font-['Gaegu'] text-[16px] tracking-[0.06em] shadow-[var(--shadow-tab)] transition-all duration-[0.25s] ${tab.bgClass} ${tab.textClass} ${
                  isActive
                    ? "z-30 min-h-14 pb-3 pt-3 font-bold shadow-[var(--shadow-tab-active)]"
                    : "hover:shadow-[var(--shadow-tab-hover)]"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={`${tab.label} 탭${isActive ? ", 현재 선택됨" : ""}`}
                title={tab.label}
              >
                <div
                  className="absolute inset-0 rounded-b-md pointer-events-none"
                  style={{ boxShadow: "var(--notebook-tab-inset-shadow)" }}
                />
                {tab.path === "settings" ? (
                  <span className="whitespace-nowrap leading-none">{tab.label}</span>
                ) : tab.icon ? (
                  <tab.icon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <span className="whitespace-nowrap leading-none">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      )}
    </div>
  );
}
