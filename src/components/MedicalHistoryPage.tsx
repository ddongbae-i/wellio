// src/components/MedicalHistoryPage.tsx

import {
  Plus,
} from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "motion/react";
import "swiper/css";

import { hospitalMap } from "./hospitalInfo"; // 같은 폴더
import type { PatientId } from "./userProfiles";
import { patientMap } from "./userProfiles";
import ChevronDown from "../assets/images/icon_chevron_down_20.svg";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import Edit from "../assets/images/icon_list_memo.svg";
import { BottomNav } from "./BottomNav";
import type { Page } from "../types/page";

interface MedicalHistoryPageProps {
  onBack: () => void;
  onWriteReview?: (record: MedicalRecord) => void;
  reviewedHospitals?: number[];
  onViewReviews?: () => void;
  records?: MedicalRecord[];
  onUpdateMemo?: (recordId: number, newMemo: string) => void;

}

interface MedicalHistoryPageProps {
  onBack: () => void;
  onWriteReview?: (record: MedicalRecord) => void;
  reviewedHospitals?: number[];
  onViewReviews?: () => void;
  records?: MedicalRecord[];
  onUpdateMemo?: (recordId: number, newMemo: string) => void;

  // 👇 추가
  currentPage?: Page;
  onPageChange?: (page: Page) => void;
}

// 예전/새 구조 둘 다 받을 수 있게 옵션 필드로
interface MedicalRecord {
  id: number;
  code: string;

  // 새 구조
  userId?: PatientId;
  hospitalId?: number;

  // 예전 구조
  patientName?: string;
  patientAvatar?: string;
  hospitalName?: string;

  visitDate: string;
  visitTime: string;
  doctor: string;
  memo: string;
  isMyAppointment?: boolean;
}

interface MedicalVisit {
  id: number;
  type: "hospital" | "pharmacy";
  name: string;
  visitDate: string;
  dayOfWeek: string;
}

// 🔥 진료내역 mock 데이터 (새 구조 예시)
const mockRecords: MedicalRecord[] = [
  {
    id: 1,
    code: "20250808-012345",
    userId: "kim-ds",
    hospitalId: 1,
    visitDate: "2025.08.08(월)",
    visitTime: "14:00",
    doctor: "이준호",
    memo: "아빠 감기몸살로 내원, 3일 뒤 재진",
    isMyAppointment: true,
  },
  {
    id: 2,
    code: "20250805-012345",
    userId: "park-sw",
    hospitalId: 8,
    visitDate: "2025.08.05(화)",
    visitTime: "10:25",
    doctor: "김슬기",
    memo: "엄마 2일마다 물리치료",
    isMyAppointment: true,
  },
  {
    id: 3,
    code: "REC-2024-003",
    userId: "kim-welly",
    hospitalId: 1,
    visitDate: "2024.11.05",
    visitTime: "16:00",
    doctor: "박민준 교수",
    memo: "정기 검진 완료, 특이사항 없음",
    isMyAppointment: false,
  },
];

// 의료내역 mock data
const mockMedicalVisits: MedicalVisit[] = [
  {
    id: 1,
    type: "pharmacy",
    name: "하나약국",
    visitDate: "2025.07.14",
    dayOfWeek: "월",
  },
  {
    id: 2,
    type: "hospital",
    name: "고운피부과",
    visitDate: "2025.07.14",
    dayOfWeek: "월",
  },
  {
    id: 3,
    type: "pharmacy",
    name: "우리들약국",
    visitDate: "2025.07.05",
    dayOfWeek: "월",
  },
  {
    id: 4,
    type: "hospital",
    name: "희망찬정신건강의학과의원",
    visitDate: "2025.07.05",
    dayOfWeek: "토",
  },
  {
    id: 5,
    type: "pharmacy",
    name: "서초드림약국",
    visitDate: "2025.07.05",
    dayOfWeek: "월",
  },

  {
    id: 6,
    type: "hospital",
    name: "오늘도강한내과의원",
    visitDate: "2025.06.27",
    dayOfWeek: "금",
  },

  {
    id: 7,
    type: "hospital",
    name: "희망찬정신건강의학과의원",
    visitDate: "2025.05.31",
    dayOfWeek: "토",
  },
];

// 요일 매핑 함수 (원래 로직 그대로)
const getDayOfWeek = (dateString: string) => {
  if (dateString.includes("08.11")) return "(월)";
  if (dateString.includes("08.05")) return "(화)";
  if (dateString.includes("07.14")) return "(월)";
  if (dateString.includes("06.27")) return "(금)";
  if (dateString.includes("05.31")) return "(토)";
  if (
    dateString.includes("07.05") &&
    mockMedicalVisits.some(
      (v) => v.name.includes("약국") && v.visitDate === dateString,
    )
  )
    return "(월)";
  if (
    dateString.includes("07.05") &&
    mockMedicalVisits.some(
      (v) => v.name.includes("의원") && v.visitDate === dateString,
    )
  )
    return "(토)";
  return "";
};

export function MedicalHistoryPage({
  onBack,
  onWriteReview,
  reviewedHospitals = [],
  onViewReviews,
  records,
  onUpdateMemo,
  currentPage,        // 👈 추가
  onPageChange,       // 👈 추가
}: MedicalHistoryPageProps) {
  const [activeTab, setActiveTab] =
    useState<"treatment" | "medical">("treatment");
  const [selectedFilter, setSelectedFilter] =
    useState<string>("period"); // 기본: 기간검색

  // 🔹 프로필 필터
  const profileFilters: {
    id: string;
    label: string;
    avatar?: string;
    isAddButton?: boolean;
  }[] = [
      ...Object.values(patientMap).map((p) => ({
        id: p.id,
        label: p.name,
        avatar: p.avatar,
      })),
      {
        id: "add-family",
        label: "가족추가",
        isAddButton: true,
      },
    ];

  // 🔹 records가 오든 안 오든 전부 "표준 구조"로 맞춰서 사용
  const allRecords: MedicalRecord[] = (records || mockRecords).map(
    (record) => {
      const r: MedicalRecord = { ...record };

      // 1) userId 없고 patientName 만 있는 옛 데이터라면 → 이름으로 userId 매핑
      if (!r.userId && r.patientName) {
        const matched = Object.values(patientMap).find(
          (p) => p.name === r.patientName,
        );
        if (matched) {
          r.userId = matched.id;
        }
      }

      // 2) hospitalId 없고 hospitalName 만 있는 경우 → 이름으로 hospitalId 매핑
      if (!r.hospitalId && r.hospitalName) {
        const matchedHospital = Object.values(hospitalMap).find(
          (h) => h.name.trim() === r.hospitalName!.trim(),
        );
        if (matchedHospital) {
          r.hospitalId = matchedHospital.id;
        }
      }

      return r;
    },
  );

  // 🔹 필터: userId 기준 (period는 전체)
  const displayRecords =
    selectedFilter === "period"
      ? allRecords
      : allRecords.filter(
        (record) => record.userId === selectedFilter,
      );

  return (
    <div className="relative bg-[#f7f7f7] flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* Sticky Header + Tabs + Filters */}
      <motion.div
        className="sticky top-0 z-30 backdrop-blur-md bg-[#f7f7f7]/70"

        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <header className="px-5 xs:px-6 sm:px-8 py-4 flex items-center justify-center w-full relative bg-transparent min-h-[80px]">
          <button
            onClick={onBack}
            className="absolute left-5 xs:left-6 sm:left-8 w-6 h-6 flex items-center justify-center"
          >
            <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
          </button>
          <span className="text-[19px] font-semibold text-[#1A1A1A]">
            진료내역
          </span>
        </header>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-[#e1e1e1] text-[19px] font-semibold bg-transparent">
            <button
              onClick={() => setActiveTab("treatment")}
              className={`flex-1 py-4 text-center transition-colors ${activeTab === "treatment"
                ? "text-[#135252] border-b-2 border-[#135252] font-semibold"
                : "text-[#aeaeae] font-medium"
                }`}
            >
              진료 내역
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={`flex-1 py-4 text-center transition-colors ${activeTab === "medical"
                ? "text-[#135252] border-b-2 border-[#135252]"
                : "text-[#aeaeae] font-medium"
                }`}
            >
              의료 내역
            </button>
          </div>

          {/* Filter Tags: 기간검색 + 프로필 Swiper */}
          {activeTab === "treatment" && (
            <div className="flex gap-2 filter-wrap pt-5 pb-3 bg-transparent">
              {/* 기간검색 버튼 */}
              <button
                onClick={() => setSelectedFilter("period")}
                className="px-3 py-2 rounded-full whitespace-nowrap text-sm transition-colors border flex items-center gap-1 bg-[#e8e8e8] border-[#e8e8e8] text-[#2b2b2b] flex-shrink-0"
              >
                <span>기간검색</span>
                <img src={ChevronDown} alt="뒤로가기" className="w-5 h-5" />
              </button>

              {/* 프로필 Swiper */}
              <div className="flex-1 overflow-hidden history-filter-swiper">
                <Swiper
                  slidesPerView="auto"
                  spaceBetween={8}
                  className="w-full"
                >
                  {profileFilters.map((filter) => (
                    <SwiperSlide
                      key={filter.id}
                      className="!w-auto history-filter-slide"
                    >
                      <button
                        onClick={() =>
                          !filter.isAddButton && setSelectedFilter(filter.id)
                        }
                        className={`pl-2 pr-3 py-[6px] rounded-full whitespace-nowrap text-sm transition-colors border flex items-center gap-1 ${selectedFilter === filter.id
                          ? "bg-[#E2F7F7] border-[#BCEEEE] text-[#2b2b2b] font-medium "
                          : "border-[#aeaeae] text-[#777] font-normal"
                          }`}
                      >
                        {filter.isAddButton ? (
                          <>
                            <Plus size={16} className="text-[#777]" />
                            <span>{filter.label}</span>
                          </>
                        ) : (
                          <>
                            <ImageWithFallback
                              src={filter.avatar}
                              alt={filter.label}
                              className="w-6 h-6 rounded-full border border-[#f0f0f0]"
                            />
                            <span>{filter.label}</span>
                          </>
                        )}
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          )}
        </div>
      </motion.div>


      {/* Content */}
      <div className="px-5 xs:px-6 sm:px-8 pb-10 bg-[#F7F7F7] flex-1 mt-2">
        {activeTab === "treatment" ? (
          // 🔹 진료내역
          <div className="space-y-3">
            {displayRecords.map((record) => {
              const isMyAppointment =
                record.isMyAppointment !== false;
              const hasReview =
                reviewedHospitals.includes(record.id);

              const patientFromId = record.userId
                ? patientMap[record.userId]
                : undefined;
              const hospitalFromId = record.hospitalId
                ? hospitalMap[record.hospitalId]
                : undefined;

              const displayPatientName =
                patientFromId?.name ??
                record.patientName ??
                "알 수 없는 사용자";
              const displayPatientAvatar =
                patientFromId?.avatar ?? record.patientAvatar;
              const displayHospitalName =
                hospitalFromId?.name ??
                record.hospitalName ??
                "알 수 없는 병원";

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] space-y-3 pt-[22px] px-[20px] pb-[26px]"
                >
                  {/* 1. 진료코드 + 프로필+이름 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[#777777]">
                      {record.code}
                    </span>
                    <div className="flex items-center gap-2">
                      {displayPatientAvatar && (
                        <ImageWithFallback
                          src={displayPatientAvatar}
                          alt={displayPatientName}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="text-sm text-[#2b2b2b]">
                        {displayPatientName}
                      </span>
                    </div>
                  </div>

                  {/* 2. 병원이름 */}
                  <div className="text-[19px] font-semibold text-[#2b2b2b] mb-2">
                    {displayHospitalName}
                  </div>

                  {/* 3. 내원일 */}
                  <div className="flex items-center gap-4 text-[15px] text-[#777777] mb-1">
                    <span>내원일</span>
                    <span className="text-[#555555]">
                      {record.visitDate}
                      {getDayOfWeek(record.visitDate)}{" "}
                      {record.visitTime}
                    </span>
                  </div>

                  {/* 4. 진료의 */}
                  <div className="flex items-center gap-4 text-[15px] text-[#777777] mb-3">
                    <span>진료의</span>
                    <span className="text-[#555555]">
                      {record.doctor}
                    </span>
                  </div>

                  {/* 5. 한줄메모 */}
                  {isMyAppointment && (
                    <div className="bg-[#f7f7f7] rounded-[8px] p-3 text-[15px] text-[#555555] flex items-start gap-1">
                      <img src={Edit} alt="메모" className="w-5 h-5" />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newMemo = e.currentTarget.textContent || "";
                          if (newMemo !== record.memo) {
                            onUpdateMemo?.(record.id, newMemo);
                          }
                        }}
                        className="flex-1 outline-none memo-edit"  // ✅ 여기만 추가
                        data-placeholder="나만의 메모를 추가해보세요" // ✅ placeholder 텍스트
                      >
                        {record.memo}
                      </div>
                    </div>
                  )}

                  {/* 6. 버튼 */}
                  {isMyAppointment && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!hasReview) {
                            onWriteReview?.(record);
                          } else {
                            onViewReviews?.();
                          }
                        }}
                        className={`flex-1 py-3 h-[48px] text-[14px] font-medium border-1 hover:bg-gray-50 transition-colors ${hasReview
                          ? "border-[#e8e8e8] text-[#777777] bg-[#ffffff]"
                          : "border-[#2ECACA] text-[#239C9C] bg-[#ffffff]"
                          }`}
                      >
                        {hasReview ? "작성한 리뷰" : "리뷰쓰기"}
                      </Button>
                      <Button className="flex-1 py-3 h-[48px] text-[14px] font-medium bg-[#36D2C5] text-white rounded-lg hover:bg-[#00C2B3] transition-colors">
                        재접수하기
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          // 🔹 의료내역
          <div className="space-y-3 pt-5">
            {mockMedicalVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-[16px] pt-[22px] px-[20px] pb-[26px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]"
              >
                <div className="text-[19px] font-semibold text-[#2b2b2b] mb-2">
                  {visit.name}
                </div>
                <div className="flex items-center gap-4 text-[15px] text-[#777777]">
                  <span>내원일</span>
                  <span className="ml-2 text-[#555555]">
                    {visit.visitDate}
                    {getDayOfWeek(visit.visitDate)}
                  </span>
                </div>
                {visit.type === "pharmacy" && (
                  <Button
                    variant="outline"
                    className="w-full py-3 h-[48px] text-sm border-1 border-[#e8e8e8] text-[#2b2b2b] bg-white hover:bg-gray-50 transition-colors mt-3"
                  >
                    내가 받은 약 보기
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {currentPage && onPageChange && (
        <BottomNav
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      )}

    </div>

  );

}
