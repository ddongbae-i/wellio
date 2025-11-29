import ChevronRight from "../assets/images/icon_chevron_right.svg";
import Doctor1 from "../assets/images/doctor1.png";
import Doctor2 from "../assets/images/doctor2.png";

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
    <button className="w-full h-[93px] bg-white rounded-2xl px-5 pt-[22px] pb-[26px] flex items-center justify-between shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] transition-all text-left">
      <div className="flex items-center gap-4 overflow-hidden">

        {/* 의사 사진 (원형) */}
        <div className="w-[45px] h-[45px] rounded-full overflow-hidden flex-shrink-0 border border-[#f0f0f0]">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 텍스트 정보 */}
        <div className="flex flex-col justify-center overflow-hidden">
          <span className="text-[15px] text-[#555555] leading-[1.3] mb-1 truncate">
            {doctor.specialty}
          </span>
          <span className="text-[17px] font-medium text-[#2b2b2b] leading-[1.3] truncate">
            {doctor.name}
          </span>
        </div>
      </div>

      {/* 화살표 아이콘 */}
      <img src={ChevronRight} alt="바로가기" className="w-6 h-6" />
    </button>
  );
}
