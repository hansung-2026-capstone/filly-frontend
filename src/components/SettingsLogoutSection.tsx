import { LogOut, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { logout } from "../api/auth";
import { Portal } from "./Portal";

function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function SettingsLogoutSection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeModal = () => {
    if (isLoggingOut) return;
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    void logout().catch(() => undefined);
    clearAuthTokens();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <section
      className="mt-auto w-full border-t border-border-light pt-5"
      aria-label="로그아웃"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-[14px] font-bold tracking-[1px] text-text-muted">
            로그아웃
          </h3>
          <p className="mt-1 text-[12px] leading-[1.6] text-text-secondary">
            이 기기에 저장된 로그인 정보를 삭제해요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[var(--bg-danger-weak)] px-3 py-1.5 text-[12px] font-bold text-[var(--text-danger-dark)] transition-colors hover:bg-[var(--bg-danger-weak-hover)]"
        >
          <LogOut className="w-3 h-3" aria-hidden="true" />
          로그아웃
        </button>
      </div>

      {isModalOpen && (
        <Portal>
          <div
            className="fixed inset-0 bg-bg-overlay z-[600] flex items-center justify-center backdrop-blur-[2px]"
            onClick={closeModal}
          >
            <div
              className="relative bg-notebook-page rounded-xl w-[360px] shadow-[var(--shadow-modal)] overflow-hidden font-['Nanum_Myeongjo']"
              style={{
                animation: "modalSlideUp 0.3s cubic-bezier(0.22,1,0.36,1)",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="paper-texture absolute inset-0 pointer-events-none rounded-xl z-0" />
              <div className="relative z-10 flex items-center justify-between py-4 px-5 pb-3.5 border-b border-border-light">
                <div className="text-sm text-text-primary tracking-[0.5px]">
                  로그아웃
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoggingOut}
                  className="w-7 h-7 border-none bg-transparent cursor-pointer rounded-md flex items-center justify-center transition-all duration-150 hover:bg-[var(--bg-hover-soft)] disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="로그아웃 창 닫기"
                >
                  <X className="w-4 h-4 text-[var(--text-icon-muted)]" />
                </button>
              </div>

              <div className="relative z-10 px-5 py-5">
                <p className="text-[14px] font-bold text-text-stronger">
                  정말 로그아웃을 하시겠습니까?
                </p>
                <p className="mt-2 text-[12px] leading-[1.6] text-text-secondary">
                  현재 기기에서 다시 로그인해야 해요.
                </p>
              </div>

              <div className="relative z-10 flex justify-end gap-2 px-5 py-3 border-t border-border-light">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoggingOut}
                  className="px-4 py-1.5 text-[13px] text-text-muted bg-bg-hover border border-border-medium rounded-md cursor-pointer hover:bg-bg-selected-hover transition-all duration-150 font-['Nanum_Myeongjo'] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-4 py-1.5 text-[13px] text-[var(--text-white-soft)] bg-[var(--bg-danger-confirm)] border border-transparent rounded-md cursor-pointer hover:bg-[var(--bg-danger-confirm-hover)] transition-all duration-150 font-['Nanum_Myeongjo'] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </section>
  );
}
