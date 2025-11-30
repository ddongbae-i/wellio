import { useState } from "react";
import { HospitalCard } from "./HospitalCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, type Variants } from "motion/react";
import "swiper/css";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import Search from "../assets/images/icon_search_color.svg";

import { hospitalList } from "./hospitalInfo";
import type { Hospital } from "./hospitalInfo";

interface HospitalSearchPageProps {
  onBack: () => void;
  onHospitalClick: (hospital: Hospital) => void;
  favoriteHospitals: Hospital[];
  onToggleFavorite: (hospital: Hospital) => void;
  getHospitalReviewCount?: (hospitalId: number) => number;
}

export function HospitalSearchPage({
  onBack,
  onHospitalClick,
  favoriteHospitals,
  onToggleFavorite,
  getHospitalReviewCount,
}: HospitalSearchPageProps) {
  const [selectedFilter, setSelectedFilter] = useState("거리순");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const filters = [
    "거리순",
    "진료중",
    "즉시접수가능",
    "야간진료",
    "약/주사",
    "24시간",
    "당일 검사",
  ];

  // ✅ 이 페이지에서 보여줄 카드 id 순서
  const cardIds = [1, 2, 3, 4, 5, 6, 7];

  // id 배열 기준으로 hospitalInfo에서 데이터 가져오기
  const hospitalsToShow: Hospital[] = cardIds
    .map((id) => hospitalList.find((h) => h.id === id))
    .filter((h): h is Hospital => Boolean(h));

  // 🔍 검색어 적용 (이름 + 전문 텍스트)
  const filteredHospitals = hospitalsToShow.filter((hospital) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const name = hospital.name.toLowerCase();
    const specialty = hospital.specialtyText.toLowerCase();

    return name.includes(query) || specialty.includes(query);
  });

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
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
    <div className="bg-[#f7f7f7] flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f7f7f7]/80 backdrop-blur-xs">
        <motion.header
          className="relative px-5 xs:px-6 sm:px-8 pt-4 space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center pb-2 relative">
            <button onClick={onBack} className="absolute left-0 w-10 p-2 -ml-2">
              <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
            </button>
            <h1 className="text-[19px] font-semibold text-[#202020]">병원 찾기</h1>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className={`flex-1 rounded-[12px] px-5 py-2 flex items-center gap-2 transition-all border-[1.6px] h-10 bg-white ${isSearchFocused ? "border-[#2ECACA]" : "border-[#2ECACA]"}`}>
              <img src={Search} alt="검색" className="w-6 h-6" />
              <input
                type="text"
                placeholder="진료과, 병원이름을 검색해보세요"
                className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#aeaeae] text-sm text-[#777777] font-normal leading-[1.4]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
            <button className="text-[#777777] text-[17px] font-noraml">취소</button>
          </div>
        </motion.header>

        {/* Filter Tags - 헤더 밖, 하지만 sticky 영역 안 */}
        <div className="filter-swiper-wrapper pb-5 mt-4">
          <Swiper
            slidesPerView="auto"
            spaceBetween={8}
            className="w-full !pb-3"
          >
            {filters.map((filter) => (
              <SwiperSlide
                key={filter}
                className="!w-auto filter-swiper-slide"  // ✅ 별도 클래스만
              >
                <button
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-2 rounded-full whitespace-nowrap transition-colors text-sm ${selectedFilter === filter
                    ? "bg-[#BCEEEE] border border-[#BCEEEE] text-[#2b2b2b] font-medium"
                    : "border border-[#aeaeae] text-[#777] font-normal"
                    }`}
                >
                  {filter}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
      {/* Hospital List */}
      <motion.div
        className="overflow-y-hidden pb-10 space-y-3 px-5 xs:px-6 sm:px-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1">
          {filteredHospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              variants={itemVariants}
            >
              <HospitalCard
                hospital={hospital}
                onClick={() => onHospitalClick(hospital)}
                favoriteHospitals={favoriteHospitals}
                onToggleFavorite={onToggleFavorite}
                reviewCount={getHospitalReviewCount?.(hospital.id)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
