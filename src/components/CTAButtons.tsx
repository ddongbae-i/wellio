// [수정] Calendar, Pill 아이콘은 더 이상 사용되지 않으므로 import에서 제거
// import { Calendar, Pill } from "lucide-react";

interface CTAButtonsProps {
  onHospitalClick: () => void;
}

export function CTAButtons({
  onHospitalClick,
}: CTAButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {/* Hospital Reception Button */}
      <button
        onClick={onHospitalClick}

        className="border border-[#C9E3FF] bg-[#D7EAFF] text-[#555555] rounded-2xl flex items-center justify-center hover:bg-[#C9E3FF] transition-colors h-15 xs:h-20 font-medium xs:text-[19px] "
      >
        병원 접수하기
      </button>

      {/* Medicine Management Button */}
      <button

        className="border border-[#e8e8e8] bg-[#f0f0f0] text-[#555555] rounded-2xl flex items-center justify-center transition-colors h-15 xs:h-20 font-medium xs:text-[19px]"
      >
        복약관리
      </button>
    </div>
  );
}