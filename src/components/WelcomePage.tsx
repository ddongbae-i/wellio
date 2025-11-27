import image_ad59ec3fafaba2eab87ac3f4761da31b497da3e7 from "figma:asset/ad59ec3fafaba2eab87ac3f4761da31b497da3e7.png";
import image_b41bc2e4319a3db074275b4da6314c6ddf33f5db from "figma:asset/b41bc2e4319a3db074275b4da6314c6ddf33f5db.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface WelcomePageProps {
  onGuestMode: () => void;
  onSignUp: () => void;
}

export function WelcomePage({
  onGuestMode,
  onSignUp,
}: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10 max-w-[500px] mx-auto px-4 xs:px-6 sm:px-8">
      {/* 타이틀 */}
      <div className="w-full text-left mt-2">
        <h1 className="text-[28px] leading-[1.3] whitespace-pre-line text-[#202020] font-semibold sm:text-3xl xs:pt-[28px]">
          {`웰리오와 함께\n우리가족\n건강관리 시작하세요.`}
        </h1>
      </div>

      {/* 이미지 - 수정된 부분 */}
      <div className="flex-1 flex items-center justify-center md:h-400 my-10 sm:-ml-8 xs:-ml-6 -ml-5">
        <ImageWithFallback
          src={image_ad59ec3fafaba2eab87ac3f4761da31b497da3e7}
          alt="doctor illustration"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* 버튼 그룹 */}
      <div className="w-full space-y-3">
        <button
          onClick={onGuestMode}
          className="text-[17px] w-full h-[60px] rounded-xl bg-[#2ECACA] text-white font-medium hover:bg-[#239C9C] transition-colors flex items-center justify-center"
        >
          관리자 계정으로 둘러보기
        </button>
        <button
          onClick={onSignUp}
          // **비활성화 속성 추가**
          disabled
          className="text-[17px] w-full h-[60px] rounded-xl bg-white text-[#777777] border-2 border-[#e8e8e8] font-medium 
                     // **비활성화 시 스타일 추가 (opacity 낮추고 커서 변경)**
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-[#f0fffe] transition-colors flex items-center justify-center"
        >
          다른 방법으로 시작하기
        </button>
      </div>
    </div>
  );
}