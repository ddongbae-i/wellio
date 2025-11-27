"use client";

import { ChevronLeft } from "lucide-react";

interface SocialLoginPageProps {
  onBack: () => void;
  onEmailLogin: () => void;
}

export function SocialLoginPage({
  onBack,
  onEmailLogin,
}: SocialLoginPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-white flex flex-col items-center justify-between px-5 py-5 max-w-[500px] mx-auto text-center">
      {/* 헤더 - 뒤로가기 버튼 */}
      <div className="w-full flex justify-start pb-5">
        <button
          onClick={onBack}
          className="text-[#555] hover:text-[#333] transition-colors"
        >
          <ChevronLeft size={24} className="text-[#1A1A1A]" />
        </button>
      </div>

      {/* 중앙 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-[80%]">
        {/* 아이콘 */}
        <div className="w-[100px] h-[100px] bg-[#00bcd4] rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-md">
          <span className="text-6xl">🦉</span>
        </div>

        {/* 메시지 */}
        <p className="text-lg leading-[1.6] text-[#2c3e50]">
          <strong>지금 웰리오를 시작하고</strong>
          <br />
          <strong>가족과 건강을 나누세요!</strong>
        </p>
      </div>

      {/* 하단 로그인 영역 */}
      <div className="w-full pb-10 flex flex-col items-center">
        {/* 소셜 버튼 그룹 */}
        <div className="flex justify-around w-full max-w-[300px] mb-5">
          {/* 카카오톡 */}
          <button className="w-[50px] h-[50px] rounded-full bg-[#fee500] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <span className="text-2xl">K</span>
          </button>

          {/* 네이버 */}
          <button className="w-[50px] h-[50px] rounded-full bg-[#03c75a] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <span className="text-2xl text-white">N</span>
          </button>

          {/* 애플 */}
          <button className="w-[50px] h-[50px] rounded-full bg-black flex items-center justify-center shadow-md hover:scale-110 transition-transform">
            <span className="text-2xl text-white"></span>
          </button>

          {/* 이메일 */}
          <button
            onClick={onEmailLogin}
            className="w-[50px] h-[50px] rounded-full bg-[#b0bec5] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <span className="text-2xl">✉️</span>
          </button>
        </div>

        {/* 안내 텍스트 */}
        <p className="text-sm text-[#7f8c8d] mb-5">
          간편하게 SNS로 로그인하세요
        </p>
      </div>
    </div>
  );
}