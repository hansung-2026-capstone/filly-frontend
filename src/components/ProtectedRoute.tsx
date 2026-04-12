import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // OAuth 로그인 후 URL 쿼리 파라미터로 전달된 토큰을 localStorage에 저장
  const params = new URLSearchParams(window.location.search);
  const urlAccessToken = params.get('accessToken');
  const urlRefreshToken = params.get('refreshToken');

  if (urlAccessToken) {
    localStorage.setItem('accessToken', urlAccessToken);
    if (urlRefreshToken) {
      localStorage.setItem('refreshToken', urlRefreshToken);
    }
    // 보안을 위해 URL에서 토큰 파라미터 제거
    params.delete('accessToken');
    params.delete('refreshToken');
    const cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', cleanUrl);
  }

  // 로컬 스토리지에서 accessToken 조회
  const token = localStorage.getItem('accessToken');

  // 토큰이 없는 경우: 로그인 페이지로 이동
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 토큰이 있는 경우: 자식 컴포넌트를 화면에 렌더링
  return <>{children}</>;
};