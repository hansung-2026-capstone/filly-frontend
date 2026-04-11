// src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://filly-backend-997421794532.asia-northeast3.run.app',
  timeout: 5000,
});

// 요청을 보낼 때마다 가로채서(Interceptors) 토큰을 넣어줍니다.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
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
      localStorage.removeItem('userToken');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);