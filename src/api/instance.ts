import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken } from "./auth";
import { API_BASE_URL } from "./config";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: ReturnType<typeof refreshAccessToken> | null = null;

const clearAuthAndRedirect = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000, // Todo: 적절한 타임아웃 시간으로 조정 필요 (임시로 AI 응답 대기 시간 고려하여 넉넉하게 설정)
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const isRefreshing = false;
const pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || originalRequest.url?.includes("/api/v1/auth/refresh")) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= refreshAccessToken();
      const { accessToken } = await refreshPromise;

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);
