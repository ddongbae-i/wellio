import newsCardOne from "../assets/images/news1.png";
import newsCardTwo from "../assets/images/news2.png";
import newsCardThree from "../assets/images/news3.png";
import chevronRightSm from "../assets/images/icon_chevron_right_18.svg";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// 임시 데이터
const articles = [
  {
    id: 1,
    imageSrc: newsCardOne,
    title: "혹시 나도 디스크?",
    description:
      "시도 때도 없이 찌릿거리는 허리,\n혹시 디스크가 아닌지 확인해보세요",
  },
  {
    id: 2,
    imageSrc: newsCardTwo,
    title: "현대인의 편두통",
    description:
      "지긋지긋한 편두통\n간단한 마사지로 완화해보아요",
  },
  {
    id: 3,
    imageSrc: newsCardThree,
    title: "환절기 비염",
    description:
      "누적되는 피로감, 만성피로의 원인과\n관리 방법을 알아봅시다!",
  },
];

// 개별 아티클 카드
function ArticleCard({
  article,
}: {
  article: (typeof articles)[0];
}) {
  return (
    <div className="w-full">
      <div className="relative w-full h-40 rounded-[12px] overflow-hidden">
        <img
          src={article.imageSrc}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="mt-3 ml-[6px]">
        <h4 className="font-semibold text-[#202020] text-[19px] leading-[1.3]">
          {article.title}
        </h4>
        <p className="text-sm text-[#2b2b2b] mt-1 font-light leading-[1.4] whitespace-pre-line">
          {article.description}
        </p>
      </div>
    </div>
  );
}

export function HealthKnowledge() {
  return (
    <div className="w-full overflow-hidden pb-10">
      {/* 1. 타이틀 (건강지식 / 전체보기) */}
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 md:px-8">
        <h3 className="text-[21px] font-bold text-[#202020] ml-[6px]">
          건강지식
        </h3>
        <button className="text-sm font-normal text-[#202020] hover:text-[#2b2b2b] flex items-center">
          전체보기
          <img src={chevronRightSm} alt=">" className="inline-block w-[18px] h-[18px]" />
        </button>
      </div>

      {/* 2. Swiper 가로 스크롤 영역 - 항상 표시되도록 수정 */}
      {/* [수정] block md:hidden 클래스 제거 -> 항상 보임 */}
      <div className="pl-5 sm:pl-6 md:pl-8">
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          grabCursor={true}
          className="!overflow-visible"
          slidesOffsetAfter={32}
        >
          {articles.map((article) => (
            // [중요] SwiperSlide에 고정 너비 지정 (260px)
            <SwiperSlide
              key={article.id}
              style={{ width: "260px" }}
            >
              <ArticleCard article={article} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}