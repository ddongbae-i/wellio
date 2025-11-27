import { ChevronLeft, Search } from "lucide-react";
import { useState } from "react";
import { HospitalCard } from "./HospitalCard"; // 수정된 HospitalCard 임포트
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface HospitalSearchPageProps {
  onBack: () => void;
  onHospitalClick: (hospital: any) => void;
  favoriteHospitals: any[];
  onToggleFavorite: (hospital: any) => void;
  getHospitalReviewCount?: (hospitalId: number) => number;
}

export function HospitalSearchPage({
  onBack,
  onHospitalClick,
  favoriteHospitals,
  onToggleFavorite,
  getHospitalReviewCount,
}: HospitalSearchPageProps) {
  const [selectedFilter, setSelectedFilter] =
    useState("거리순");
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

  // hospital 데이터는 변경 없음
  const hospitals = [
    {
      id: 1,
      name: "매일건강의원",
      department: "가정의학과",
      specialtyText: "가정의학과와 전문의 2명",
      hours: "10:00-20:00",
      distance: "37m",
      address: "서울 서초구 서초대로 59번길 19, 201호",
      phone: "02-1234-5678",
      description:
        "환자 중심의 진료를 제공하는 가정의학과 전문 병원입니다. 만성질환 관리부터 건강검진까지 종합적인 의료 서비스를 제공합니다.",
      isAvailableNow: true,
      rating: 4.8,
      reviews: 223,
      imageUrl:
        "https://images.unsplash.com/photo-1580281658136-17c835359e86?w=100&h=100&fit=crop",
      latitude: 37.4949,
      longitude: 127.0283,
    },
    {
      id: 2,
      name: "365클리닉 강남본점",
      department: "피부과",
      specialtyText: "피부과와 전문의 3명",
      hours: "09:30-20:30",
      distance: "58m",
      address: "서울 서초구 서초대로 16가길, 3층",
      phone: "02-2345-6789",
      description:
        "최신 피부과 시술 장비를 갖춘 전문 클리닉입니다. 여드름, 미백, 안티에이징 등 다양한 피부 치료를 제공합니다.",
      isAvailableNow: true,
      rating: 4.6,
      reviews: 12,
      imageUrl:
        "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
      latitude: 37.495,
      longitude: 127.0285,
    },
    {
      id: 3,
      name: "사랑니쏙쏙 강남본점",
      department: "치과",
      specialtyText: "치과",
      hours: "10:00-18:00",
      distance: "167m",
      address: "서울 서초구 강남대로 102",
      phone: "02-3456-7890",
      description:
        "사랑니 발치 전문 치과입니다. 통증 최소화와 빠른 회복을 위한 최신 시술 방법을 사용합니다.",
      isAvailableNow: true,
      rating: 4.7,
      reviews: 41,
      imageUrl:
        "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
      latitude: 37.4955,
      longitude: 127.029,
    },
    {
      id: 4,
      name: "강남예쁜이치과의원",
      department: "치과",
      specialtyText: "치과",
      hours: "09:00-19:00",
      distance: "720m",
      address: "서울시 강남구 선릉로 345",
      phone: "02-4567-8901",
      description:
        "심미 치과 치료를 전문으로 하는 치과입니다. 라미네이트, 임플란트 등 다양한 치료를 제공합니다.",
      isAvailableNow: false,
      rating: 4.7,
      reviews: 312,
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop",
      latitude: 37.496,
      longitude: 127.0295,
    },
  ];

  // 검색어에 따라 병원 필터링
  const filteredHospitals = hospitals.filter((hospital) => {
    if (!searchQuery.trim()) return true; // 검색어가 없으면 모두 표시

    const query = searchQuery.toLowerCase();
    const name = hospital.name.toLowerCase();
    const department = hospital.department.toLowerCase();

    return name.includes(query) || department.includes(query);
  });

  return (
    <div className="bg-[#f7f7f7] flex flex-col min-h-screen">
      {/* Header: sticky, z-10, bg-white, border-b 유지 */}
      <header className="sticky top-0 z-10 bg-[#f7f7f7] px-4 xs:px-6 sm:px-8 pt-4 pb-2 space-y-4">
        {/* Title Bar */}
        <div className="flex items-center justify-center pb-2 relative">
          <button onClick={onBack} className="absolute left-0 w-10 p-2 -ml-2">
            <ChevronLeft size={24} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-[19px] font-semibold text-[#1A1A1A]">
            병원 찾기
          </h1>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div
            className={`flex-1 bg-transparent rounded-lg px-4 py-3 flex items-center gap-4 transition-all border-2 ${
              isSearchFocused
                ? "border-[#2ECACA]"
                : "border-[#2ECACA]"
            }`}
          >
            <Search size={20} className="text-[#2ECACA]" />
            <input
              type="text"
              placeholder="진료과, 병원이름을 검색해보세요"
              className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-[#aeaeae]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>
          <button className="text-[#777777] text-[17px] font-noraml">
            취소
          </button>
        </div>

        {/* Filter Tags: Swiper로 변경 */}
        <Swiper
          slidesPerView="auto"
          spaceBetween={8}
          className="w-full !pb-3"
        >
          {filters.map((filter) => (
            <SwiperSlide
              key={filter}
              className="!w-auto first:!ml-0"
            >
              <button
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-2 rounded-full whitespace-nowrap transition-colors text-sm ${
                  selectedFilter === filter
                    ? "bg-[#BCEEEE] border border-[#BCEEEE] text-[#2b2b2b] font-medium"
                    : "border border-[#aeaeae] text-[#777] font-normal"
                }`}
              >
                {filter}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </header>

      {/* Hospital List: 내부 스크롤 방지 유지 */}
      <div className="overflow-y-hidden pb-20 space-y-3 px-4 xs:px-6 sm:px-8">
        <div className="grid grid-cols-1">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onClick={() => onHospitalClick(hospital)}
              favoriteHospitals={favoriteHospitals}
              onToggleFavorite={onToggleFavorite}
              reviewCount={getHospitalReviewCount?.(
                hospital.id,
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}