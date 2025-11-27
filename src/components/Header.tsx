import {
  Bell,
  ChevronLeft,
  Search,
  Settings,
} from "lucide-react";

interface HeaderProps {
  // --- 서브 페이지용 props ---
  title?: string; // title이 있으면 서브 페이지 헤더
  showBackButton?: boolean;
  onBack?: () => void;
  showSearchButton?: boolean;
  showSettingsButton?: boolean;
  onNotificationClick?: () => void; // 알림 버튼 클릭 핸들러 추가
}

export function Header({
  title,
  showBackButton = false,
  onBack,
  showSearchButton = false,
  showSettingsButton = false,
  onNotificationClick,
}: HeaderProps) {
  // 👇 브라우저의 뒤로가기 핸들러 (onBack이 없을 때 기본 동작)
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // --- 'title' prop이 있으면 '서브 페이지 헤더' (내 정보) ---
  if (title) {
    return (
      <header className="sticky top-0 left-0 right-0 z-40 px-4 xs:px-6 sm:px-8 py-4 flex w-full items-center justify-center mx-auto h-16 max-w-[500px] bg-[#f7f7f7]/80 backdrop-blur-xs relative">
        {/* 왼쪽: 뒤로가기 */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="absolute left-4 xs:left-6 sm:left-8 p-1 w-6 h-6 flex items-center justify-cente"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
        )}
        {/* 가운데: 타이틀 */}
        <h1 className="text-[19px] font-semibold text-[#202020]">
          {title}
        </h1>
        {/* 오른쪽: 아이콘 */}
        <div className="absolute right-4 xs:right-6 sm:right-8 flex items-center gap-3">
          {showSearchButton && (
            <button className="p-1">
              <Search size={24} className="text-gray-700" />
            </button>
          )}
          {showSettingsButton && (
            <button className="p-1">
              <Settings size={24} className="text-gray-700" />
            </button>
          )}
        </div>
      </header>
    );
  }

  // --- 'title' prop이 없으면 '홈페이지 헤더' ---
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-5 py-4 flex items-center justify-between gap-4 mx-auto h-16 max-w-[500px] bg-[#f7f7f7]/80 backdrop-blur-xs">
      {/* --- 왼쪽: 로고 --- */}
      <div className="flex items-center flex-1 min-w-0">
        {/* 로고 (SVG) */}
        <div className="w-17 h-5 flex-shrink-0 flex items-center justify-center">
          <svg
            width="68"
            height="20"
            viewBox="0 0 68 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.6199 2.22068V12.5252C15.6199 13.54 14.8991 14.4236 13.9613 14.4564C12.9929 14.4892 12.197 13.6467 12.197 12.6045V4.79201C12.1108 3.47078 11.0672 2.4696 9.90399 2.52158C8.8187 2.57082 7.89759 3.52276 7.80019 4.74824V12.4814C7.80019 13.4963 7.07945 14.3798 6.14164 14.4126C5.17323 14.4455 4.37735 13.6029 4.37735 12.5607V2.17691C4.23821 0.869356 3.18074 -0.0771099 2.03979 0.00495398C1.00181 0.0788115 0.119661 0.992452 0 2.17691V12.2297C0 15.7339 2.47391 18.7401 5.70474 18.9453C5.81327 18.9535 5.9218 18.9562 6.03312 18.9562C6.14721 18.9562 6.26131 18.9562 6.3754 18.9508C7.7501 18.8851 8.99402 18.3134 9.97635 17.408C10.9392 18.3161 12.1664 18.9015 13.5272 18.9891C13.6357 18.9973 13.7443 19 13.8556 19C13.9697 19 14.0838 19 14.1979 18.9945C17.4676 18.8413 20 15.8159 20 12.2708V2.22068C19.8887 0.943215 18.8702 -0.0141968 17.7292 0.0323061C16.6467 0.0760735 15.7284 1.0116 15.6254 2.22068H15.6199Z"
              fill="#36D9D9"
            />
            <path
              d="M31.0884 15.239C30.7259 15.392 30.1932 15.5788 29.5285 15.6823C28.8415 15.7903 28.2037 15.8916 27.4942 15.6418C26.6818 15.356 25.7464 14.6022 25.8515 13.9068C25.8829 13.693 26.0082 13.531 26.1156 13.4207H30.4081C30.4081 13.4207 30.4081 13.4252 30.4058 13.4252H32.7736C33.436 13.4252 33.9754 12.8942 33.9955 12.2258C33.9978 12.1471 34 12.0683 34 11.9895C34 8.13021 31.3122 5 28 5C24.6878 5 22 8.12796 22 11.9895C22 15.4776 24.7617 18.691 28 18.9791C30.0589 19.1613 31.677 18.1059 32.3059 17.6424C33.0354 17.145 33.172 16.1752 32.7288 15.6058C32.3819 15.158 31.7038 14.9892 31.0929 15.239H31.0884ZM28.2216 8.389C29.1772 8.389 30.0142 8.96509 30.4953 9.83597C30.605 10.034 30.4618 10.277 30.238 10.277H26.2051C25.9814 10.277 25.8381 10.034 25.9478 9.83597C26.4289 8.96509 27.2682 8.389 28.2216 8.389Z"
              fill="#36D9D9"
            />
            <path
              d="M50 7C51.1046 7 52 6.10457 52 5C52 3.89543 51.1046 3 50 3C48.8954 3 48 3.89543 48 5C48 6.10457 48.8954 7 50 7Z"
              fill="#36D9D9"
            />
            <path
              d="M50.389 8H49.611C48.7213 8 48 8.85949 48 9.91972V17.0803C48 18.1405 48.7213 19 49.611 19H50.389C51.2787 19 52 18.1405 52 17.0803V9.91972C52 8.85949 51.2787 8 50.389 8Z"
              fill="#36D9D9"
            />
            <path
              d="M38.389 2H37.611C36.7213 2 36 2.83718 36 3.86989V17.1301C36 18.1628 36.7213 19 37.611 19H38.389C39.2787 19 40 18.1628 40 17.1301V3.86989C40 2.83718 39.2787 2 38.389 2Z"
              fill="#36D9D9"
            />
            <path
              d="M44.389 2H43.611C42.7213 2 42 2.83718 42 3.86989V17.1301C42 18.1628 42.7213 19 43.611 19H44.389C45.2787 19 46 18.1628 46 17.1301V3.86989C46 2.83718 45.2787 2 44.389 2Z"
              fill="#36D9D9"
            />
            <path
              d="M60.6463 6C56.975 6 54 8.97391 54 12.6438C54 16.3138 56.975 19.2877 60.6463 19.2877C64.3175 19.2877 67.2925 16.3138 67.2925 12.6438C67.2925 8.97391 64.3175 6 60.6463 6ZM60.6463 15.6983C58.9574 15.6983 57.5907 14.3293 57.5907 12.6438C57.5907 10.9584 58.9602 9.5894 60.6463 9.5894C62.3323 9.5894 63.7018 10.9584 63.7018 12.6438C63.7018 14.3293 62.3323 15.6983 60.6463 15.6983Z"
              fill="#36D9D9"
            />
          </svg>
        </div>
      </div>

      {/* --- 오른쪽: 알림 아이콘 --- */}
      <button
        onClick={onNotificationClick}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors flex-shrink-0"
      >
        <Bell size={20} className="text-[#1A1A1A]" />
      </button>
    </header>
  );
}