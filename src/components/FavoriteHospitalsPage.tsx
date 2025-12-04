"use client";

import { ChevronLeft } from "lucide-react";
import { HospitalCard } from "./HospitalCard";
import { motion } from "motion/react";
import { CustomToast } from "./CustomToast";
import { useState } from "react";

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
  const [showToast, setShowToast] = useState(false);

  const handleToggleFavorite = (hospital: any) => {
    setShowToast(true);
    onToggleFavorite(hospital);
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="relative bg-[#F7F7F7] flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 xs:px-6 sm:px-8 py-4 flex items-center justify-center border-b border-gray-100 w-full bg-[#f7f7f7] relative">
        <button
          onClick={onBack}
          className="absolute left-5 xs:left-6 sm:left-8 w-6 h-6 flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <span className="text-[19px] font-semibold text-[#1A1A1A]">
          찜한 병원
        </span>
      </header>

      {/* Content */}
      <motion.div
        className="px-5 xs:px-6 sm:px-8 pt-5 pb-20 space-y-3"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {favoriteHospitals.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            variants={itemVariants}
          >
            <p className="text-gray-500">찜한 병원이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">
              병원 검색에서 하트를 눌러 저장해보세요
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {favoriteHospitals.map((hospital) => (
              <motion.div key={hospital.id} variants={itemVariants}>
                <HospitalCard
                  hospital={hospital}
                  isFavorite={true}
                  favoriteHospitals={favoriteHospitals} // 👈 추가!
                  onToggleFavorite={handleToggleFavorite}
                  isInFavoritePage={true}
                  onClick={() => {
                    // 병원 상세 페이지로 이동하는 로직 추가 가능
                  }}
                  reviewCount={
                    getHospitalReviewCount
                      ? getHospitalReviewCount(hospital.id)
                      : 0
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 커스텀 토스트 */}
      <CustomToast
        show={showToast}
        message="찜 목록에서 삭제되었습니다"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}