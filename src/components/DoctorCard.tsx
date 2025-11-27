import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    // [수정] w-[263px] -> w-full (반응형 대응을 위해 꽉 차게 변경)
    <button className="w-full h-[93px] bg-white rounded-2xl p-5 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all text-left">
      <div className="flex items-center gap-4 overflow-hidden">
        {/* 의사 사진 (원형) */}
        <div className="w-[52px] h-[52px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-50">
          <ImageWithFallback
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* 텍스트 정보 */}
        <div className="flex flex-col justify-center overflow-hidden">
          {/* 1. 전문과목 (위쪽, 회색) */}
          <span className="text-[13px] text-gray-500 leading-tight mb-1 truncate font-medium">
            {doctor.specialty}
          </span>
          {/* 2. 이름 (아래쪽, 굵은 검정) */}
          <span className="text-[16px] font-bold text-gray-900 leading-tight truncate">
            {doctor.name}
          </span>
        </div>
      </div>

      {/* 화살표 아이콘 */}
      <ChevronRight
        size={20}
        className="text-gray-400 flex-shrink-0 ml-2"
      />
    </button>
  );
}