import { SettingsProfileSection } from "../components/SettingsProfileSection";

export function SettingsPage() {
  return (
    <div className="flex w-full h-full font-['Nanum_Myeongjo']">
      <div className="flex-1 flex flex-col py-8 px-8 overflow-y-auto">
        <header className="mb-10">
          <div className="text-[11px] tracking-[3px] text-[var(--text-page-label)] uppercase">
            Settings
          </div>
          <h1 className="mt-2 text-[24px] font-bold tracking-[1px] text-text-stronger">
            설정
          </h1>
        </header>

        <section className="w-full max-w-[390px]">
          <div className="mb-3 flex items-end justify-between border-b border-border-light pb-2">
            <h2 className="text-[13px] font-bold tracking-[1px] text-text-muted">
              계정
            </h2>
            <span className="text-[10px] tracking-[2px] text-[var(--text-page-label)] uppercase">
              Profile
            </span>
          </div>

          <SettingsProfileSection />
        </section>
      </div>

      <div className="flex-1 flex flex-col py-8 px-8 overflow-y-auto">
        <div className="mt-[92px] w-full max-w-[390px] border-t border-border-light" />
      </div>
    </div>
  );
}
