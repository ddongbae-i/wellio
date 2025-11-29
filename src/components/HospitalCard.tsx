// src/components/HospitalCard.tsx
import React from "react";
import { Heart, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";

// 오늘 상태 타입
export type TodayStatus = "open" | "closed" | "break";

// 병원 데이터 타입 (다른 파일과 공유용)
export interface Hospital {
  id: number;
  name: string;
  specialtyText: string;
  hours: string;
  distance: string;
  address: string;
  todayStatus: TodayStatus;
  rating: number;
  reviews: number;
  imageUrl: string;
}

interface HospitalCardProps {
  hospital: Hospital;
  onClick?: () => void;
  isFavorite?: boolean;
  favoriteHospitals?: Hospital[];
  onToggleFavorite?: (hospital: Hospital) => void;
  isInFavoritePage?: boolean;
  reviewCount?: number;
}

/** 병원 카드 UI 컴포넌트 */
export function HospitalCard({
  hospital,
  onClick,
  isFavorite,
  favoriteHospitals,
  onToggleFavorite,
  isInFavoritePage,
  reviewCount,
}: HospitalCardProps) {
  const isHospitalFavorite =
    isFavorite !== undefined
      ? isFavorite
      : favoriteHospitals?.some((h) => h.id === hospital.id) || false;

  const displayReviewCount =
    reviewCount !== undefined ? reviewCount : hospital.reviews;

  const statusConfig = {
    open: {
      label: "오늘 진료",
      className: "text-[#3685DB]", // 활성 파란색
    },
    closed: {
      label: "오늘 휴무",
      className: "text-[#AEAEAE]", // 비활성 회색
    },
    break: {
      label: "휴게 시간",
      className: "text-[#AEAEAE]", // 비활성 회색
    },
  } as const;

  const todayStatusStyle = statusConfig[hospital.todayStatus];

  return (
    <div
      onClick={() => {
        if (hospital.name === "매일건강의원") {
          onClick?.();
        } else {
          toast.info("준비 중입니다.");
        }
      }}
      className={hospitalCardClasses.wrapper}
    >
      {/* 상단: 썸네일 + 텍스트 */}
      <div className={hospitalCardClasses.topRow}>
        {/* 썸네일 이미지 */}
        <div className={hospitalCardClasses.thumbnailWrapper}>
          <ImageWithFallback
            src={hospital.imageUrl}
            alt={hospital.name}
            className={hospitalCardClasses.thumbnailImage}
          />
        </div>

        {/* 병원 정보 */}
        <div className={hospitalCardClasses.infoWrapper}>
          <div className={hospitalCardClasses.infoHeaderRow}>
            <div className="flex flex-col">
              <h3 className={hospitalCardClasses.title}>
                {hospital.name}
              </h3>
              <p className={hospitalCardClasses.specialty}>
                {hospital.specialtyText}
              </p>
            </div>

            {/* 찜하기 버튼 */}
            <button
              className={`${hospitalCardClasses.favoriteButtonBase} ${isHospitalFavorite
                  ? "text-[#FF0000]"
                  : "text-[#AEAEAE] hover:text-[#FF6666]"
                }`}
              onClick={(e) => {
                e.stopPropagation();
                if (isHospitalFavorite) {
                  toast.success("즐겨찾기에서 제거되었습니다.");
                } else {
                  toast.success("즐겨찾기에 추가되었습니다.");
                }
                onToggleFavorite?.(hospital);
              }}
            >
              <Heart
                size={22}
                className={isHospitalFavorite ? "fill-[#FF0000]" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 하단: 진료시간, 위치, 뱃지 */}
      <div className={hospitalCardClasses.bottomWrapper}>
        {/* 오늘 상태 + 영업 시간 */}
        <div className={hospitalCardClasses.statusRow}>
          <span
            className={`font-medium mr-2 ${todayStatusStyle.className}`}
          >
            {todayStatusStyle.label}
          </span>
          <span className="font-normal text-[#555555]">
            {hospital.hours}
          </span>
        </div>

        {/* 거리 + 주소 */}
        <p className={hospitalCardClasses.addressRow}>
          {hospital.distance}{" "}
          <span className="text-[#777777] mx-1 font-medium">|</span>{" "}
          <span className="font-normal">{hospital.address}</span>
        </p>

        {/* 뱃지 + 별점 */}
        <div className={hospitalCardClasses.badgeRow}>
          {hospital.todayStatus === "open" && (
            <span className={hospitalCardClasses.badgeImmediate}>
              즉시 접수 가능
            </span>
          )}

          <div className={hospitalCardClasses.ratingRow}>
            <Star
              size={16}
              className="fill-[#FFB800] text-[#FFB800]"
            />
            <span className="text-[#555555] font-normal">
              {hospital.rating}
            </span>
            <span className="text-[#555555] font-normal">
              ({displayReviewCount})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HospitalCard 각 영역에 쓰이는 className 정리
 * → 다른 페이지에서 그대로 참고해서 동일 스타일 유지 가능
 */
export const hospitalCardClasses = {
  // 카드 전체
  wrapper:
    "flex flex-col bg-white pt-[22px] pb-[26px] px-5 rounded-[16px] mb-3 " +
    "shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] cursor-pointer " +
    "hover:shadow-[0_4px_6px_0_rgba(201,208,216,0.25)] transition-shadow",

  // 상단 영역: 썸네일 + 텍스트
  topRow: "flex gap-4 items-start",

  // 썸네일 컨테이너
  thumbnailWrapper:
    "w-12 h-12 rounded-[8px] overflow-hidden flex-shrink-0 border border-[#f0f0f0]",

  // 썸네일 이미지
  thumbnailImage: "w-full h-full object-cover",

  // 텍스트 영역 전체
  infoWrapper: "flex-1 min-w-0",

  // 제목 + 찜 버튼 가로 정렬
  infoHeaderRow: "flex justify-between items-start",

  // 병원명
  title:
    "text-[19px] font-semibold text-[#202020] leading-[1.3] truncate",

  // 진료과/설명
  specialty: "text-sm text-[#777777] mt-0.5 font-normal",

  // 찜 버튼
  favoriteButtonBase: "ml-2 transition-colors",

  // 하단 전체 래퍼
  bottomWrapper: "mt-2",

  // 오늘 상태 + 시간 row
  statusRow:
    "flex items-center text-[15px] leading-[1.3] mb-1",

  // 거리 + 주소 row
  addressRow:
    "text-[15px] text-[#777777] mb-1 truncate font-medium mr-1",

  // 뱃지 + 별점 row
  badgeRow: "flex items-center gap-2 mt-2",

  // '즉시 접수 가능' 뱃지
  badgeImmediate:
    "bg-[#2ECACA] text-white text-[12px] font-medium px-2 py-[4px] rounded-[20px]",

  // 별점 영역
  ratingRow: "flex items-center gap-1 text-[14px]",
};
