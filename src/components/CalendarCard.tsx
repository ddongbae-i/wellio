"use client";

import { useState } from "react";
import CalendarDays from "../assets/images/icon_calendar.svg";

type DayKey = "월" | "화" | "수" | "목" | "금" | "토" | "일";

export function CalendarCard() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const currentMonth = selectedDate;
  const selectedDay = selectedDate.getDate();

  // 월~일
  const daysOfWeek: DayKey[] = ["월", "화", "수", "목", "금", "토", "일"];

  // ✅ 요일별 일정 데이터 (샘플)
  const scheduleData: Record<DayKey, { message: string; highlight: string }> = {
    월: { message: "김웰리님", highlight: "오후 9시" },
    화: { message: "김동석님", highlight: "오전 9시 30분" },
    수: { message: "김웰리님", highlight: "오전 9시" },
    목: { message: "박승희님", highlight: "오후 3시" },
    금: { message: "김웰리님", highlight: "오전 11시" },
    토: { message: "김웰리님", highlight: "오전 10시" },
    일: { message: "박승희님", highlight: "오전 13시" },
  };

  // 메시지 접미사 배리에이션
  const messageSuffixes = [
    "에 약 복용 시간입니다",
    "에 건강검진 예약이 있습니다",
    "에 약 복용 시간입니다",
    "에 진료 예약이 있습니다",
    "에 약 복용 시간입니다",
    "에 진료 예약이 있습니다",
    "에 약 복용 시간입니다",
  ];

  // 선택된 날짜가 포함된 주의 날짜들 (월~일)
  const getDaysInSelectedWeek = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const dateObj = new Date(year, month, day);
    let dayOfWeek = dateObj.getDay(); // 0(일) ~ 6(토)

    // 월요일 시작으로 보정
    if (dayOfWeek === 0) dayOfWeek = 6;
    else dayOfWeek -= 1;

    const monday = new Date(year, month, day - dayOfWeek);
    const week: (number | null)[] = [];

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

  // ✅ 선택된 날짜의 요일("월"~"일") 구하기
  const getSelectedDayKey = (date: Date): DayKey => {
    const jsDay = date.getDay(); // 0:일 ~ 6:토
    const index = jsDay === 0 ? 6 : jsDay - 1; // 0:월 ~ 6:일 로 보정
    return daysOfWeek[index];
  };

  return (
    <div className="w-full bg-white overflow-hidden shadow-[0_2px_2.5px_0_#C9D0D833]">
      {/* 1. 달력 헤더 (년/월, 아이콘) */}
      <div className="relative mb-4 px-5 pt-4 flex items-center">
        {/* 가운데 정렬된 텍스트 */}
        <h3 className="absolute left-1/2 -translate-x-1/2 text-[19px] font-semibold text-[#202020]">
          {formatMonth(currentMonth)}
        </h3>

        {/* 오른쪽 정렬 아이콘 */}
        <img
          src={CalendarDays}
          alt="캘린더_일정"
          className="w-[24px] h-[24px] ml-auto"
        />
      </div>

      {/* 3. 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1 text-center px-5">
        {weekDays.map((day, index) => {
          const isSelected = day === selectedDay;
          const dayOfWeekIndex = index; // 0:월, 1:화, ..., 6:일

          // 오늘 날짜 확인
          const today = new Date();
          const isToday =
            day !== null &&
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
                    ${isSelected
                      ? "bg-[#2ECACA]" // 선택된 날짜 배경
                      : "hover:bg-[#f0f0f0]" // 선택 안된 날짜 호버
                    }`}
                >
                  {/* 오늘 날짜 점 표시 */}
                  {isToday && (
                    <div className="absolute top-1 w-1.5 h-1.5 bg-[#2ECACA] rounded-full"></div>
                  )}

                  {isSelected ? (
                    // --- 선택된 날 (요일 + 흰색 박스 숫자) ---
                    <>
                      <span className="text-[17px] font-medium text-white">
                        {daysOfWeek[dayOfWeekIndex]}
                      </span>
                      <div className="mt-1 w-[70%] h-[45%] rounded-[8px] bg-white flex items-center justify-center">
                        {day}
                      </div>
                    </>
                  ) : (
                    // --- 선택되지 않은 날 ---
                    <>
                      <span
                        className={`text-[17px] font-medium ${dayOfWeekIndex === 6
                          ? "text-red-400"
                          : "text-[#2b2b2b]"
                          }`}
                      >
                        {daysOfWeek[dayOfWeekIndex]}
                      </span>
                      <div
                        className={`mt-1 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg text-[17px] md:text-base font-medium ${dayOfWeekIndex === 6
                          ? "text-red-400"
                          : "text-[#2b2b2b]"
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

      {/* 4. 하단 알림 텍스트 (요일 기반) */}
      <div className="mt-3 px-5 pb-5 text-center">
        {(() => {
          const dayKey = getSelectedDayKey(selectedDate); // "월" ~ "일"
          const schedule = scheduleData[dayKey];

          if (schedule) {
            // 요일 기반으로 suffix index도 맞춰줌
            const suffixIndex =
              daysOfWeek.indexOf(dayKey) % messageSuffixes.length;

            return (
              <p className="text-[15px] text-[#202020] xs:text-[17px] ">
                {schedule.message}{" "}
                <span className="text-[#2ECACA] font-normal xs:text-[17px] ">
                  {schedule.highlight}
                </span>
                {messageSuffixes[suffixIndex]}
              </p>
            );
          } else {
            return (
              <p className="text-[15px] text-[#202020] xs:text-[17px] xs:font-medium">
                일정이 없습니다
              </p>
            );
          }
        })()}
      </div>
    </div>
  );
}
