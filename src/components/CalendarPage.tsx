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
  posts: Post[]; // 커뮤니티 피드 데이터
}

interface DayData {
  date: number;
  images?: string[]; // 여러 개의 피드 이미지
  challengeStart?: boolean; // 챌린지 시작
  challengeEnd?: boolean; // 챌린지 끝
  inChallenge?: boolean; // 챌린지 기간 중
}

// 특정 년/월의 날짜 배열 생성
const generateMonthDays = (
  year: number,
  month: number,
): DayData[] => {
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

export function CalendarPage({ onBack, posts }: CalendarPageProps) {
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const swiperRef = useRef<SwiperCore | null>(null);

  // 날짜별 피드 이미지 맵핑
  const postsByDate = useMemo(() => {
    const map: { [key: string]: string[] } = {};
    posts.forEach((post) => {
      if (post.createdAt) {
        if (!map[post.createdAt]) {
          map[post.createdAt] = [];
        }
        map[post.createdAt].push(post.image);
      }
    });
    return map;
  }, [posts]);

  // 챌린지 데이터 (가족 간 챌린지)
  const challengeData: { [key: string]: Partial<DayData> } = {
    // 첫 번째 챌린지: 10월 14-16일
    "2025-10-14": { challengeStart: true, inChallenge: true },
    "2025-10-15": { inChallenge: true },
    "2025-10-16": { challengeEnd: true, inChallenge: true },
    
    // 두 번째 챌린지: 11월 16-22일
    "2025-11-16": { challengeStart: true, inChallenge: true },
    "2025-11-17": { inChallenge: true },
    "2025-11-18": { inChallenge: true },
    "2025-11-19": { inChallenge: true },
    "2025-11-20": { inChallenge: true },
    "2025-11-21": { inChallenge: true },
    "2025-11-22": { challengeEnd: true, inChallenge: true },
    
    // 세 번째 챌린지: 11월 23-25일
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

  // 달력 일자 렌더링 함수
  const renderDay = (
    day: DayData,
    year: number,
    month: number,
    idx: number,
  ) => {
    const dateKey = `${year}-${month}-${day.date}`;
    const feedImages = postsByDate[dateKey] || [];
    const challengeInfo = challengeData[dateKey] || {};
    
    const currentDay = {
      ...day,
      images: feedImages,
      ...challengeInfo,
    };

    if (currentDay.date === 0) {
      return (
        <div
          key={`${year}-${month}-${idx}`}
          className="relative h-12 flex justify-center items-center"
        />
      );
    }

    const isInChallengePeriod = currentDay.inChallenge;
    const isChalllengeStart = currentDay.challengeStart;

    // 챌린지 배경 스타일
    const challengeBgClass = `absolute top-0 bottom-0 left-0 right-0 bg-[#e0f8f8] z-0 ${
      currentDay.challengeStart && !currentDay.challengeEnd
        ? "rounded-l-full"
        : currentDay.challengeEnd && !currentDay.challengeStart
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

        {isChalllengeStart ? (
          // 챌린지 시작일: 아이콘 표시
          <div className="w-10 h-10 rounded-full relative overflow-hidden flex justify-center items-center text-white shadow-md bg-[#36D2C5]">
            <Target size={20} className="relative z-10 text-white" />
            <span className="absolute bottom-0.5 text-[9px] font-bold z-10">
              {currentDay.date}
            </span>
          </div>
        ) : currentDay.images && currentDay.images.length > 0 ? (
          // 피드가 있는 날짜: 피드 이미지 작게 표시
          <div className="w-10 h-10 rounded-full relative overflow-hidden flex justify-center items-center shadow-md">
            <ImageWithFallback
              src={currentDay.images[0]}
              alt=""
              className="absolute w-full h-full object-cover z-0"
            />
            {/* 이미지 위에 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black opacity-30 z-0" />
            {/* 날짜 숫자 */}
            <span className="relative z-10 text-white drop-shadow-md">
              {currentDay.date}
            </span>
          </div>
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
    <div className="h-screen w-full max-w-[500px] mx-auto bg-white flex flex-col relative shadow-xl">
      <style>{`
        /* Swiper의 슬라이드가 내용물 크기를 갖도록 조정 */
        .swiper-wrapper {
          align-items: flex-start;
        }
        .swiper-slide {
            height: auto !important;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-center shadow-sm relative">
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
