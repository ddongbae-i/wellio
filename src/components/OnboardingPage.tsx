"use client";

import { useState } from "react";
import { HomePage } from "./HomePage";
import { CommunityPage } from "./CommunityPage";
import { MedicalHistoryPage } from "./MedicalHistoryPage";
import { ProfilePage } from "./ProfilePage";
import { BottomNav } from "./BottomNav";

// BottomNav에서 정의된 페이지 타입과 일치하도록 정의
const pageSlugs = [
  "home",
  "community",
  "medical-history",
  "profile",
] as const;
type PageSlug = (typeof pageSlugs)[number];

interface OnboardingPageProps {
  onComplete: () => void;
  userName: string;
  posts: any[];
}

export function OnboardingPage({
  onComplete,
  userName,
  posts,
}: OnboardingPageProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "홈",
      description:
        "새로운 소식과 유용한 건강 정보를 한눈에 확인하세요",
    },
    {
      title: "커뮤니티",
      description:
        "가족과 함께 소중한 추억을 만들고 서로 응원해 보세요",
    },
    {
      title: "진료내역",
      description:
        "진료받은 날짜, 병원, 증상 등을 조회하고 필요한 정보를 바로 확인해 보세요",
    },
    {
      title: "내정보",
      description:
        "스마트 기기를 연동하고 나만의 건강 데이터를 관리하세요",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePageChange = (page: PageSlug) => {
    console.log(
      `GNB clicked: ${page}. Ignoring during onboarding.`,
    );
  };

  const dummyAction = () => {
    console.log("Dummy action called during onboarding.");
  };

  const progressPercentage =
    ((currentStep + 1) / steps.length) * 100;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touchStartX = e.touches[0].clientX;
    (e.currentTarget as HTMLElement).setAttribute(
      "data-touch-start",
      touchStartX.toString(),
    );
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchStartX = parseFloat(
      (e.currentTarget as HTMLElement).getAttribute(
        "data-touch-start",
      ) || "0",
    );
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      }
    }
  };

  const handleClick = () => {
    handleNext();
  };

  const holeRadiusPx = 32;
  const gnbCenterFromBottom = 40;
  const spreadDistance = 2000;

  return (
    <div
      className="relative min-h-screen bg-[#2c3e50] text-white overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* -------------------- 1. 배경 페이지 (흐릿하게) -------------------- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="max-w-[500px] mx-auto min-h-screen flex flex-col">
          <div className="flex-1 overflow-auto opacity-30">
            {currentStep === 0 && (
              <HomePage
                userName={userName}
                currentPage="home"
                onPageChange={handlePageChange}
              />
            )}
            {currentStep === 1 && (
              <CommunityPage
                onBack={dummyAction}
                onUploadClick={dummyAction}
                onNotificationClick={dummyAction}
                onDeletePost={dummyAction}
                posts={posts}
                currentUserName={userName}
              />
            )}
            {currentStep === 2 && (
              <MedicalHistoryPage onBack={dummyAction} />
            )}
            {currentStep === 3 && (
              <ProfilePage
                userName={userName}
                currentPage="profile"
                onPageChange={handlePageChange}
                onBack={dummyAction}
                onMyReviewsClick={dummyAction}
                onFavoriteHospitalsClick={dummyAction}
              />
            )}
          </div>
          <div className="opacity-100">
            <BottomNav
              currentPage={pageSlugs[currentStep]}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* -------------------- 2. 스포트라이트 오버레이 (구멍 뚫기) -------------------- */}
      <div className="fixed inset-0 max-w-[500px] mx-auto z-50 pointer-events-none">
        <div
          className="absolute size-16 rounded-full transition-all duration-500 ease-in-out"
          style={{
            left: `calc((100% / 4) * ${currentStep} + (100% / 8))`,
            bottom: `${gnbCenterFromBottom - holeRadiusPx}px`,
            transform: "translateX(-50%)",
            boxShadow: `0 0 0 ${spreadDistance}px rgba(0, 0, 0, 0.7)`,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              // [수정 1] inset 제거 -> 그림자가 원 밖으로 나감
              boxShadow: `0 0 15px 5px rgba(77, 194, 192, 0.8)`,
            }}
          />
        </div>
      </div>

      {/* -------------------- 3. 온보딩 텍스트 및 버튼 콘텐츠 -------------------- */}
      <div className="relative z-[60] flex flex-col min-h-screen max-w-[500px] mx-auto">
        {/* 상단 바 */}
        <div className="px-4 xs:px-6 sm:px-8 py-6 flex items-center justify-between">
          <div className="flex-1 h-1 bg-white/30 rounded-full mr-5 overflow-hidden">
            <div
              className="h-full bg-[#2ECACA] rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="text-white text-base hover:opacity-80 transition-opacity"
          >
            SKIP
          </button>
        </div>

        <div className="flex-1"></div>

        <div className="px-4 xs:px-6 sm:px-8 pt-5 pb-24">
          {/* [수정 2] Tailwind 대신 style로 RGBA 강제 적용 */}
          <div
            className="relative rounded-2xl p-5 mb-5 backdrop-blur-xs transition-colors duration-300"
            style={{
              backgroundColor: "rgba(46, 202, 202, 0.5)",
            }}
          >
            <h2 className="text-xl mb-2 font-bold">
              {steps[currentStep].title}
            </h2>
            <p className="text-sm leading-relaxed opacity-100">
              {steps[currentStep].description}
            </p>

            {/* [수정 3] 말풍선 꼬리도 동일한 RGBA 적용 */}
            <div
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                left: `calc( (100% + 40px) * (${currentStep * 2 + 1} / 8) - 20px )`,
                bottom: "-10px",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "10px solid rgba(46, 202, 202, 0.5)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}