import image_88f427bc51591d8592169cc85c0d7bf56c21995a from "figma:asset/88f427bc51591d8592169cc85c0d7bf56c21995a.png";
import image_4b8856fb1220ee4593967ce52764ef089118466a from "figma:asset/4b8856fb1220ee4593967ce52764ef089118466a.png";
import image_b88f8ac92a33b8d037d59251a778978dc83ac0c0 from "figma:asset/b88f8ac92a33b8d037d59251a778978dc83ac0c0.png";
import image_69a9e50bc25177b16d022c841a02a37e3a74f13a from "figma:asset/69a9e50bc25177b16d022c841a02a37e3a74f13a.png";
import image_37a1656f2c0d46ec52b454dab37e530a8a03a9f4 from "figma:asset/37a1656f2c0d46ec52b454dab37e530a8a03a9f4.png";
import image_836d5a20cf72b3dd8be04e3482da174a43edfd92 from "figma:asset/836d5a20cf72b3dd8be04e3482da174a43edfd92.png";
import image_ba471be49c63bdd07959dbe65d56797ab51ab9a5 from "figma:asset/ba471be49c63bdd07959dbe65d56797ab51ab9a5.png";
import image_b5407d732c19e4bd29e79664b6917fd7f26d6faf from "figma:asset/b5407d732c19e4bd29e79664b6917fd7f26d6faf.png";
import image_079cd83ca9fe115ba1d0bb01d0a8e56210a3f5af from "figma:asset/079cd83ca9fe115ba1d0bb01d0a8e56210a3f5af.png";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// 임시 데이터
const articles = [
  {
    id: 1,
    imageSrc: image_b88f8ac92a33b8d037d59251a778978dc83ac0c0,
    title: "혹시 나도 디스크?",
    description:
      "시도 때도 없이 찌릿거리는 허리,\n혹시 디스크가 아닌지 확인해보세요",
    bgColor: "bg-lime-50",
  },
  {
    id: 2,
    imageSrc: image_4b8856fb1220ee4593967ce52764ef089118466a,
    title: "현대인의 편두통",
    description:
      "지긋지긋한 편두통\n간단한 마사지로 완화해보아요",
    bgColor: "bg-blue-50",
  },
  {
    id: 3,
    imageSrc: image_88f427bc51591d8592169cc85c0d7bf56c21995a,
    title: "환절기 비염",
    description:
      "누적되는 피로감, 만성피로의 원인과\n관리 방법을 알아봅시다!",
    bgColor: "bg-yellow-50",
  },
];

// 개별 아티클 카드
function ArticleCard({
  article,
}: {
  article: (typeof articles)[0];
}) {
  return (
    // [수정] w-[260px] -> w-full (SwiperSlide 너비에 맞춤)
    <div className="w-full">
      <div className="relative w-full h-40 rounded-2xl overflow-hidden">
        <img
          src={article.imageSrc}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="mt-3 ml-[6px]">
        <h4 className="font-semibold text-[#202020]text-lg">
          {article.title}
        </h4>
        <p className="text-sm text-[#2b2b2b] mt-1 font-light leading-[1.3] whitespace-pre-line">
          {article.description}
        </p>
      </div>
    </div>
  );
}

// 건강지식 섹션 메인 컴포넌트
export function HealthKnowledge() {
  return (
    <div className="w-full overflow-hidden pb-10">
      {/* 1. 타이틀 (건강지식 / 전체보기) */}
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 md:px-8">
        <h3 className="text-[21px] font-bold text-[#202020] ml-[6px]">
          건강지식
        </h3>
        <button className="text-sm font-normal text-[#202020] hover:text-[#2b2b2b]">
          전체보기 {">"}
        </button>
      </div>

      {/* 2. Swiper 가로 스크롤 영역 - 항상 표시되도록 수정 */}
      {/* [수정] block md:hidden 클래스 제거 -> 항상 보임 */}
      <div className="pl-4 sm:pl-6 md:pl-8">
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

      {/* [삭제] 3. 그리드 레이아웃 (PC용) - 제거함
          이유: 컨테이너가 500px로 고정되어 있어 그리드가 깨짐
      */}
    </div>
  );
}