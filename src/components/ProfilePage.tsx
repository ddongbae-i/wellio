import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

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
    <div className="flex flex-col min-h-screen">
      {/* Profile Header */}
      <Header
        title="내 정보"
        showBackButton={true}
        onBack={onBack}
        showSearchButton={true}
        showSettingsButton={true}
      />

      {/* 헤더 높이(h-16)만큼 pt-16 추가 */}
      <main className="flex-grow bg-[#F7F7F7] pb-24">
        {/* User Info Section */}
        <div className="py-5 px-5 relative">
          {/* 프로필 정보 컨테이너 */}
          <div className="flex items-center">
            {/* 1. 프로필 이미지 영역 (100px로 수정됨) */}
            <div className="relative w-[100px] h-[100px]">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={
                    userAvatar ||
                    "https://via.placeholder.com/100x100"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* 수정 버튼 - 기능 없이 장식용 */}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-[#d9d9d9] shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-[#555555]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            </div>

            {/* 2. 텍스트 영역 (디자인 수정됨) */}
            <div className="ml-6 flex flex-col justify-center">
              {/* 이름 + 님 */}
              <h2 className="text-[#202020] flex items-end leading-none mb-2">
                <span className="text-[24px] font-semibold tracking-tight">
                  {userName}
                </span>
                <span className="text-[24px] text-[#777777] font-semibold">
                  님
                </span>
              </h2>

              {/* 가족관리 링크 (민트색 하트 아이콘) */}
              <button className="group flex items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-[#2ECACA] mr-1.5"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>

                <span className="text-[17px] font-medium text-[#555555]">
                  가족관리
                </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1 text-[#777777]"
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
              </button>
            </div>
          </div>
        </div>

        {/* Point Section */}
        <div className="bg-white mx-5 p-5 rounded-[12px] shadow-sm flex items-center justify-between">
          <span className="text-[#555555] font-medium text-[17px]">
            보유포인트
          </span>
          <div className="flex items-center">
            <span className="text-[17px] font-medium text-[#202020]">
              2,025P
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
          </div>
        </div>

        {/* Activity Buttons */}
        <div className="flex bg-white mx-5 rounded-lg shadow-sm mt-3 overflow-hidden">
          <button
            className="flex-1 flex items-center justify-center py-3 text-[#555555] font-medium text-[17px]"
            onClick={onMyReviewsClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            나의 후기
          </button>
          <span className="text-[#d9d9d9] mx-1 font-medium flex items-center justify-center">
            |
          </span>{" "}
          <button
            className="flex-1 flex items-center justify-center py-3 text-[#555555] font-medium text-[17px]"
            onClick={onFavoriteHospitalsClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.071c-1.472 1.472-1.472 3.869 0 5.341L10 17.341l6.828-6.929c1.472-1.472 1.472-3.869 0-5.341-1.472-1.472-3.869-1.472-5.341 0L10 6.071l-1.487-1.487c-1.472-1.472-3.869-1.472-5.341 0z"
                clipRule="evenodd"
              />
            </svg>
            찜한 병원
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-5 bg-white py-6">
          <div className="px-5 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1c-.512 0-1.026.061-1.536.177M12 3c1.921-.308 3.568.175 4.093 1.391C16.634 5.762 16 7 16 7H8s-.634-1.238-.157-2.609C8.432 3.175 10.079 2.692 12 3zM12 14v5m-3 0h6m-1-4l.117-.008A2 2 0 0013.997 16H16l1-1h1.5l.5-1.5H21a1 1 0 001-1V9a1 1 0 00-1-1h-.5L20 6.5l-.5-1.5H18a1 1 0 00-1-1H7a1 1 0 00-1 1H5l-.5 1.5L4 8H3a1 1 0 00-1 1v4a1 1 0 001 1h.5l.5 1.5H6l1 1h2a2 2 0 001.883 2L12 19h-1z"
              />
            </svg>
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
                className={`px-[30px] py-3 flex items-center justify-between last:border-b-0 ${
                  feature === "가까운 병원 찾기"
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
            ))}
          </ul>
        </div>

        {/* Health Record Section */}
        <div className="mt-3 bg-white py-6">
          <div className="px-5 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            <h3 className="text-[19px] font-semibold text-[#202020]">
              건강 내역
            </h3>
          </div>
          <ul className="mt-5">
            <li
              className="px-[30px] py-3 flex items-center justify-between last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onPageChange("medical-history")}
            >
              <span className="text-[#555555]">진료 이력</span>
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
                건강검진 내역
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
        </div>

        {/* Customer Service Section */}
        <div className="mt-3 bg-white py-6">
          <div className="px-5 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.128a1 1 0 00-.5 1.21l3.603 6.305a1 1 0 001.21.5l1.128-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
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
        </div>
      </main>

      <BottomNav
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}