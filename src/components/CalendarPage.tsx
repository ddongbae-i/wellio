import { ChevronLeft, ChevronDown, Target, Trophy } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

// 💡 Swiper 라이브러리 임포트
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import "swiper/css";

import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Post {
  id: number;
  image: string;
  createdAt?: string; // YYYY-MM-DD 형식
}

interface CalendarPageProps {
  onBack: () => void;
  posts: Post[];
  onPostClick?: (postId: number) => void;
}

interface DayData {
  date: number;
  posts?: Array<{ image: string; id: number }>;
  challengeStart?: boolean;
  challengeEnd?: boolean;
  inChallenge?: boolean;
}

// 🔹 날짜 포맷 유틸: 항상 YYYY-MM-DD
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 🔹 createdAt 문자열을 안전하게 정규화
const normalizeDateKey = (raw: string): string => {
  if (!raw) return "";
  // 이미 YYYY-MM-DD면 그대로 사용
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // YYYY-M-D 같은 형태면 0 padding
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)) {
    const [y, m, d] = raw.split("-");
    return [
      y,
      m.padStart(2, "0"),
      d.padStart(2, "0"),
    ].join("-");
  }

  // 그 외는 Date로 한번 파싱해서 다시 포맷
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return formatDateKey(parsed);
  }

  return raw;
};

// 특정 년/월의 날짜 배열 생성
const generateMonthDays = (year: number, month: number): DayData[] => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();

  const days: DayData[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: 0 });
  }
  for (let i = 1; i <= lastDate; i++) {
    days.push({ date: i });
  }
  return days;
};

export function CalendarPage({ onBack, posts, onPostClick }: CalendarPageProps) {
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const swiperRef = useRef<SwiperCore | null>(null);

  // 🔹 날짜별 피드 맵핑 (이미지와 ID)
  const postsByDate = useMemo(() => {
    const map: { [key: string]: Array<{ image: string; id: number }> } = {};
    posts.forEach((post) => {
      if (post.createdAt) {
        const key = normalizeDateKey(post.createdAt);
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push({ image: post.image, id: post.id });
      }
    });
    return map;
  }, [posts]);

  // 챌린지 데이터 (가족 간 챌린지) — 기존 그대로 유지
  const challengeData: { [key: string]: Partial<DayData> } = {
    "2025-10-14": { challengeStart: true, inChallenge: true },
    "2025-10-15": { inChallenge: true },
    "2025-10-16": { challengeEnd: true, inChallenge: true },

    "2025-11-16": { challengeStart: true, inChallenge: true },
    "2025-11-17": { inChallenge: true },
    "2025-11-18": { inChallenge: true },
    "2025-11-19": { inChallenge: true },
    "2025-11-20": { inChallenge: true },
    "2025-11-21": { inChallenge: true },
    "2025-11-22": { challengeEnd: true, inChallenge: true },

    "2025-11-23": { challengeStart: true, inChallenge: true },
    "2025-11-24": { inChallenge: true },
    "2025-11-25": { challengeEnd: true, inChallenge: true },
  };

  const calendarRange = useMemo(() => {
    const range = [];
    range.push({ year: 2025, month: 8 });
    range.push({ year: 2025, month: 9 });
    range.push({ year: 2025, month: 10 });
    range.push({ year: 2025, month: 11, isCurrent: true }); // 인덱스 3
    range.push({ year: 2025, month: 12 });
    range.push({ year: 2026, month: 1 });
    range.push({ year: 2026, month: 2 });
    range.push({ year: 2026, month: 3 });
    range.push({ year: 2026, month: 4 });
    range.push({ year: 2026, month: 5 });
    return range;
  }, []);

  useEffect(() => {
    if (swiperRef.current) {
      setTimeout(() => {
        swiperRef.current?.slideTo(3, 0);
      }, 100);
    }
  }, []);

  const renderDay = (
    day: DayData,
    year: number,
    month: number,
    idx: number,
  ) => {
    if (day.date === 0) {
      return (
        <div
          key={`${year}-${month}-${idx}`}
          className="relative h-12 flex justify-center items-center"
        />
      );
    }

    // 🔹 캘린더 셀의 날짜 키도 YYYY-MM-DD로 통일
    const cellDate = new Date(year, month - 1, day.date);
    const dateKey = formatDateKey(cellDate);

    const feedPosts = postsByDate[dateKey] || [];
    const challengeInfo = challengeData[dateKey] || {};

    const currentDay: DayData = {
      ...day,
      posts: feedPosts,
      ...challengeInfo,
    };

    const isInChallengePeriod = currentDay.inChallenge;
    const isChallengeStart = currentDay.challengeStart;
    const isChallengeEnd = currentDay.challengeEnd;

    const challengeBgClass = `absolute top-0 bottom-0 left-0 right-0 bg-[#e0f8f8] z-0 ${isChallengeStart && !isChallengeEnd
        ? "rounded-l-full"
        : isChallengeEnd && !isChallengeStart
          ? "rounded-r-full"
          : ""
      }`;

    return (
      <div
        key={`${year}-${month}-${idx}`}
        className="relative h-12 flex justify-center items-center"
      >
        {/* 챌린지 배경 */}
        {isInChallengePeriod && <div className={challengeBgClass} />}

        {isChallengeStart ? (
          // 챌린지 시작일: 아이콘 표시
          <div className="w-10 h-10 rounded-full relative overflow-hidden flex justify-center items-center text-white shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] bg-[#36D2C5]">
            <Target size={20} className="relative z-10 text-white" />
            <span className="absolute bottom-0.5 text-[9px] font-bold z-10">
              {currentDay.date}
            </span>
          </div>
        ) : currentDay.posts && currentDay.posts.length > 0 ? (
          // 피드가 있는 날짜: 피드 이미지 작게 표시 (클릭 가능)
          <button
            onClick={() => onPostClick?.(currentDay.posts![0].id)}
            className="w-10 h-10 rounded-full relative overflow-hidden flex justify-center items-center shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] hover:scale-110 transition-transform"
          >
            <ImageWithFallback
              src={currentDay.posts[0].image}
              alt=""
              className="absolute w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black opacity-30 z-0" />
            <span className="relative z-10 text-white">
              {currentDay.date}
            </span>
          </button>
        ) : (
          // 일반 날짜
          <span className="relative z-10 text-gray-700">
            {currentDay.date}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen w-full max-w-[500px] mx-auto bg-white flex flex-col relative shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]">
      <style>{`
        .swiper-wrapper {
          align-items: flex-start;
        }
        .swiper-slide {
          height: auto !important;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-center shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] relative">
        <button onClick={onBack} className="absolute left-4 xs:left-6 sm:left-8 w-6 h-6">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <div className="flex items-center gap-1">
          <span className="text-[19px] font-semibold text-gray-800">
            캘린더
          </span>
          <ChevronDown size={18} className="text-gray-800" />
        </div>
      </div>

      {/* Swiper 영역 */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          direction={"vertical"}
          slidesPerView={"auto"}
          spaceBetween={40}
          mousewheel={true}
          grabCursor={true}
          className="swiper-container h-full"
        >
          {calendarRange.map(({ year, month }) => {
            const days = generateMonthDays(year, month);

            return (
              <SwiperSlide
                key={`${year}-${month}`}
                className="h-auto"
              >
                <div className="px-4 py-4 bg-white">
                  <div className="text-center text-lg font-bold mb-6">
                    {year}년 {month}월
                  </div>

                  <div className="grid grid-cols-7 text-center mb-2 px-1">
                    {weekDays.map((day, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-400 font-medium"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-4 text-center px-1">
                    {days.map((day, idx) =>
                      renderDay(day, year, month, idx),
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}
