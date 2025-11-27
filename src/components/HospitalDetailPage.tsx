"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Star,
  ChevronRight,
  ClipboardList,
  ThumbsUp,
  CheckCircle2,
  Bot,
  ChevronDown,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { DoctorCard } from "./DoctorCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

// 👇 발급받은 키를 여기에 유지해주세요
const KAKAO_MAP_API_KEY = "ee7ef6c37b67c27768d7dcb2f13f0a83";

// 이름 마스킹 함수 (뒤 2자를 **로 처리)
const maskName = (name: string): string => {
  if (name.length <= 2) return name;
  return name.slice(0, -2) + "**";
};

interface Hospital {
  id: number;
  name: string;
  department: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}

interface HospitalDetailPageProps {
  hospital: Hospital;
  onBack: () => void;
  onReviewsClick?: () => void;
  reviewCount?: number;
  averageRating?: number;
  keywordStats?: Array<{
    keyword: string;
    count: number;
    percentage: number;
  }>;
  previewReviews?: Array<{
    id: string | number; // string도 허용
    author: string;
    date: string;
    rating: number;
    tags: string[];
    content: string;
    likes: number;
    liked?: boolean; // 사용자가 좋아요를 눌렀는지 여부
    visitType?: "첫방문" | "재방문"; // 방문 타입 추가
    originalId?: number; // 원본 ID (좋아요 토글용)
  }>;
  onToggleLike?: (reviewId: number) => void; // 좋아요 토글 핸들러
  currentUserName?: string; // 현재 사용자 이름
}

export function HospitalDetailPage({
  hospital,
  onBack,
  onReviewsClick,
  reviewCount = 0,
  averageRating = 0,
  keywordStats = [],
  previewReviews = [],
  onToggleLike,
  currentUserName,
}: HospitalDetailPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 필터 상태 관리
  const [sortFilter, setSortFilter] = useState<
    "popular" | "latest"
  >("popular");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 리뷰 정렬 및 미리보기 3개만 표시
  const sortedReviews = [...previewReviews].sort((a, b) => {
    if (sortFilter === "popular") {
      return b.likes - a.likes;
    } else {
      return b.date.localeCompare(a.date);
    }
  });

  // 미리보기용 리뷰 데이터 (3개만 표시)
  const userReviews =
    sortedReviews.length > 0
      ? sortedReviews.slice(0, 3)
      : [
          {
            id: 1,
            author: "김민수",
            date: "2025.05.22",
            rating: 5,
            tags: ["진료 만족해요", "친절해요"],
            content:
              "목이 아프고 근육통이 심해서 방문했는데 친절하게 진료 잘 봐주셔서 좋았습니다!",
            likes: 6,
            visitType: "첫방문" as "첫방문" | "재방문",
          },
          {
            id: 2,
            author: "박지영",
            date: "2025.01.29",
            rating: 5,
            tags: [
              "진료 만족해요",
              "재진료 희망해요",
              "친절해요",
            ],
            content:
              "만족스러운 첫 방문! 이사 와서 처음 방문했는데, 앞으로 꾸준히 다닐 것 같습니다.",
            likes: 15,
            visitType: "재방문" as "첫방문" | "재방문",
          },
          {
            id: 3,
            author: "이현우",
            date: "2024.12.10",
            rating: 4,
            tags: ["대기시간이 짧아요", "친절해요"],
            content:
              "항상 친절하게 맞아주셔서 감사합니다. 대기 시간이 짧아서 바쁜 직장인에게 딱이에요.",
            likes: 2,
            visitType: "재방문" as "첫방문" | "재방문",
          },
        ];

  // 1. 카카오맵 스크립트 로드 (표준 방식)
  useEffect(() => {
    if (
      window.kakao &&
      window.kakao.maps &&
      window.kakao.maps.services
    ) {
      setIsMapLoaded(true);
      return;
    }

    const scriptId = "kakao-map-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if (
        window.kakao &&
        window.kakao.maps &&
        window.kakao.maps.services
      ) {
        setIsMapLoaded(true);
      } else {
        existingScript.addEventListener("load", () =>
          setIsMapLoaded(true),
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsMapLoaded(true);
      });
    };

    document.head.appendChild(script);
  }, []);

  // 2. 맵 그리기 & 주소 검색 (디버그 로그 제거됨)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;

    // 지도 생성
    const mapOption = {
      center: new window.kakao.maps.LatLng(
        37.566826,
        126.9786567,
      ), // 기본값
      level: 3,
    };
    const map = new window.kakao.maps.Map(
      mapRef.current,
      mapOption,
    );

    // 주소 검색 (Geocoding)
    if (window.kakao.maps.services) {
      const geocoder =
        new window.kakao.maps.services.Geocoder();

      geocoder.addressSearch(
        hospital.address,
        function (result: any, status: any) {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x,
            );

            const marker = new window.kakao.maps.Marker({
              map: map,
              position: coords,
            });

            map.setCenter(coords);
          } else {
            // 검색 실패 시 데이터 좌표 사용
            if (hospital.latitude && hospital.longitude) {
              const coords = new window.kakao.maps.LatLng(
                hospital.latitude,
                hospital.longitude,
              );
              new window.kakao.maps.Marker({
                map: map,
                position: coords,
              });
              map.setCenter(coords);
            }
          }
        },
      );
    }
  }, [
    isMapLoaded,
    hospital.address,
    hospital.latitude,
    hospital.longitude,
  ]);

  const handleDirections = () => {
    const lat = hospital.latitude;
    const lng = hospital.longitude;

    if (lat && lng) {
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)},${lat},${lng}`,
        "_blank",
      );
    } else {
      window.open(
        `https://map.kakao.com/link/to/${encodeURIComponent(hospital.name)}`,
        "_blank",
      );
    }
  };

  const doctors = [
    {
      id: 1,
      name: "박진희 의사",
      specialty: "가정의학과 전문의",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
    },
    {
      id: 2,
      name: "김민수 의사",
      specialty: "내과 전문의",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
    },
    {
      id: 3,
      name: "이영희 의사",
      specialty: "소아청소년과 전문의",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
    },
  ];

  const medicalSubjects = [
    "가정의학과",
    "내과",
    "소아청소년과",
    "피부과",
    "정신건강의학과",
    "노인진료과",
  ];

  return (
    <div className="relative min-h-screen bg-[#F7F7F7] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-center border-b border-gray-100 relative">
        <button
          onClick={onBack}
          className="absolute left-4 xs:left-6 sm:left-8 w-6 h-6 flex items-center justify-center"
        >
          <ChevronLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[19px] font-semibold text-[#1A1A1A]">
          {hospital.name}
        </h1>
      </header>

      <main className="flex-1 pb-32 overflow-y-auto">
        {/* Top Image Area */}
        <div className="w-full h-[240px] md:h-[320px] overflow-hidden bg-gray-200">
          <ImageWithFallback
            src={hospital.imageUrl}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hospital Main Info Card */}
        <div className="relative z-10 mx-4 sm:mx-6 md:mx-8 -mt-20">
          <div className="bg-white rounded-[16px] shadow-lg px-5 pt-[22px] pb-[26px]">
            {/* Title Row */}
            <div className="flex items-end gap-1 mb-1">
              <h2 className="text-[19px] font-semibold text-[#202020] leading[1.3">
                {hospital.name}
              </h2>
              <span className="text-[#777777] text-sm font-normal">
                {hospital.department}
              </span>
            </div>

            {/* Time Row */}
            <div className="flex items-center gap-1 mb-1">
              <Clock size={15} className="text-[#777777]" />
              <span className="text-[#3685DB] font-medium text-[15px]">
                오늘 진료
              </span>
              <span className="text-[#555555] text-[15px]">
                {hospital.hours}
              </span>
            </div>

            {/* Address Row */}
            <div className="mb-4">
              <p className="text-[#777777] text-[15px] leading-[1.3]">
                {hospital.address}
              </p>
            </div>

            {/* Button */}
            <button className="w-full h-[48px] rounded-[12px] border border-[#e8e8e8] text-[#555555] text-sm font-normal hover:bg-gray-50 transition-colors">
              병원정보 자세히보기
            </button>
          </div>
        </div>

        {/* Insurance Banner */}
        <div className="mx-4 sm:mx-6 md:mx-8 mt-5 bg-[#E7F8F9] rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          {/* 아이콘 영역 */}
          <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
            <img
              src="/images/insurance-icon.png" // 원하는 아이콘 이미지 경로
              alt="보험 아이콘"
              className="w-full h-full object-contain"
            />
          </div>

          {/* 텍스트 */}
          <div className="flex flex-col">
            <h3 className="font-medium text-[#003A79] text-[17px]">
              원클릭 실손보험 연동하기
            </h3>
            <p className="text-[12px] font-medium text-[#586574] mt-1">
              한 번의 클릭으로 실손보험을 청구해 보세요.
            </p>
          </div>
        </div>

        {/* 1. 진료 과목 */}
        <div className="mt-5 px-4 xs:px-6 sm:px-8">
          <h3 className="text-[19px] font-semibold text-[#202020] mb-2 ml-[6px]">
            진료 과목
          </h3>
          <div className="flex flex-wrap gap-x-1 gap-y-2">
            {medicalSubjects.map((subject) => (
              <span
                key={subject}
                className="bg-[#f0f0f0] text-[#555555] px-3 py-1 rounded-[30px] text-[14px] font-normal"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* 2. 의사 정보 */}
        <div className="mt-4">
          <div className="px-5 xs:px-6 sm:px-8">
            <h3 className="text-[19px] font-semibold text-[#202020] mb-2 ml-[6px]">
              의사 정보
            </h3>
          </div>
          <div>
            <Swiper
              slidesPerView="auto"
              spaceBetween={12}
              className="!px-4 xs:!px-6 sm:!px-8"
            >
              {doctors.map((doctor) => (
                <SwiperSlide
                  key={doctor.id}
                  style={{ width: "263px" }}
                >
                  <DoctorCard doctor={doctor} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* 3. 병원 위치 */}
        <div className="mt-8 px-4 xs:px-6 sm:px-8">
          <h3 className="text-[19px] font-semibold text-[#202020] mb-2 ml-[6px]">
            병원 위치
          </h3>
          <div className="bg-white rounded-[16px] shadow-sm overflow-hidden">
            {/* 지도 영역 */}
            <div
              ref={mapRef}
              className="w-full h-[200px] bg-[#333333]"
            />
            <div className="px-5 pt-[12px] pb-[26px]">
              <p className="text-[17px] font-medium text-[#2b2b2b] leading-[1.3] mb-2">
                {hospital.address}
              </p>
              <div className="flex flex-wrap items-center gap-1 text-sm text-[#555555] mb-5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#BEA861] text-white text-[12px] shrink-0">
                  9
                </span>
                <span className="flex items-center justify-center h-5 px-[6px] rounded-full bg-[#9E373F] text-white text-[12px] shrink-0">
                  신분당선
                </span>
                <span>신논현역 7번출구에서 214m</span>
              </div>
              <Button
                onClick={handleDirections}
                variant="outline"
                className="w-full h-12 text-[#555555] border-[#e8e8e8] bg-white font-medium hover:bg-gray-50 rounded-[12px] flex items-center justify-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                길찾기
              </Button>
            </div>
          </div>
        </div>

        {/* 4. 병원 후기 */}
        <div className="mt-4 px-5 xs:px-6 sm:px-8">
          <h3 className="text-[19px] font-semibold text-[#202020] mb-2 ml-[6px]">
            병원 후기
          </h3>

          {/* 요약 카드 */}
          <div className="bg-white rounded-[16px] px-5 pt-[22px] pb-[26px] shadow-sm mb-3">
            <div className="flex gap-4 mb-4">
              <div className="flex items-center justify-center min-w-[80px]">
                <Star
                  size={28}
                  className="text-[#FFB800] fill-[#FFB800]"
                />
                <div className="flex flex-col items-center ml-3">
                  <span className="text-[28px] font-semibold text-[#2b2b2b]">
                    {averageRating}
                  </span>
                  <span className="text-[15px] text-[#555555]">
                    ({reviewCount})
                  </span>
                </div>
              </div>

              {/* 세로 구분선 */}
              <div className="flex items-center py-3">
                <div className="w-[1px] h-full bg-[#f0f0f0]"></div>
              </div>

              <div className="flex-1 space-y-1">
                {keywordStats.slice(0, 3).map((item) => (
                  <div key={item.keyword}>
                    <span className="text-[15px] text-[#2b2b2b] font-medium">
                      {item.keyword}
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={item.percentage}
                        className="flex-1 h-2 bg-[#f0f0f0] [&>div]:bg-[#70DADA]"
                      />
                      <span className="text-[12px] text-[#555555] min-w-[35px] text-right font-medium">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#FFF8F8] rounded-xl px-3 py-2 flex flex-col items-center text-center gap-2">
              <div className="flex items-center gap-2 text-[#0A2E2E] text-[12px] font-medium leading-[1.3]">
                <Bot size={20} />
                <span>AI 웰리 요약</span>
              </div>
              <p className="text-[15px] font-medium text-[#0A2E2E] leading-[1.3]">
                처방받은 약 효과가 좋다는 후기가 많아요
              </p>
            </div>
          </div>

          {/* 인증 배너 */}
          <div className="bg-[#F0F0F0] rounded-[12px] py-2 flex items-center justify-center gap-1 mb-3 text-[#555555] text-sm">
            <CheckCircle2 size={16} />
            <span>
              웰리오는 방문이 인증된 후기만 제공하고 있습니다
            </span>
          </div>

          {/* 뷰 리스트 카드 */}
          <div className="bg-white rounded-[16px] px-5 pt-[22px] pb-[26px] shadow-sm">
            <div className="mb-3 relative">
              <button
                className="flex items-center gap-1 border border-[#d9d9d9] rounded-full px-[16px] py-[6px] text-[15px] text-[#2b2b2b]"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                {sortFilter === "popular" ? "인기순" : "최신순"}{" "}
                <ChevronDown size={14} />
              </button>
              {isFilterOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-[d9d9d9] rounded-[12px] shadow-lg overflow-hidden z-10 w-24">
                  <button
                    className={`w-full px-5 pt-3 pb-2 text-[15px] text-center hover:bg-gray-50 ${
                      sortFilter === "popular"
                        ? "font-medium text-[#2b2b2b]"
                        : ""
                    }`}
                    onClick={() => {
                      setSortFilter("popular");
                      setIsFilterOpen(false);
                    }}
                  >
                    인기순
                  </button>
                  <button
                    className={`w-full px-5 pt-3 pb-2 text-[15px] text-center hover:bg-gray-50 ${
                      sortFilter === "latest"
                        ? "font-bold text-[#aeaeae]"
                        : ""
                    }`}
                    onClick={() => {
                      setSortFilter("latest");
                      setIsFilterOpen(false);
                    }}
                  >
                    최신순
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-[#f0f0f0] last:border-0 py-3 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < review.rating
                              ? "text-[#FFB800] fill-[#FFB800]"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-[12px] text-[#777777] ml-1">
                        {maskName(review.author)} |{" "}
                        {review.date} |{" "}
                        {review.visitType || "첫방문"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onToggleLike?.(
                          review.originalId ||
                            (typeof review.id === "number"
                              ? review.id
                              : parseInt(
                                  String(review.id).replace(
                                    /^(sample-|user-)/,
                                    "",
                                  ),
                                )),
                        )
                      }
                      className={`flex items-center gap-1 text-xs transition-colors active:scale-100 ${
                        review.liked
                          ? "text-[#36D2C5]"
                          : "text-[#aeaeae]"
                      }`}
                    >
                      <ThumbsUp
                        size={16}
                        className={
                          review.liked ? "border-[#2ECACA]" : ""
                        }
                      />
                      <span>{review.likes}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {review.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[12px] text-[#239C9C] border border-[#2ECACA] px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-[#555555] leading-[1.3] whitespace-pre-line">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full mt-6 h-12 text-gray-600 border-gray-200 rounded-xl hover:bg-gray-50"
              onClick={onReviewsClick}
            >
              {reviewCount - 3}개 리뷰 더보기
            </Button>
          </div>
        </div>

        {/* 5. 병원 접수 안내 */}
        <div className="mt-8 px-4 xs:px-6 sm:px-8">
          <h3 className="text-[19px] font-semibold text-[#202020] mb-2 ml-[6px]">
            병원 접수 안내
          </h3>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <ul className="list-disc list-outside space-y-2 pl-5 text-sm text-gray-600 leading-relaxed">
              <li>
                [즉시 접수] 후 병원 방문 시 꼭 성함과 함께
                접수처에 말씀해 주세요.
              </li>
              <li>
                접수 후 30분 이내로 미방문 시 자동으로 접수가
                취소됩니다. 주의 부탁드립니다.
              </li>
              <li>
                현장 접수 하시는 분들로 인하여 대기 현황 및 접수
                순서는 다를 수 있으니 양해 부탁드립니다.
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Bottom Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-white border-t border-gray-100 max-w-[500px] mx-auto">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1 h-14 text-lg font-bold border-2 border-[#36D2C5] text-[#36D2C5] bg-white hover:bg-gray-50 rounded-xl"
          >
            예약하기
          </Button>
          <Button className="flex-1 h-14 text-lg font-bold bg-[#36D2C5] hover:bg-[#00C2B3] text-white rounded-xl">
            즉시 접수
          </Button>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    kakao: any;
  }
}