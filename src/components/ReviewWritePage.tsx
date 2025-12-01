"use client";

import { ChevronLeft, Star } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { motion } from "motion/react";
import { hospitalMap } from "./hospitalInfo";

interface ReviewWritePageProps {
  onBack: () => void;
  onComplete?: (reviewData: {
    hospitalId: number;
    hospitalName: string;
    hospitalImage: string;
    visitDate: string;
    rating: number;
    keywords: string[];
    reviewText: string;
    userName: string;
    userAvatar: string;
    visitType?: "첫방문" | "재방문";
  }) => void;
  hospitalName?: string;
  visitDate?: string;
  hospitalImage?: string;
  userName?: string;
  hospitalId?: number;
  editingReview?: {
    id: number;
    rating: number;
    keywords: string[];
    reviewText: string;
    visitType?: "첫방문" | "재방문";
  } | null;
}

const KEYWORDS = [
  "예약이 쉬워요",
  "주차 편해요",
  "꼼꼼해요",
  "회복이 빨라요",
  "친절해요",
  "쾌적해요",
  "진료 만족해요",
  "재진료 희망해요",
  "과잉진료가 없어요",
];

export function ReviewWritePage({
  onBack,
  onComplete,
  hospitalName = "매일건강의원",
  visitDate = "2025.08.08(월) 14:00",
  hospitalImage,
  userName = "사용자",
  hospitalId = 1,
  editingReview,
}: ReviewWritePageProps) {
  // 🔹 hospitalMap + props 를 합쳐서 최종 병원 정보 결정
  const hospitalInfoFromId =
    hospitalId !== undefined ? hospitalMap[hospitalId] : undefined;

  const hospitalInfoFromName =
    !hospitalInfoFromId && hospitalName
      ? Object.values(hospitalMap).find(
        (h) => h.name === hospitalName,
      )
      : undefined;

  const resolvedHospital = hospitalInfoFromId || hospitalInfoFromName;

  const finalHospitalId = resolvedHospital?.id ?? hospitalId ?? 0;
  const finalHospitalName = resolvedHospital?.name ?? hospitalName;
  const finalHospitalImage =
    resolvedHospital?.imageUrl ??
    hospitalImage ??
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&h=120&fit=crop";

  const [rating, setRating] = useState(
    editingReview?.rating || 0,
  );
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(
    editingReview?.keywords || [],
  );
  const [reviewText, setReviewText] = useState(
    editingReview?.reviewText || "",
  );

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(
        selectedKeywords.filter((k) => k !== keyword),
      );
    } else {
      if (selectedKeywords.length < 3) {
        setSelectedKeywords([...selectedKeywords, keyword]);
      } else {
        toast.error("키워드는 최대 3개까지 선택할 수 있습니다.");
      }
    }
  };

  const isFormValid =
    rating > 0 && selectedKeywords.length >= 1;

  const handleSubmit = () => {
    if (!isFormValid) return;

    toast.success(
      editingReview ? "리뷰가 수정되었습니다!" : "리뷰가 작성되었습니다!",
    );

    if (onComplete) {
      onComplete({
        hospitalId: finalHospitalId,
        hospitalName: finalHospitalName,
        hospitalImage: finalHospitalImage,
        visitDate,
        rating,
        keywords: selectedKeywords,
        reviewText,
        userName,
        userAvatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop",
        visitType: editingReview?.visitType,
      });
    } else {
      onBack();
    }
  };

  const isEditMode = !!editingReview;

  return (
    <motion.div
      className="relative bg-[#F7F7F7] flex flex-col max-w-[500px] mx-auto min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 xs:px-6 sm:px-8 py-4 flex items-center justify-center w-full bg-[#f7f7f7]/80 backdrop-blur-xs relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack();
          }}
          className="absolute left-4 xs:left-6 sm:left-8 w-6 h-6 flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-[#555555]" />
        </button>
        <span className="text-[19px] font-semibold text-[#202020]">
          {isEditMode ? "후기 수정" : "후기 작성"}
        </span>
      </header>

      {/* Content */}
      <div className="pb-10 px-5 xs:px-6 sm:px-8 pt-5 space-y-3">
        {/* 병원 정보 카드 */}
        <div className="flex items-center bg-white p-4 rounded-[16px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] px-5 py-4">
          <div className="w-[48px] h-[48px] rounded-[8px] overflow-hidden border border-[#f0f0f0] flex-shrink-0 mr-4">
            <ImageWithFallback
              src={finalHospitalImage}
              alt={finalHospitalName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[#2b2b2b] mb-[2px] text-[19px] font-semibold">
              {finalHospitalName}
            </p>
            <p className="text-[15px] text-[#555555]">
              {visitDate}
            </p>
          </div>
        </div>

        {/* 별점 선택 영역 */}
        <div className="bg-white px-5 pt-[22px] pb-[26px] mb-3 rounded-[16px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] text-center">
          <h3 className="text-[#202020] mb-3 text-[17px] font-medium">
            별점을 선택해 주세요.
          </h3>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={35}
                  className={`${star <= (hoveredRating || rating)
                    ? "fill-[#FFB800] text-[#FFB800]"
                    : "fill-[#e8e8e8] text-[#e8e8e8]"
                    } transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 키워드 선택 영역 */}
        <div className="bg-white px-5 pt-[22px] pb-[26px] mb-3 rounded-[16px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]">
          <div className="flex gap-1 items-center mb-3">
            <h3 className="text-[#202020] text-[17px] font-medium">키워드 선택 </h3>
            <span
              className={`${selectedKeywords.length === 3
                ? "text-[#202020]"
                : "text-[#202020]"
                }`}
            >
              {selectedKeywords.length}/3
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {KEYWORDS.map((keyword) => (
              <button
                key={keyword}
                onClick={() => handleKeywordClick(keyword)}
                className={`px-3 py-2 rounded-[8px] text-sm transition-all ${selectedKeywords.includes(keyword)
                  ? "bg-[#E2F7F7] text-[#2b2b2b] border border-[#BCEEEE]"
                  : "bg-white text-[#777777] border border-[#e8e8e8] hover:border-[#E2F7F7]"
                  }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* 리뷰 텍스트 영역 */}
        <div className="relative">
          <textarea
            value={reviewText}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                setReviewText(e.target.value);
              }
            }}
            placeholder="선택하신 키워드를 바탕으로 후기를 작성해주세요."
            className="w-full h-[150px] px-5 pt-[22px] pb-[26px] rounded-[16px] resize-none text-sm 
               focus:outline-none focus:border-[#36D2C5] transition-colors bg-white shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]"
          />

          {/* 글자수 카운트 */}
          <span className="absolute bottom-[26px] right-5 text-[12px]">
            <span className="text-[#777777]">
              {reviewText.length}
            </span>
            <span className="text-[#aeaeae]"> / 400</span>
          </span>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto p-5 pb-[46px] bg-white shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)] rounded-t-[16px]">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`h-[60px] w-full rounded-xl text-white transition-all ${isFormValid
            ? "bg-[#2ECACA] hover:bg-[#239C9C] cursor-pointer"
            : "bg-[#f0f0f0] cursor-not-allowed text-[#aeaeae]"
            }`}
        >
          {isEditMode ? "수정 완료" : "작성 완료"}
        </button>
      </div>
    </motion.div>
  );
}
