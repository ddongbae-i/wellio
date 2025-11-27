"use client";

import { ArrowLeft, Star, ThumbsUp, Bot, ChevronDown, ChevronLeft } from "lucide-react";
import { Progress } from "./ui/progress";
import { useEffect, useState } from "react";

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
  currentUserName,
}: HospitalReviewsPageProps) {
  // 페이지 진입 시 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 필터 상태 관리 ('popular' | 'latest')
  const [sortFilter, setSortFilter] = useState<'popular' | 'latest'>('popular');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 리뷰 정렬
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortFilter === 'popular') {
      // 인기순: likes 내림차순
      return b.likes - a.likes;
    } else {
      // 최신순: date 내림차순 (날짜 문자열 비교)
      return b.date.localeCompare(a.date);
    }
  });

  // 리뷰 키워드 통계 데이터 (keywordStats가 비어있으면 기본값 사용)
  const reviewStats = keywordStats.length > 0
    ? keywordStats.slice(0, 3).map(stat => ({
        label: stat.keyword,
        percent: stat.percentage
      }))
    : [
        { label: "과잉진료가 없어요", percent: 96 },
        { label: "친절해요", percent: 92 },
        { label: "재진료 희망해요", percent: 77 },
      ];

  // 평균 별점 계산
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  return (
    <div className="relative min-h-screen bg-white flex flex-col max-w-[500px] mx-auto">
      {/* 1. 헤더 */}
      <header className="sticky top-0 z-20 bg-white px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-center border-b border-gray-100 relative">
        <button
          onClick={onBack}
          className="absolute left-4 xs:left-6 sm:left-8 w-10 h-10 flex items-center justify-start -ml-2"
        >
          <ChevronLeft size={24} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-[19px] font-semibold text-[#1A1A1A]">
          {hospitalName}
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-6">
        {/* 2. 상단 요약 섹션 */}
        <div className="px-4 xs:px-6 sm:px-8 pt-6 pb-8 border-b border-gray-100">
          <div className="flex gap-6 mb-6">
            {/* 왼쪽: 별점 */}
            <div className="flex flex-col items-center justify-center min-w-[80px]">
              <Star size={36} className="text-[#FFB800] fill-[#FFB800] mb-1" />
              <span className="text-[32px] font-bold text-gray-900 leading-none mt-1">
                {averageRating}
              </span>
              <span className="text-sm text-gray-400 mt-1">({reviews.length})</span>
            </div>

            {/* 오른쪽: 그래프 */}
            <div className="flex-1 space-y-3 pt-1">
              {reviewStats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>{stat.label}</span>
                    <span className="text-gray-500">{stat.percent}%</span>
                  </div>
                  <Progress
                    value={stat.percent}
                    className="h-2 bg-gray-100 [&>div]:bg-[#6DD3CE]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* AI 요약 배너 */}
          <div className="bg-[#FFF8F8] rounded-2xl p-4 flex flex-col items-center text-center gap-1.5">
            <div className="flex items-center gap-1.5 text-[#36D2C5] text-sm font-bold">
              <Bot size={20} />
              <span>AI 웰리 요약</span>
            </div>
            <p className="text-[15px] font-bold text-gray-800">
              처방받은 약 효과가 좋다는 후기가 많아요
            </p>
          </div>
        </div>

        {/* 3. 필터 및 총 개수 */}
        <div className="px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-between bg-white">
          <div className="relative">
            <button
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              {sortFilter === 'popular' ? '인기순' : '최신순'} <ChevronDown size={16} />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 w-24">
                <button
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                    sortFilter === 'popular' ? 'font-bold text-[#36D2C5]' : ''
                  }`}
                  onClick={() => {
                    setSortFilter('popular');
                    setIsFilterOpen(false);
                  }}
                >
                  인기순
                </button>
                <button
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-50 border-t border-gray-100 ${
                    sortFilter === 'latest' ? 'font-bold text-[#36D2C5]' : ''
                  }`}
                  onClick={() => {
                    setSortFilter('latest');
                    setIsFilterOpen(false);
                  }}
                >
                  최신순
                </button>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500 font-medium">총 {reviews.length}개</span>
        </div>

        {/* 4. 리뷰 리스트 */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Star size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">아직 작성된 리뷰가 없습니다</p>
            <p className="text-gray-400 text-sm mt-2">첫 번째 리뷰를 남겨보세요!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedReviews.map((review) => (
              <div key={review.id} className="px-4 xs:px-6 sm:px-8 py-6">
                {/* 헤더: 별점, 유저정보, 좋아요 */}
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={`${
                            i < review.rating
                              ? "text-[#FFB800] fill-[#FFB800]"
                              : "text-[gray-200]"
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
                      onClick={() => onToggleLike?.(review.originalId || (typeof review.id === 'number' ? review.id : parseInt(String(review.id).replace(/^(sample-|user-)/, ''))))}
                      className={`flex items-center gap-1 text-xs transition-colors active:scale-100 ${
                        review.liked
                          ? "text-[#36D2C5]"
                          : "text-[#aeaeae]"
                      }`}
                    >
                      <ThumbsUp
                        size={16}
                        className={
                          review.liked ? "fill-[#36D2C5]" : ""
                        }
                      />
                      <span>{review.likes}</span>
                    </button>
                  </div>

                {/* 태그 */}
                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-[6px] border border-[#36D2C5] text-[#36D2C5] text-[11px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 내용 */}
                <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}