import axios from "axios";

export const api = axios.create({
  baseURL: "",
  timeout: 50000, // Todo: 적절한 타임아웃 시간으로 조정 필요 (임시로 AI 응답 대기 시간 고려하여 넉넉하게 설정)
});

// 요청을 보낼 때마다 가로채서(Interceptors) 토큰을 넣어줍니다.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    // 백엔드 약속에 따라 Authorization 헤더에 토큰 주입
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 신분증이 없거나 만료됨 -> 로그인 페이지로 강제 압송
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
