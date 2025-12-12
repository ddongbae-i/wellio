import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { motion } from "motion/react";
import Photo from "../assets/images/my_na.png";
import FamPlus from "../assets/images/icon_my_fam.svg";
import Review from "../assets/images/icon_my_review.svg";
import WhishList from "../assets/images/icon_my_wish.svg";
import My1 from "../assets/images/icon_my_1.svg";
import My2 from "../assets/images/icon_my_2.svg";
import My3 from "../assets/images/icon_my_3.svg";
import Edit from "../assets/images/icon_list_memo.svg";
import MyChevronRight from "../assets/images/icon_my_chevron_right.svg";

interface ProfilePageProps {
  userName: string;
  userAvatar?: string;
  currentPage: string;
  onPageChange: (
    page:
      | "home"
      | "community"
      | "hospital"
      | "profile"
      | "medical-history",
  ) => void;
  onBack: () => void;
  onMyReviewsClick: () => void;
  onFavoriteHospitalsClick: () => void;
  myReviewsCount?: number;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export function ProfilePage({
  userName,
  userAvatar,
  currentPage,
  onPageChange,
  onBack,
  onMyReviewsClick,
  onFavoriteHospitalsClick,
  myReviewsCount = 0,
}: ProfilePageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7]">
      {/* Profile Header */}
      <Header
        title="내 정보"
        showBackButton={true}
        onBack={onBack}
        showSearchButton={true}
        showSettingsButton={true}

      />

      <motion.main
        className="flex-grow bg-[#F7F7F7] pb-[60px]"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* User Info Section */}
        <motion.div className="py-5 px-5 xs:px-6 sm:px-8 relative" variants={itemVariants}>
          {/* 프로필 정보 컨테이너 */}
          <div className="flex items-center">
            {/* 1. 프로필 이미지 영역 (100px로 수정됨) */}
            <div className="relative w-[100px] h-[100px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={
                    Photo
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 수정 버튼 - 기능 없이 장식용 */}
              <div className="absolute bottom-0 right-0 bg-white rounded-full border border-[#d9d9d9] w-[30px] h-[30px] flex items-center justify-center">
                <img src={Edit} alt="편집" className="w-5 h-5" />
              </div>
            </div>

            {/* 2. 텍스트 영역 (디자인 수정됨) */}
            <div className="ml-6 flex flex-col justify-center">
              {/* 이름 + 님 */}
              <h2 className="text-[#202020] flex items-end leading-none mb-2">
                <span className="text-[24px] font-semibold tracking-tight">
                  {userName}
                </span>
                <span className="text-[24px] text-[#777777] font-semibold ml-[2px]">
                  님
                </span>
              </h2>

              {/* 가족관리 링크 (민트색 하트 아이콘) */}
              <button className="group flex items-center text-gray-600">
                <img src={FamPlus} alt="가족관리" className="w-5 h-5 mr-1" />

                <span className="text-[17px] font-medium text-[#555555] mr-1">
                  가족관리
                </span>
                <img src={MyChevronRight} alt="바로가기" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Point Section */}
        <motion.div className="custom-margin bg-white px-5 xs:px-6 sm:px-8 py-[22px] rounded-[12px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] flex items-center justify-between" variants={itemVariants}>
          <span className="text-[#555555] font-medium text-[17px]">
            보유포인트
          </span>
          <div className="flex items-center">
            <span className="text-[17px] font-medium text-[#202020]">
              2,025P
            </span>
            <img src={MyChevronRight} alt="바로가기" className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Activity Buttons */}
        <motion.div className="custom-margin  flex bg-white mx-5 xs:mx-6 sm:mx-8 rounded-[12px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] mt-3 overflow-hidden" variants={itemVariants}>
          <button
            className="flex-1 flex items-center justify-center py-3 text-[#555555] font-medium text-[17px] cursor-pointer"
            onClick={onMyReviewsClick}
          >

            <img src={Review} alt="나의 후기" className="w-5 h-5 mr-[6px]" />
            나의 후기
          </button>
          <span className="text-[#d9d9d9] mx-1 font-medium flex items-center justify-center">
            |
          </span>{" "}
          <button
            className="flex-1 flex items-center justify-center py-3 text-[#555555] font-medium text-[17px] cursor-pointer"
            onClick={onFavoriteHospitalsClick}
          >
            <img src={WhishList} alt="찜한 병원" className="w-5 h-5 mr-[6px]" />
            찜한 병원
          </button>
        </motion.div>

        {/* Features Section */}
        <motion.div className="mt-5 bg-white py-6" variants={itemVariants}>
          <div className="px-5 flex items-center">
            <img src={My1} alt="이런 기능도 있어요" className="w-[30px] h-[30px] mr-2" />
            <h3 className="text-[19px] font-semibold text-[#202020]">
              이런 기능도 있어요
            </h3>
          </div>
          <ul className="mt-5">
            {[
              "원클릭 실손보험 신청",
              "가까운 병원 찾기",
              "건강 뉴스",
            ].map((feature, index) => (
              <li
                key={index}
                className={`px-[30px] py-3 flex items-center justify-between last:border-b-0 ${feature === "가까운 병원 찾기"
                  ? "cursor-pointer hover:bg-gray-50 transition-colors"
                  : ""
                  }`}
                onClick={() => {
                  if (feature === "가까운 병원 찾기") {
                    onPageChange("hospital");
                  }
                }}
              >
                <span className="text-[#555555]">
                  {feature}
                </span>
                <img src={MyChevronRight} alt="바로가기" className="w-5 h-5 text-[#777777]" />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Health Record Section */}
        <motion.div className="mt-3 bg-white py-6" variants={itemVariants}>
          <div className="px-5 flex items-center">
            <img src={My2} alt="건강 내역" className="w-[30px] h-[30px] mr-2" />
            <h3 className="text-[19px] font-semibold text-[#202020]">
              건강 내역
            </h3>
          </div>
          <ul className="mt-5">
            <li
              className="px-[30px] py-3 flex items-center justify-between last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onPageChange("medical-history")}
            >
              <span className="text-[#555555]">진료 내력</span>
              <img src={MyChevronRight} alt="바로가기" className="w-5 h-5" />
            </li>
            <li className="px-[30px] py-3 flex items-center justify-between border-b border-gray-100 last:border-b-0">
              <span className="text-[#555555]">
                건강검진 내역
              </span>
              <img src={MyChevronRight} alt="바로가기" className="w-5 h-5" />
            </li>
          </ul>
        </motion.div>

        {/* Customer Service Section */}
        <motion.div className="mt-3 bg-white pt-6 pb-10" variants={itemVariants}>
          <div className="px-5 flex items-center">
            <img src={My3} alt="고객센터" className="w-[30px] h-[30px] mr-2" />
            <h3 className="text-[19px] font-semibold text-[#202020]">
              고객센터
            </h3>
          </div>
          <ul className="mt-5">
            <li className="px-[30px] py-3 flex items-center justify-between last:border-b-0">
              <span className="text-[#555555]">공지사항</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#777777]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li className="px-[30px] py-3 flex items-center justify-between border-b border-gray-100 last:border-b-0">
              <span className="text-[#555555]">
                고객센터 문의하기
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#777777]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
          </ul>
        </motion.div>
      </motion.main>

      <BottomNav
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}