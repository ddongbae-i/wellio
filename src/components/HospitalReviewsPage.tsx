"use client";

import {
  Star,
  ThumbsUp,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";
import Bot from "../assets/images/welli.svg";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import ChevronDown from "../assets/images/icon_chevron_down_20.svg";

// 이름 마스킹 함수 (뒤 2자를 **로 처리)
const maskName = (name: string): string => {
  if (name.length <= 2) return name;
  return name.slice(0, -2) + "**";
};

interface Review {
  id: string | number; // string도 허용
  author: string;
  date: string;
  visitType: string;
  rating: number;
  likes: number;
  liked?: boolean; // 사용자가 좋아요를 눌렀는지 여부
  tags: string[];
  content: string;
  originalId?: number; // 원본 ID (좋아요 토글용)
}

interface KeywordStat {
  keyword: string;
  count: number;
  percentage: number;
}

interface HospitalReviewsPageProps {
  onBack: () => void;
  hospitalName?: string;
  reviews?: Review[];
  keywordStats?: KeywordStat[];
  onToggleLike?: (reviewId: number) => void; // 좋아요 토글 핸들러
  currentUserName?: string; // 현재 사용자 이름
}

export function HospitalReviewsPage({
  onBack,
  hospitalName = "매일건강의원",
  reviews = [],
  keywordStats = [],
  onToggleLike,
}: HospitalReviewsPageProps) {
  // 👉 실제 서버에 있는 총 리뷰 수 (디자인용 숫자)
  const TOTAL_REVIEW_COUNT = 223;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  // 필터 상태 관리 ('popular' | 'latest')
  const [sortFilter, setSortFilter] = useState<"popular" | "latest">(
    "popular",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 더보기 버튼 상태 (처음에 10개만 표시)
  const [visibleCount, setVisibleCount] = useState(10);

  // 리뷰 정렬
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortFilter === "popular") {
      // 인기순: likes 내림차순
      return b.likes - a.likes;
    } else {
      // 최신순: date 내림차순 (날짜 문자열 비교)
      return b.date.localeCompare(a.date);
    }
  });

  // 평균 별점 계산 (디테일 페이지와 동일한 느낌으로 사용)
  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      ).toFixed(1)
      : "4.8";

  const reviewStats = [
    {
      keyword: "과잉진료가 없어요",
      count: 0,
      percentage: 96,
    },
    {
      keyword: "친절해요",
      count: 0,
      percentage: 92,
    },
    {
      keyword: "재진료 희망해요",
      count: 0,
      percentage: 77,
    },
  ];

  return (
    <div className="relative min-h-screen bg-white flex flex-col max-w-[500px] mx-auto">
      {/* 1. 헤더 */}
      <header className="sticky top-0 z-20 bg-white px-5 xs:px-6 sm:px-8 py-4 flex items-center justify-center bg-[#f7f7f7]/80 backdrop-blur-xs relative min-h-[80px]">
        <button
          onClick={onBack}
          className="absolute left-4 xs:left-6 sm:left-8 w-10 h-10 flex items-center justify-start -ml-2"
        >
          <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
        </button>
        <h1 className="text-[19px] font-semibold text-[#202020]">
          {hospitalName}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-6">
        {/* 2. 상단 요약 섹션 (디테일 페이지 요약 카드 안쪽 디자인 복붙) */}
        <div className="px-5 xs:px-6 sm:px-8 pt-[22px] pb-[26px] border-b-[4px] border-[#f7f7f7]">
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
                  (223)
                </span>
              </div>
            </div>

            {/* 세로 구분선 */}
            <div className="flex items-center py-3">
              <div className="w-[1px] h-full bg-[#f0f0f0]"></div>
            </div>

            <div className="flex-1 space-y-1">
              {reviewStats.map((item) => (
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

          <div className="bg-[#FFF8F8] rounded-[12px] px-2 py-3 flex flex-col items-center text-center gap-2">
            <div className="flex items-center gap-2 text-[#0A2E2E] text-[14px] font-normal leading-[1.3]">
              <img src={Bot} alt="웰리" className="w-[26px] h-[26px]" />
              <span>AI 웰리 요약</span>
            </div>
            <p className="text-[15px] font-medium text-[#0A2E2E] leading-[1.3]">
              처방받은 약 효과가 좋다는 후기가 많아요
            </p>
          </div>
        </div>

        {/* 3. 필터 + 총 개수 영역 (버튼 디자인/위치 디테일 페이지와 동일) */}
        <div className="px-5 xs:px-6 sm:px-8 pt-[28px] bg-white">
          <div className="flex items-center justify-between">
            <div className="relative">
              <button
                className="flex items-center gap-1 border border-[#d9d9d9] rounded-full px-[16px] py-[6px] text-[15px] text-[#2b2b2b]"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                {sortFilter === "popular" ? "인기순" : "최신순"}{" "}
                <img src={ChevronDown} alt="내림" className="w-5 h-5" />
              </button>
              {isFilterOpen && (
                <div className="absolute top-full mt-2 left-[8px] bg-white border border-[d9d9d9] rounded-[12px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] overflow-hidden z-10 flex flex-col">
                  <button
                    className={`px-5 pt-3 pb-1 text-[15px] text-center hover:bg-gray-50 ${sortFilter === "popular"
                      ? "font-medium text-[#2b2b2b]"
                      : "font-normal text-[#aeaeae]"
                      }`}
                    onClick={() => {
                      setSortFilter("popular");
                      setIsFilterOpen(false);
                    }}
                  >
                    인기순
                  </button>
                  <button
                    className={`px-5 pt-1 pb-3 text-[15px] text-center hover:bg-gray-50 ${sortFilter === "latest"
                      ? "font-medium text-[#2b2b2b]"
                      : "font-normal text-[#aeaeae]"
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

            <span className="text-sm text-[#2b2b2b]">
              총 233개
            </span>
          </div>
        </div>

        {/* 4. 리뷰 리스트 */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[28px] text-center">
            <Star size={48} className="text-[#e8e8e8] mb-4" />
            <p className="text-[#777777] text-[17px]">
              아직 작성된 리뷰가 없습니다
            </p>
            <p className="text-[#777777] text-[17px] mt-2">
              첫 번째 리뷰를 남겨보세요!
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#f0f0f0]">
              {sortedReviews.slice(0, visibleCount).map((review) => (
                <div
                  key={review.id}
                  className="px-[30px] xs:px-8 sm:px-10 py-[28px]"
                >
                  {/* 헤더: 별점, 유저정보, 좋아요 */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? "text-[#FFB800] fill-[#FFB800]"
                              : "fill-[#e8e8e8] stroke-none"
                          }
                        />
                      ))}
                      <span className="text-[12px] text-[#777777] ml-1">
                        {maskName(review.author)} | {review.date} |{" "}
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
                      className={`flex items-center gap-1 text-xs transition-colors active:scale-100 ${review.liked
                        ? "text-[#2ECACA]"
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

                  {/* 태그 */}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {review.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[12px] text-[#239C9C] border border-[#2ECACA] px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 내용 */}
                  <p className="text-[15px] text-[#555555] leading-[1.4] whitespace-pre-line">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
            {/* 더보기 버튼 */}
            {visibleCount < TOTAL_REVIEW_COUNT && (
              <div className="px-5 xs:px-6 sm:px-8 py-6">
                <button
                  onClick={() =>
                    setVisibleCount((prev) =>
                      Math.min(prev + 10, TOTAL_REVIEW_COUNT)
                    )
                  }
                  className="w-full mt-6 h-12 text-[#2b2b2b] border border-[#e8e8e8] rounded-[12px] bg-white hover:bg-gray-50"
                >
                  더보기 ({visibleCount} / {TOTAL_REVIEW_COUNT})
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
