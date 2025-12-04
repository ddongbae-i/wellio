import WellCoordinator from "../assets/images/icon_main1.svg";
import OneClick from "../assets/images/icon_main2.svg";
import CheckupRecords from "../assets/images/icon_main3.svg";

export function SecondaryMenu() {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4">
      {/* 1. 웰코디 (그라데이션 테두리) */}
      {/* 그라데이션 테두리를 위해 겉에 div를 하나 감쌌습니다. */}
      <div className="w-full aspect-square">
        {/* 그라데이션 보더 (1px) */}
        <div
          className="h-full w-full rounded-[15px] p-[1px]
    bg-[linear-gradient(25deg,rgba(94,250,214,0.37)_23.05%,rgba(124,168,230,0.37)_52.86%,rgba(189,149,245,0.37)_82.28%,rgba(171,44,255,0.37)_98.43%)]"
        >
          <button
            className="group relative w-full h-full flex flex-col items-center justify-center 
                 rounded-[14px] bg-white text-[14px] overflow-hidden transition-colors"
          >
            {/* 그라데이션 오버레이 (배경 느낌) */}
            <div
              className="pointer-events-none absolute inset-0 rounded-[14px]
                   bg-[linear-gradient(25deg,rgba(94,250,214,0.1)_23.05%,rgba(124,168,230,0.1)_52.86%,rgba(189,149,245,0.1)_82.28%,rgba(171,44,255,0.1)_98.43%)]
                   opacity-100 group-hover:opacity-80 transition-opacity duration-200"
            />

            {/* 실제 콘텐츠는 위에 얹기 위해 z-index */}
            <img
              src={WellCoordinator}
              alt="웰코디"
              className="w-[50px] h-[50px] xs:w-[60px] xs:h-[60px]" />
            <span className="relative z-10 mt-2 text-sm font-normal text-[#202020] xs:text-[17px] ">
              웰코디
            </span>
          </button>
        </div>
      </div>
      {/* 2. 진료이력 */}
      <div className="w-full aspect-square">
        <div
          className="h-full w-full rounded-[15px] p-[1px]
    bg-[linear-gradient(25deg,rgba(94,250,214,0.37)_23.05%,rgba(124,168,230,0.37)_52.86%,rgba(189,149,245,0.37)_82.28%,rgba(171,44,255,0.37)_98.43%)]"
        >
          <button
            className="group relative w-full h-full flex flex-col items-center justify-center 
                 rounded-[14px] bg-white text-[14px] overflow-hidden transition-colors"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[14px]
                   bg-[linear-gradient(25deg,rgba(94,250,214,0.1)_23.05%,rgba(124,168,230,0.1)_52.86%,rgba(189,149,245,0.1)_82.28%,rgba(171,44,255,0.1)_98.43%)]
                   opacity-100 group-hover:opacity-80 transition-opacity duration-200"
            />

            <img
              src={OneClick}
              alt="원클릭"
              className="w-[50px] h-[50px] xs:w-[60px] xs:h-[60px]"
            />
            <span className="relative z-10 mt-2 text-sm font-normal text-[#202020] xs:text-[17px]">
              원클릭보험
            </span>
          </button>
        </div>
      </div>
      {/* 3. 건강검진 */}

      <button className="w-full aspect-square flex flex-col items-center justify-center bg-white rounded-[14px] border border-[#d9d9d9] transition-colors">
        {/* TODO: 이 아이콘을 실제 SVG/이미지로 교체하세요 */}
        <img
          src={CheckupRecords}
          alt="건강검진"
          className="w-[50px] h-[50px] xs:w-[60px] xs:h-[60px]"
        />
        <span className="mt-2 text-sm font-normal text-[#202020] xs:text-[17px]">
          건강검진
        </span>
      </button>
    </div>
  );
}