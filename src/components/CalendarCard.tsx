"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

export function CalendarCard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = selectedDate;
  const selectedDay = selectedDate.getDate();

  const daysOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

  // 날짜별 일정 데이터
  const scheduleData: {
    [key: string]: { message: string; highlight: string };
  } = {
    "25": { message: "김웰리님 오늘", highlight: "오후 9시" },
    "26": {
      message: "김웰리님 내일",
      highlight: "오전 8시 30분",
    },
    "27": { message: "김웰리님", highlight: "오후 2시" },
    "28": { message: "김웰리님", highlight: "오후 7시 30분" },
    "29": { message: "김웰리님", highlight: "오전 11시" },
    "30": {
      message: "김웰리님 이번 주말",
      highlight: "오후 4시",
    },
    "1": { message: "김웰리님 다음 달", highlight: "오전 9시" },
  };

  // 메시지 접미사 배리에이션
  const messageSuffixes = [
    "에 투여가 예정되어있습니다",
    "에 병원 예약이 있습니다",
    "에 복약 알림이 있습니다",
    "에 건강검진 예약이 있습니다",
    "에 약 복용 시간입니다",
    "에 진료 예약이 있습니다",
    "에 건강 상담 예약이 있습니다",
  ];

  const getDaysInSelectedWeek = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateObj = new Date(year, month, day);
    let dayOfWeek = dateObj.getDay();

    if (dayOfWeek === 0) dayOfWeek = 6;
    else dayOfWeek -= 1;

    const monday = new Date(year, month, day - dayOfWeek);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const dayInWeek = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + i,
      );

      if (dayInWeek.getMonth() === month) {
        week.push(dayInWeek.getDate());
      } else {
        week.push(null);
      }
    }
    return week;
  };

  const formatMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const newSelectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    setSelectedDate(newSelectedDate);
  };

  const weekDays = getDaysInSelectedWeek(selectedDate);

  return (
    // [수정] rounded-t-2xl, overflow-hidden, shadow-md 추가
    // 반응형 패딩 추가
    <div className="w-full bg-white rounded-t-2xl overflow-hidden shadow-[0_2px_2.5px_0_#C9D0D833]">
      {/* 1. 달력 헤더 (년/월, 아이콘) */}
      <div className="relative mb-4 px-5 pt-3">
        {/* 가운데 정렬된 텍스트 */}
        <h3 className="text-[19px] font-semibold text-[#202020] text-center">
          {formatMonth(currentMonth)}
        </h3>

        {/* 오른쪽 정렬 아이콘 */}
        <CalendarDays
          size={20}
          className="text-gray-500 absolute right-5 top-4"
        />
      </div>
      {/* 2. 요일 헤더 삭제됨 */}

      {/* 3. 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1 text-center px-5">
        {weekDays.map((day, index) => {
          const isSelected = day === selectedDay;
          const dayOfWeekIndex = index; // 0:월, 1:화, ..., 6:일
          
          // 오늘 날짜 확인
          const today = new Date();
          const isToday = day !== null && 
                          day === today.getDate() && 
                          currentMonth.getMonth() === today.getMonth() && 
                          currentMonth.getFullYear() === today.getFullYear();

          return (
            <div
              key={index}
              className="p-1 flex justify-center items-center h-21 xs:h-25"
            >
              {day !== null && (
                <button
                  onClick={() => handleDayClick(day)}
                  className={`w-full h-full rounded-[12px] flex flex-col justify-center items-center transition-all relative
                    ${
                      isSelected
                        ? "bg-[#2ECACA]" // 선택된 날짜 배경
                        : "hover:bg-[#f0f0f0]" // 선택 안된 날짜 호버
                    }`}
                >
                  {/* 오늘 날짜 빨간 점 */}
                  {isToday && (
                    <div className="absolute top-1 w-1.5 h-1.5 bg-[#2ECACA] rounded-full"></div>
                  )}
                  
                  {isSelected ? (
                    // --- 1. 선택된 날 (요일 + 흰색 원형 숫자) ---
                    <>
                      <span className="text-[17px] font-medium text-white">
                        {daysOfWeek[dayOfWeekIndex]}
                      </span>
                      <div className="mt-1 w-[70%] h-[45%] rounded-[8px] bg-white flex items-center justify-center">
                        {day}
                      </div>
                    </>
                  ) : (
                    // --- 2. 선택되지 않은 날 (요일 + 숫자) ---
                    <>
                      <span
                        className={`text-[17px] font-medium ${
                          dayOfWeekIndex === 6
                            ? "text-red-400"
                            : "text-gray-500"
                        }`}
                      >
                        {daysOfWeek[dayOfWeekIndex]}
                      </span>
                      <div
                        className={`mt-1 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-sm md:text-base font-medium ${
                          dayOfWeekIndex === 6
                            ? "text-red-400"
                            : "text-gray-700"
                        }`}
                      >
                        {day}
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. 하단 알림 텍스트 */}
      <div className="mt-4 pt-4 border-t border-gray-100 px-5 pb-4 text-center">
        {(() => {
          const schedule = scheduleData[selectedDay.toString()];
          if (schedule) {
            // 날짜를 기반으로 접미사 선택 (일관성 있게)
            const suffixIndex =
              selectedDay % messageSuffixes.length;
            return (
              <p className="text-[15px] text-[#202020]">
                {schedule.message}{" "}
                <span className="text-[#2ECACA] font-normal">
                  {schedule.highlight}
                </span>
                {messageSuffixes[suffixIndex]}
              </p>
            );
          } else {
            return (
              <p className="text-[15px] text-[#202020]">
                일정이 없습니다
              </p>
            );
          }
        })()}
      </div>
    </div>
  );
}