import React from 'react';
import { FaBookOpen } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { SiNaver } from 'react-icons/si';
import { FcGoogle } from 'react-icons/fc';

// 소셜 로그인 버튼 컴포넌트
interface SocialButtonProps {
  provider: 'kakao' | 'naver' | 'google';
  children: React.ReactNode;
  onClick?: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, children, onClick }) => {
  // 공급자별 기본 스타일
  const baseStyle = "w-full h-12 flex items-center justify-center gap-3 rounded-xl text-[15px] font-medium transition-all duration-200 hover:shadow-md";
  
  const styles = {
    kakao: `${baseStyle} bg-[#FEE500] text-[#191919] hover:bg-[#FDD835]`,
    naver: `${baseStyle} bg-[#03C75A] text-white hover:bg-[#02B351]`,
    google: `${baseStyle} bg-white text-[#191919] border border-[#DADCE0] hover:bg-[#F8F9FA]`,
  };

  const renderIcon = () => {
    // const iconStyle = "w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold";
    if (provider === 'kakao') return <RiKakaoTalkFill size={20} />;
    if (provider === 'naver') return <SiNaver size={16} />;
    if (provider === 'google') return <FcGoogle size={20} />;
    return null;
  };

  return (
    <button className={styles[provider]} onClick={onClick}>
      {renderIcon()}
      {children}
    </button>
  );
};

const LoginPage: React.FC = () => {
  // 실제 로그인 동작을 구현할 함수들 (나중에 백엔드와 연결)
  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도`);
    
    // const BACKEND_URL = `https://filly-backend-997421794532.asia-northeast3.run.app`;
    const BACKEND_URL = 'https://filly-diary.com';
    window.location.href = `${BACKEND_URL}/api/oauth2/authorization/${provider}`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
      {/* 로고 & 슬로건 구역 */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-[#6C6052] rounded-2xl flex items-center justify-center mb-5 shadow-inner">
          <FaBookOpen className="text-white text-3xl font-light" />
        </div>
        <h1 className="text-3xl font-bold text-[#191919] mb-3">Filly</h1>
        <p className="text-[#757575] text-sm leading-relaxed">
            취향을 기록하고, 나를 발견하는 공간
        </p>
      </div>
      
      {/* 로그인 카드 */}
      <div className="w-full max-w-[440px] bg-white p-10 md:p-8 rounded-[16px] shadow-lg flex flex-col items-center">
        {/* 소셜 로그인 버튼 구역 */}
        <div className="w-full flex flex-col gap-4 mb-4">
          <p className="text-[#757575] text-[13px] text-center mb-2">
            소셜 계정으로 간편하게 시작하세요
          </p>
          <SocialButton provider="kakao" onClick={() => handleSocialLogin('kakao')}>
            카카오로 시작하기
          </SocialButton>
          <SocialButton provider="naver" onClick={() => handleSocialLogin('naver')}>
            네이버로 시작하기
          </SocialButton>
          <SocialButton provider="google" onClick={() => handleSocialLogin('google')}>
            Google로 시작하기
          </SocialButton>
        </div>
      </div>

      {/* 하단 약관 & 둘러보기 */}
      <div className="w-full py-10 text-center text-[12px] text-[#A5A5A5] leading-relaxed">
        <p>
          로그인 시 <span className="underline cursor-pointer">서비스 이용약관</span> 및 <span className="underline cursor-pointer">개인정보 처리방침</span>에 동의하게 됩니다.
        </p>
        <div className="mt-5">
          <span className="underline cursor-pointer hover:text-[#757575]">둘러보기</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;