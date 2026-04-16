import { Outlet, useNavigate, useLocation } from "react-router";

export function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (path: string) => {
    navigate(path === "home" ? "/" : `/${path}`);
  };

  const getActivePage = () => {
    if (location.pathname === "/") return "home";
    return location.pathname.slice(1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--notebook-bg)] relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(92,74,58,0.8) 0%, rgba(92,74,58,0.4) 50%, transparent 100%)",
        }}
      />

      {/* Texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "repeating-linear-gradient(92deg, transparent, transparent 18px, rgba(0,0,0,0.03) 18px, rgba(0,0,0,0.03) 19px)",
        }}
      />

      {/* Scene */}
      <div className="relative z-[2]">
        {/* Desk shadow */}
        <div
          className="absolute w-[920px] h-[640px] rounded-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] pointer-events-none"
          style={{
            boxShadow:
              "0 40px 80px rgba(0,0,0,0.45), 0 15px 35px rgba(0,0,0,0.3)",
          }}
        />

        {/* Notebook */}
        <div className="relative flex w-[880px] h-[600px] z-[2]">
          {/* Left page */}
          <div className="w-[440px] h-[600px] relative overflow-hidden">
            <div
              className="w-full h-full relative rounded-l-md"
              style={{
                background:
                  "linear-gradient(135deg, #f5f0e6 0%, #faf6ed 40%, #f2ecdf 100%)",
                boxShadow:
                  "inset -6px 0 14px -6px rgba(0,0,0,0.03), inset 0 0 60px rgba(0,0,0,0.03)",
              }}
            >
              {/* Gradient edge effect */}
              <div
                className="absolute top-2 bottom-2 right-0 w-[25px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to left, rgba(0,0,0,0.04), transparent)",
                }}
              />

              {/* Paper texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-l-md"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120,100,80,0.15) 2px, rgba(120,100,80,0.15) 3px),
                    repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(100,80,60,0.1) 3px, rgba(100,80,60,0.1) 4px)
                  `,
                }}
              />
            </div>
          </div>

          {/* Right page */}
          <div className="w-[440px] h-[600px] relative overflow-hidden">
            <div
              className="w-full h-full relative rounded-r-md"
              style={{
                background:
                  "linear-gradient(225deg, #f5f0e6 0%, #faf6ed 40%, #f2ecdf 100%)",
                boxShadow:
                  "inset 6px 0 14px -6px rgba(0,0,0,0.03), inset 0 0 60px rgba(0,0,0,0.03)",
              }}
            >
              {/* Gradient edge effect */}
              <div
                className="absolute top-2 bottom-2 left-0 w-[25px] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.04), transparent)",
                }}
              />

              {/* Paper texture */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-r-md"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120,100,80,0.15) 2px, rgba(120,100,80,0.15) 3px),
                    repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(100,80,60,0.1) 3px, rgba(100,80,60,0.1) 4px)
                  `,
                }}
              />
            </div>
          </div>

          {/* Spine */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.07) 45%, rgba(0,0,0,0.07) 55%, rgba(0,0,0,0.05) 75%, rgba(0,0,0,0.02) 100%)",
            }}
          >
            <div
              className="absolute left-1/2 top-[30px] bottom-[30px] w-0.5 -translate-x-1/2"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, transparent, transparent 16px, rgba(120,100,80,0.08) 16px, rgba(120,100,80,0.08) 24px)",
              }}
            />
          </div>

          {/* Page edges */}
          <div
            className="absolute left-2 right-2 h-[5px] top-[-4px] z-[3] rounded-t-sm"
            style={{
              background:
                "repeating-linear-gradient(to right, #ede8dc, #ede8dc 1px, #e5dfd2 1px, #e5dfd2 2px)",
              boxShadow: "0 -1px 2px rgba(0,0,0,0.08)",
            }}
          />
          <div
            className="absolute left-2 right-2 h-[5px] bottom-[-4px] z-[3] rounded-b-sm"
            style={{
              background:
                "repeating-linear-gradient(to right, #ede8dc, #ede8dc 1px, #e5dfd2 1px, #e5dfd2 2px)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          />

          {/* Content overlay */}
          <div className="absolute top-0 left-0 w-[880px] h-[600px] z-[9] flex pointer-events-none">
            <div className="pointer-events-auto w-full h-full">
              <Outlet />
            </div>
          </div>

          {/* Sticky tabs */}
          <div className="absolute right-[-44px] top-10 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => handleTabClick("home")}
              data-page="home"
              className={`w-11 h-auto border-none rounded-r-md cursor-pointer flex items-center justify-center
                font-['Nanum_Pen_Script'] text-sm tracking-wider relative transition-all duration-[0.25s]
                shadow-[2px_2px_6px_rgba(0,0,0,0.15)] py-3 px-4 pr-0
                bg-[var(--tab-home)] text-[var(--tab-home-text)]
                hover:translate-x-1 hover:shadow-[3px_3px_10px_rgba(0,0,0,0.2)]
                ${getActivePage() === "home" ? "active -translate-x-1.5 shadow-[1px_2px_4px_rgba(0,0,0,0.12)] font-bold" : ""}`}
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              <div
                className="absolute inset-0 rounded-r-md pointer-events-none"
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)" }}
              />
              홈
            </button>

            <button
              onClick={() => handleTabClick("stats")}
              data-page="stats"
              className={`w-11 h-auto border-none rounded-r-md cursor-pointer flex items-center justify-center
                font-['Nanum_Pen_Script'] text-sm tracking-wider relative transition-all duration-[0.25s]
                shadow-[2px_2px_6px_rgba(0,0,0,0.15)] py-3 px-4 pr-0
                bg-[var(--tab-stats)] text-[var(--tab-stats-text)]
                hover:translate-x-1 hover:shadow-[3px_3px_10px_rgba(0,0,0,0.2)]
                ${getActivePage() === "stats" ? "active -translate-x-1.5 shadow-[1px_2px_4px_rgba(0,0,0,0.12)] font-bold" : ""}`}
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              <div
                className="absolute inset-0 rounded-r-md pointer-events-none"
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)" }}
              />
              통계
            </button>

            <button
              onClick={() => handleTabClick("recommend")}
              data-page="recommend"
              className={`w-11 h-auto border-none rounded-r-md cursor-pointer flex items-center justify-center
                font-['Nanum_Pen_Script'] text-sm tracking-wider relative transition-all duration-[0.25s]
                shadow-[2px_2px_6px_rgba(0,0,0,0.15)] py-3 px-4 pr-0
                bg-[var(--tab-recommend)] text-[var(--tab-recommend-text)]
                hover:translate-x-1 hover:shadow-[3px_3px_10px_rgba(0,0,0,0.2)]
                ${getActivePage() === "recommend" ? "active -translate-x-1.5 shadow-[1px_2px_4px_rgba(0,0,0,0.12)] font-bold" : ""}`}
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              <div
                className="absolute inset-0 rounded-r-md pointer-events-none"
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)" }}
              />
              추천
            </button>

            <button
              onClick={() => handleTabClick("archive")}
              data-page="archive"
              className={`w-11 h-auto border-none rounded-r-md cursor-pointer flex items-center justify-center
                font-['Nanum_Pen_Script'] text-sm tracking-wider relative transition-all duration-[0.25s]
                shadow-[2px_2px_6px_rgba(0,0,0,0.15)] py-3 px-4 pr-0
                bg-[var(--tab-archive)] text-[var(--tab-archive-text)]
                hover:translate-x-1 hover:shadow-[3px_3px_10px_rgba(0,0,0,0.2)]
                ${getActivePage() === "archive" ? "active -translate-x-1.5 shadow-[1px_2px_4px_rgba(0,0,0,0.12)] font-bold" : ""}`}
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              <div
                className="absolute inset-0 rounded-r-md pointer-events-none"
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.25)" }}
              />
              아카이브
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
