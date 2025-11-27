import {
  ChevronLeft,
  Calendar,
  ChevronDown,
  Building2,
  Pill,
  Edit,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button"; // Button 컴포넌트를 사용하기 위해 추가
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface MedicalHistoryPageProps {
  onBack: () => void;
  onWriteReview?: (record: MedicalRecord) => void; // 리뷰 작성 페이지로 이동 (병원 정보 전달)
  reviewedHospitals?: number[]; // 리뷰 작성한 병원 ID 목록
  onViewReviews?: () => void; // 나의후기 페이지로 이동
  records?: MedicalRecord[]; // 진료내역 데이터
  onUpdateMemo?: (recordId: number, newMemo: string) => void; // 메모 업데이트 함수
}

interface MedicalRecord {
  id: number;
  code: string;
  patientName: string;
  patientAvatar: string;
  hospitalName: string;
  visitDate: string;
  visitTime: string;
  doctor: string;
  memo: string;
  isMyAppointment?: boolean; // 내 예약인지 여부 (기본값 true)
}

interface MedicalVisit {
  id: number;
  type: "hospital" | "pharmacy";
  name: string;
  visitDate: string;
  dayOfWeek: string;
}

// 진료내역 mock data (이전 수정분과 동일)
const mockRecords: MedicalRecord[] = [
  {
    id: 1,
    code: "20250811-012345",
    patientName: "김동석",
    patientAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    hospitalName: "매일건강의원",
    visitDate: "2025.08.11",
    visitTime: "14:00",
    doctor: "이준호",
    memo: "아빠 감기몸살로 내원, 3일 뒤 재진",
    isMyAppointment: true, // 내 예약, 리뷰 미작성
  },
  {
    id: 2,
    code: "20250805-012345",
    patientName: "박승희",
    patientAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    hospitalName: "바른정형외과의원",
    visitDate: "2025.08.05",
    visitTime: "10:25",
    doctor: "김슬기",
    memo: "엄마 2일마다 물리치료",
    isMyAppointment: true, // 내 예약, 리뷰 작성 완료 (reviewedHospitals에 id: 2 포함 필요)
  },
  {
    id: 3,
    code: "REC-2024-003",
    patientName: "김웰리",
    patientAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    hospitalName: "서울대학교병원",
    visitDate: "2024.11.05",
    visitTime: "16:00",
    doctor: "박민준 교수",
    memo: "정기 검진 완료, 특이사항 없음",
    isMyAppointment: false, // 가족 예약 - 메모/버튼 숨김
  },
];

// 의료내역 mock data (새로운 시안에 맞춰 업데이트)
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
    name: "희망찬정신건강의학과 의원",
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
  // 기존 데이터는 삭제하거나 더 추가할 수 있습니다.
];

// 요일 매핑 함수 (이전 수정분과 동일)
const getDayOfWeek = (dateString: string) => {
  if (dateString.includes("08.11")) return "(월)";
  if (dateString.includes("08.05")) return "(화)";
  // 7월 예시 날짜 추가
  if (dateString.includes("07.14")) return "(월)";
  if (
    dateString.includes("07.05") &&
    mockMedicalVisits.some(
      (v) =>
        v.name.includes("약국") && v.visitDate === dateString,
    )
  )
    return "(월)";
  if (
    dateString.includes("07.05") &&
    mockMedicalVisits.some(
      (v) =>
        v.name.includes("의원") && v.visitDate === dateString,
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
}: MedicalHistoryPageProps) {
  const [activeTab, setActiveTab] = useState<
    "treatment" | "medical"
  >("treatment");
  const [selectedFilter, setSelectedFilter] =
    useState<string>("period");

  const filters = [
    {
      id: "period",
      label: "기간검색",
      isPeriodButton: true,
    },
    {
      id: "kim-welly",
      label: "김웰리",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: "park-sw",
      label: "박승희",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      id: "kim-ds",
      label: "김동석",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: "add-family",
      label: "가족추가",
      isAddButton: true,
    },
  ];

  // 프로필 필터만 별도로 분리 (기간검색 제외)
  const profileFilters = [
    {
      id: "kim-welly",
      label: "김웰리",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    {
      id: "park-sw",
      label: "박승희",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      id: "kim-ds",
      label: "김동석",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: "add-family",
      label: "가족추가",
      isAddButton: true,
    },
  ];

  // records가 전달되지 않으면 mockRecords를 사용
  const allRecords = records || mockRecords;

  // 선택된 필터에 따라 진료내역 필터링
  const displayRecords =
    selectedFilter === "period"
      ? allRecords
      : allRecords.filter((record) => {
          // 필터 ID와 환자 이름 매핑
          const filterNameMap: { [key: string]: string } = {
            "kim-welly": "김웰리",
            "park-sw": "박승희",
            "kim-ds": "김동석",
          };
          return (
            record.patientName === filterNameMap[selectedFilter]
          );
        });

  return (
    <div className="relative bg-[#f7f7f7] flex flex-col max-w-[500px] mx-auto min-h-screen">
      {/* 🌟 수정된 부분: Header와 Tabs/Filters를 감싸는 하나의 Sticky Container */}
      <div className="sticky top-0 z-30 bg-[#f7f7f7]">
        {/* Header (sticky 속성 제거) */}
        <header className="px-4 xs:px-6 sm:px-8 py-4 flex items-center justify-center w-full relative">
          <button
            onClick={onBack}
            className="absolute left-4 xs:left-6 sm:left-8 w-6 h-6 flex items-center justify-center"
          >
            <ChevronLeft
              size={24}
              className="text-[#1A1A1A]"
            />
          </button>
          <span className="text-[19px] font-semibold text-[#1A1A1A]">
            진료내역
          </span>
        </header>

        {/* Tabs & Filters Container (sticky 속성 및 offset 제거) */}
        <div>
          {/* Tabs */}
          <div className="flex border-b border-[#e1e1e1] bg-[#f7f7f7]/80 backdrop-blur-xs text-[19px] font-semibold">
            <button
              onClick={() => setActiveTab("treatment")}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === "treatment"
                  ? "text-[#135252] border-b-2 border-[#135252]"
                  : "text-[#aeaeae]"
              }`}
            >
              진료 내역
            </button>
            <button
              onClick={() => setActiveTab("medical")}
              className={`flex-1 py-4 text-center transition-colors ${
                activeTab === "medical"
                  ? "text-[#135252] border-b-2 border-[#135252]"
                  : "text-[#aeaeae]"
              }`}
            >
              의료 내역
            </button>
          </div>

          {/* Filter Tags: 기간검색(고정) + 프로필 Swiper */}
          {activeTab === "treatment" && (
            <div className="flex gap-2 px-4 xs:px-6 sm:px-8 pt-5 pb-3">
              {/* 기간검색 버튼 (고정) */}
              <button
                onClick={() => setSelectedFilter("period")}
                className="px-3 py-2 rounded-full whitespace-nowrap text-sm transition-colors border flex items-center gap-1 bg-[#e8e8e8] border-[#e8e8e8] text-[#2b2b2b] flex-shrink-0"
              >
                <span>기간검색</span>
                <ChevronDown
                  size={16}
                  className="text-[#555555]"
                />
              </button>

              {/* 프로필 필터 Swiper */}
              <div className="flex-1 overflow-hidden">
                <Swiper
                  slidesPerView="auto"
                  spaceBetween={8}
                  className="w-full"
                >
                  {profileFilters.map((filter) => (
                    <SwiperSlide
                      key={filter.id}
                      className="!w-auto"
                    >
                      <button
                        onClick={() =>
                          setSelectedFilter(filter.id)
                        }
                        className={`px-3 py-2 rounded-full whitespace-nowrap text-sm transition-colors border flex items-center gap-2 ${
                          selectedFilter === filter.id
                            ? "bg-[#BCEEEE] border-[#BCEEEE] text-[#2b2b2b] font-medium"
                            : "border-[#aeaeae] text-[#777] font-normal"
                        }`}
                      >
                        {filter.isAddButton ? (
                          <>
                            <Plus
                              size={16}
                              className="text-[#777]"
                            />
                            <span>{filter.label}</span>
                          </>
                        ) : (
                          <>
                            <ImageWithFallback
                              src={filter.avatar || ""}
                              alt={filter.label}
                              className="w-5 h-5 rounded-full"
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
      </div>
      {/* 🌟 수정된 부분 끝 */}

      {/* Content */}
      <div className="px-4 xs:px-6 sm:px-8 pb-20 bg-[#F7F7F7] flex-1">
        {activeTab === "treatment" ? (
          // 진료내역 (이전 수정 내용 유지)
          <div className="space-y-3">
            {displayRecords.map((record) => {
              const isMyAppointment =
                record.isMyAppointment !== false; // 기본값 true
              const hasReview = reviewedHospitals.includes(
                record.id,
              );

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-sm space-y-3 pt-[22px] px-[20px] pb-[26px]"
                >
                  {/* 1. 진료코드 + 프로필+이름 */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[14px] text-[#777777]">
                      {record.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <ImageWithFallback
                        src={record.patientAvatar}
                        alt={record.patientName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-[#2b2b2b]">
                        {record.patientName}
                      </span>
                    </div>
                  </div>

                  {/* 2. 병원이름 */}
                  <div className="text-[19px] font-semibold text-[#2b2b2b] mb-2">
                    {record.hospitalName}
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

                  {/* 5. 한줄메모 - 내 예약인 경우만 표시 */}
                  {isMyAppointment && (
                    <div className="bg-[#f7f7f7] rounded-[8px] p-3 text-[15px] text-[#555555] flex items-start gap-1">
                      <Edit
                        size={16}
                        className="text-[#777777] mt-0.5 flex-shrink-0"
                      />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newMemo =
                            e.currentTarget.textContent || "";
                          if (newMemo !== record.memo) {
                            onUpdateMemo?.(record.id, newMemo);
                          }
                        }}
                        className="flex-1 outline-none"
                      >
                        {record.memo}
                      </div>
                    </div>
                  )}

                  {/* 6. 버튼 - 내 예약인 경우만 표시 */}
                  {isMyAppointment && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!hasReview) {
                            // 리뷰 작성하지 않은 병원만 리뷰 작성 페이지로 이동
                            onWriteReview?.(record);
                          } else {
                            // 리뷰 작성한 병원은 나의후기 페이지로 이동
                            onViewReviews?.();
                          }
                        }}
                        className={`flex-1 py-3 h-[48px] text-[14px] font-medium border-1 hover:bg-gray-50 transition-colors ${
                          hasReview
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
          // 의료내역 - 새로운 시안 디자인 적용
          <div className="space-y-3 pt-5">
            {mockMedicalVisits.map((visit) => (
              <div
                key={visit.id}
                // 카드 스타일: 시안과 같이 배경 흰색, 둥근 모서리, 그림자/테두리 없음
                className="bg-white rounded-xl pt-[22px] px-[20px] pb-[26px] shadow-none space-y-2.5"
              >
                {/* 1. 병원/약국 이름 */}
                <div className="text-[19px] font-semibold text-[#2b2b2b] mt-2">
                  {visit.name}
                </div>

                {/* 2. 내원일 (아이콘 제거, 텍스트 스타일 변경) */}
                <div className="flex items-center gap-4 text-[15px] text-[#777777]">
                  <span>내원일</span>
                  {/* 시안 형식: 2025.07.14(월) */}
                  <span className="ml-2 text-[#555555]">
                    {visit.visitDate}
                    {getDayOfWeek(visit.visitDate)}
                  </span>
                </div>

                {/* 3. 약국인 경우에만 버튼 표시 */}
                {visit.type === "pharmacy" && (
                  <Button
                    variant="outline"
                    // 버튼 스타일: 시안과 같이 흰 배경, 민트색 테두리, 민트색 텍스트
                    className="w-full py-3 h-[48px] text-sm font-semibold border-1 border-[#e8e8e8] text-[#2b2b2b] bg-white hover:bg-gray-50 transition-colors mt-3"
                  >
                    내가 받은 약 보기
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}