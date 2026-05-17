import { SettingsPreferencesSection } from "../components/SettingsPreferencesSection";
import { SettingsLogoutSection } from "../components/SettingsLogoutSection";
import { SettingsProfileSection } from "../components/SettingsProfileSection";
import { SettingsThemeSection } from "../components/SettingsThemeSection";

export function SettingsPage() {
  return (
    <div className="flex h-auto w-full flex-col font-['Nanum_Myeongjo'] md:h-full md:flex-row">
      <div className="flex flex-col px-5 py-6 md:flex-1 md:overflow-y-auto md:px-8 md:py-8">
        <header className="mb-5">
          <div className="text-[11px] tracking-[3px] text-[var(--text-page-label)] uppercase">
            Settings
          </div>
          <h1 className="mt-2 text-[20px] font-bold tracking-[1px] text-text-stronger">
            설정
          </h1>
        </header>

        <section className="w-full md:max-w-[390px]">
          <div className="mb-3 flex items-end justify-between border-b border-border-light pb-2">
            <h2 className="text-[14px] font-bold tracking-[1px] text-text-muted">
              계정
            </h2>
            <span className="text-[11px] tracking-[2px] text-[var(--text-page-label)] uppercase">
              Profile
            </span>
          </div>

          <SettingsProfileSection />
          <SettingsThemeSection />
        </section>
      </div>

      <div className="flex flex-col px-5 pb-6 md:flex-1 md:overflow-y-auto md:px-8 md:py-8">
        <section className="flex w-full flex-col md:min-h-full md:max-w-[390px]">
          <div>
            <div className="mb-3 flex items-end justify-between border-b border-border-light pb-2">
              <h2 className="text-[14px] font-bold tracking-[1px] text-text-muted">
                AI 초안 스타일
              </h2>
              <span className="text-[11px] tracking-[2px] text-[var(--text-page-label)] uppercase">
                AI Draft
              </span>
            </div>

            <SettingsPreferencesSection />
          </div>
          <SettingsLogoutSection />
        </section>
      </div>
    </div>
  );
}
