"use client";

import { ChevronLeft } from "lucide-react";
import { HospitalCard } from "./HospitalCard";

interface FavoriteHospitalsPageProps {
  onBack: () => void;
  favoriteHospitals: any[];
  onToggleFavorite: (hospital: any) => void;
  getHospitalReviewCount?: (hospitalId: number) => number;
}

export function FavoriteHospitalsPage({
  onBack,
  favoriteHospitals,
  onToggleFavorite,
  getHospitalReviewCount,
}: FavoriteHospitalsPageProps) {
  return (
    <div className="relative bg-[#F7F7F7] flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-center border-b border-gray-100 w-full bg-[#f7f7f7] relative">
        <button
          onClick={onBack}
          className="absolute left-4 xs:left-6 sm:left-8 w-6 h-6 flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <span className="text-[19px] font-semibold text-[#1A1A1A]">
          찜한 병원
        </span>
      </header>

      {/* Content */}
      <div className="px-4 xs:px-6 sm:px-8 pt-5 pb-20 space-y-3">
        {favoriteHospitals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500">
              찜한 병원이 없습니다
            </p>
            <p className="text-sm text-gray-400 mt-2">
              병원 검색에서 하트를 눌러 저장해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                isInFavoritePage={true} // 찜한 병원 페이지임을 표시
                onClick={() => {
                  // 병원 상세 페이지로 이동하는 로직 추가 가능
                }}
                reviewCount={
                  getHospitalReviewCount
                    ? getHospitalReviewCount(hospital.id)
                    : 0
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}