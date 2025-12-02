export function WelcomePage({
  onGuestMode,
  onSignUp,
}: WelcomePageProps) {
  return (
    <div
      className="
        h-dvh         /* 실제 디바이스 높이에 맞게 */
        bg-white
        flex flex-col
        max-w-[500px] mx-auto
        px-4 xs:px-6 sm:px-8
      "
    >
      {/* 타이틀 */}
      <div className="pt-6">
        <h1 className="text-[28px] leading-[1.3] whitespace-pre-line text-[#202020] font-semibold sm:text-3xl">
          {`웰리오와 함께\n우리가족\n건강관리 시작하세요.`}
        </h1>
      </div>

      {/* 이미지 영역 */}
      <div
        className="
          flex-grow
          flex items-center justify-center
          my-6
          min-h-[200px]     /* 너무 작아지지 않게 최소 높이 */
          max-h-[45vh]      /* 디바이스 화면의 45%까지만 사용 */
        "
      >
        <ImageWithFallback
          src={mainImg}
          alt="doctor illustration"
          className="w-full h-full object-contain"
        />
      </div>

      {/* 버튼 그룹 */}
      <div className="pb-8 space-y-3">
        <button
          onClick={onGuestMode}
          className="
            text-[17px] w-full h-[60px]
            rounded-xl bg-[#2ECACA] text-white font-medium
            hover:bg-[#239C9C] transition-colors
          "
        >
          관리자 계정으로 둘러보기
        </button>

        <button
          onClick={onSignUp}
          disabled
          className="
            text-[17px] w-full h-[60px]
            rounded-xl bg-white text-[#777777] border-2 border-[#e8e8e8]
            font-medium disabled:opacity-50 disabled:cursor-not-allowed
            hover:bg-[#f0fffe] transition-colors
          "
        >
          다른 방법으로 시작하기
        </button>
      </div>
    </div>
  );
}
