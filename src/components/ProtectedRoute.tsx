import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // 로컬 스토리지에서 accessToken 조회
  const token = localStorage.getItem('accessToken');

  // 토근이 없는 경우: 로그인 페이지로 이동
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 토큰이 있는 경우: 자식 컴포넌트를 화면에 렌더링
  return <>{children}</>;
};