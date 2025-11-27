import React, { useState } from "react";
import { Heart, Star, Search, ChevronLeft } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback"; // 경로에 맞게 수정 필요
import { toast } from "sonner@2.0.3"; // 경로에 맞게 수정 필요

// ============================================================================
// 1. HospitalCard 컴포넌트 (병원 카드 UI)
// ============================================================================

// 데이터 타입 정의
interface Hospital {
  id: number;
  name: string;
  specialtyText: string;
  hours: string;
  distance: string;
  address: string;
  isAvailableNow: boolean;
  rating: number;
  reviews: number;
  imageUrl: string;
}

interface HospitalCardProps {
  hospital: Hospital;
  onClick?: () => void;
  isFavorite?: boolean;
  favoriteHospitals?: any[];
  onToggleFavorite?: (hospital: any) => void;
  isInFavoritePage?: boolean;
  reviewCount?: number;
}

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
      : favoriteHospitals?.some((h) => h.id === hospital.id) ||
        false;

  const displayReviewCount =
    reviewCount !== undefined ? reviewCount : hospital.reviews;

  return (
    <div
      onClick={(e) => {
        if (hospital.name === "매일건강의원") {
          onClick?.(e);
        } else {
          toast.info("준비 중입니다.");
        }
      }}
      // [스타일] 카드형 디자인 (그림자, 둥근 모서리, 좌우 여백)
      className="flex flex-col bg-white pt-[22px] pb-[26px] px-5 rounded-[16px] mb-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* 상단: 썸네일 + 텍스트 */}
      <div className="flex gap-4 items-start">
        {/* 썸네일 이미지 */}
        <div className="w-12 h-12 rounded-[8px] overflow-hidden flex-shrink-0 border border-[#f0f0f0">
          <ImageWithFallback
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 병원 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h3 className="text-[19px] font-semibold text-[#202020] leading-tight truncate  leading-[1.3]">
                {hospital.name}
              </h3>
              <p className="text-sm text-[#777777] mt-0.5 font-normal">
                {hospital.specialtyText}
              </p>
            </div>

            {/* 찜하기 버튼 */}
            <button
              className={`ml-2 transition-colors ${
                isHospitalFavorite
                  ? "text-[#FF0000]"
                  : "text-[#AEAEAE] hover:text-[#FF6666]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                // 찜하기 로직 (토스트 메시지 등)
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
                className={
                  isHospitalFavorite ? "fill-red-500" : ""
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* 하단: 진료시간, 위치, 뱃지 */}
      <div className="mt-2">
        <div className="flex items-center text-[15px] text-[#555555]leading-[1.3] mb-1">
          <span className="font-medium text-[#3685DB] mr-2">
            오늘 진료
          </span>
          <span className="font-normal">{hospital.hours}</span>
        </div>

        <p className="text-[15px] text-[#777777] mb-1 truncate font-medium mr-1">
          {hospital.distance}{" "}
          <span className="text-[#777777] mx-1 font-medium">
            |
          </span>{" "}
          <span className="font-normal">
            {hospital.address}
          </span>
        </p>
        <div className="flex items-center gap-2 mt-2">
          {hospital.isAvailableNow && (
            <span className="bg-[#2ECACA] text-white text-[12px] font-medium px-2 py-[4px] rounded-[20px]">
              즉시 접수 가능
            </span>
          )}
          <div className="flex items-center gap-1 text-[14px]">
            <Star size={16} className="fill-[#FFB800] text-[#FFB800]" />
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

// ============================================================================
// 2. HospitalSearchPage 컴포넌트 (전체 페이지 레이아웃)
// ============================================================================

export default function HospitalSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] =
    useState("거리순");

  // 더미 데이터
  const dummyHospitals: Hospital[] = [
    {
      id: 1,
      name: "매일건강의원",
      specialtyText: "가정의학과 전문의 2명",
      hours: "10:00-20:00",
      distance: "37m",
      address: "서울 서초구 서초대로 59번길 19, 201호",
      isAvailableNow: true,
      rating: 4.8,
      reviews: 223,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "365클리닉 강남본점",
      specialtyText: "피부과 전문의 3명",
      hours: "09:30-20:30",
      distance: "58m",
      address: "서울 서초구 서초대로 16가길, 3층",
      isAvailableNow: true,
      rating: 4.6,
      reviews: 12,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "사랑니쏙쏙 강남본점",
      specialtyText: "치과 전문의 1명",
      hours: "10:00-18:00",
      distance: "167m",
      address: "서울 서초구 강남대로 102",
      isAvailableNow: true,
      rating: 4.7,
      reviews: 41,
      imageUrl: "https://via.placeholder.com/150",
    },
  ];

  const filters = [
    "거리순",
    "진료중",
    "즉시접수가능",
    "야간진료",
    "약국",
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {" "}
      {/* 전체 배경 회색 */}
      {/* 1. 헤더 */}
      <div className="sticky top-0 z-10 bg-white">
        <div className="flex items-center p-4">
          <button className="p-1 mr-2">
            <ChevronLeft size={24} color="#1A1A1A" />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold text-[#1A1A1A] -ml-8">
            병원찾기
          </h1>
        </div>

        {/* 2. 검색창 (이미지 스타일 적용: 민트색 테두리) */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center bg-white border-2 border-[#2DC7B7] rounded-[8px] px-3 py-2.5 shadow-sm">
              <Search
                size={20}
                className="text-[#2DC7B7] mr-2"
              />
              <input
                type="text"
                placeholder="진료과, 병원이름을 검색해보세요"
                className="flex-1 bg-transparent outline-none text-[15px] text-[#1A1A1A] placeholder-gray-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-500 text-[15px] font-medium whitespace-nowrap"
            >
              취소
            </button>
          </div>
        </div>

        {/* 3. 필터 태그 (가로 스크롤) */}
        <div className="px-4 py-3 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`
                flex-shrink-0 px-3.5 py-[7px] rounded-full text-[13px] font-semibold border transition-all
                ${
                  selectedFilter === filter
                    ? "bg-[#2DC7B7] border-[#2DC7B7] text-white" // 선택됨 (민트색 배경)
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" // 선택 안됨 (흰색 배경 + 회색 테두리)
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      {/* 4. 병원 리스트 */}
      <div className="mt-2 pb-10">
        {dummyHospitals.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            onClick={() => console.log(hospital.name)}
          />
        ))}
      </div>
    </div>
  );
}