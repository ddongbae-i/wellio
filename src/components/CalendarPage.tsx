import { ChevronLeft, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

// 💡 Swiper 라이브러리 임포트
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import "swiper/css";

import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CalendarPageProps {
  onBack: () => void;
}

interface DayData {
  date: number;
  image?: string;
  tripStart?: boolean;
  tripEnd?: boolean;
  inTrip?: boolean;
  tripImage?: boolean;
  badge?: boolean;
  avatar?: string;
}

// 특정 년/월의 날짜 배열 생성 (동일)
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

// =========================================================================

export function CalendarPage({ onBack }: CalendarPageProps) {
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
  const swiperRef = useRef<SwiperCore | null>(null); // Swiper 인스턴스 Ref

  // 💡 이벤트 데이터 업데이트 (동일)
  const specialEvents: { [key: string]: Partial<DayData> } = {
    // === 10월 이벤트 ===
    "2025-10-5": { image: "https://i.pravatar.cc/100?img=50" },
    "2025-10-14": { tripStart: true },
    "2025-10-15": { inTrip: true },
    "2025-10-16": { tripEnd: true, inTrip: true },

    // === 11월 이벤트 ===
    "2025-11-1": { image: "https://i.pravatar.cc/100?img=3" },
    "2025-11-2": { image: "https://i.pravatar.cc/100?img=33" },
    "2025-11-3": { image: "https://i.pravatar.cc/100?img=12" },
    "2025-11-4": { image: "https://i.pravatar.cc/100?img=59" },
    "2025-11-7": { image: "https://i.pravatar.cc/100?img=20" },
    "2025-11-10": { image: "https://i.pravatar.cc/100?img=15" },
    "2025-11-13": { image: "https://i.pravatar.cc/100?img=53" },
    "2025-11-16": { tripStart: true },
    "2025-11-17": { inTrip: true },
    "2025-11-18": {
      inTrip: true,
      image: "https://i.pravatar.cc/100?img=18",
    },
    "2025-11-19": { inTrip: true },
    "2025-11-20": { inTrip: true },
    "2025-11-21": { inTrip: true },
    "2025-11-22": { tripEnd: true, inTrip: true },
    "2025-11-23": {
      tripStart: true,
      inTrip: true,
      image: "https://i.pravatar.cc/100?img=23",
    },
    "2025-11-24": { inTrip: true },
    "2025-11-25": { tripEnd: true, inTrip: true },
  };

  // 표시 범위 (동일)
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

  // 💡 초기 진입 시 11월(인덱스 3)로 이동 (동일)
  useEffect(() => {
    if (swiperRef.current) {
      setTimeout(() => {
        swiperRef.current?.slideTo(3, 0);
      }, 100);
    }
  }, []);

  // 달력 일자 렌더링 함수 (수정)
  const renderDay = (
    day: DayData,
    year: number,
    month: number,
    idx: number,
  ) => {
    const dateKey = `${year}-${month}-${day.date}`;
    const eventData = specialEvents[dateKey];
    const currentDay = eventData
      ? { ...day, ...eventData }
      : day;

    // 💡 날짜가 없으면 (빈 칸) null 반환
    if (currentDay.date === 0) {
      return (
        <div
          key={`${year}-${month}-${idx}`}
          className="relative h-12 flex justify-center items-center"
        />
      );
    }

    // 여행 일정이 있는 날짜인지 확인
    const isInTripPeriod =
      currentDay.tripStart ||
      currentDay.tripEnd ||
      currentDay.inTrip;

    // 여행 일정 기간의 배경 클래스
    const tripBgClass = `absolute top-0 bottom-0 left-0 right-0 bg-[#e0f8f8] z-0 ${
      currentDay.tripStart && !currentDay.tripEnd
        ? "rounded-l-full"
        : currentDay.tripEnd && !currentDay.tripStart
          ? "rounded-r-full"
          : ""
    }`;

    return (
      <div
        key={`${year}-${month}-${idx}`}
        className="relative h-12 flex justify-center items-center"
      >
        {/* 💡 여행 일정 배경이 있는 경우 먼저 렌더링 */}
        {isInTripPeriod && <div className={tripBgClass} />}

        {currentDay.image ? (
          // 💡 이미지가 있는 경우 (아이콘 대신 숫자로 통일)
          <div
            className={`w-10 h-10 rounded-full relative overflow-hidden flex justify-center items-center text-white shadow-md ${
              currentDay.tripStart ? "bg-[#2a8f8f]" : "" // 여행 시작일이면 진한 배경
            }`}
          >
            {/* 이미지 배경 */}
            <ImageWithFallback
              src={currentDay.image}
              alt=""
              className="absolute w-full h-full object-cover z-0"
            />
            {/* 이미지 위에 어두운 오버레이 */}
            <div className="absolute inset-0 bg-black opacity-30 z-0" />

            {/* 💡 날짜 숫자를 중앙에 크게 표시 (기존의 일반 포스팅 스타일) */}
            <span className="relative z-10 drop-shadow-md">
              {currentDay.date}
            </span>
          </div>
        ) : (
          // 이미지가 없고 일반 텍스트 날짜만 있는 경우
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
          align-items: flex-start; /* 슬라이드가 상단부터 시작하도록 정렬 */
        }
        .swiper-slide {
            height: auto !important; /* 내용물 크기에 맞게 높이 설정 */
        }
      `}</style>

      {/* Header - 기존과 동일 + Sticky 유지 */}
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

      {/* 💡 Swiper 영역 */}
      <div className="flex-1 overflow-hidden bg-gray-100">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          direction={"vertical"}
          slidesPerView={"auto"} // auto로 설정하여 다음 달이 보이도록 함
          spaceBetween={40} // 월 간의 간격 40px 유지
          mousewheel={true} // 휠 스크롤 지원
          grabCursor={true} // 드래그 시 커서 변경
          className="swiper-container h-full"
        >
          {calendarRange.map(({ year, month }) => {
            const days = generateMonthDays(year, month);

            return (
              // h-auto로 설정하여 내용물 크기에 맞춥니다.
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