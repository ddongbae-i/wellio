import image_805450b4d414bbaaf2578da077f46c191f207225 from "figma:asset/805450b4d414bbaaf2578da077f46c191f207225.png";
import image_5ba541968b614c80557b21a496869e3d9baa098e from "figma:asset/5ba541968b614c80557b21a496869e3d9baa098e.png";
("use client");

import { useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function PromoBanner() {
  const [banners] = useState([
    {
      id: 1,
      title: "고려은단 헬스케어",
      description: "N포인트로 다양한 할인 혜택을 받아보세요",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&q=80",
      bgColor: "#FFDD80",
    },
    {
      id: 2,
      title: "Doctor's Best, 소화 효소",
      description: "포인트로 다양한 할인 혜택을 받아보세요 ",
      image: image_805450b4d414bbaaf2578da077f46c191f207225,
      bgColor: "#002E60",
      titleColor: "#FBFFD2",
      descColor: "#f0f0f0",
    },
    {
      id: 3,
      title: "오므론 스마트 혈압계",
      description:
        "똑똑한 혈압계로 간편하게 혈압을 기록해 보세요",
      image: image_5ba541968b614c80557b21a496869e3d9baa098e,
      bgColor: "#2b2b2b",
      titleColor: "#BCEEEE",
      descColor: "#f0f0f0",
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const augmentedBanners = [
    banners[banners.length - 1],
    ...banners,
    banners[0],
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const transitionEndTimer = setTimeout(() => {
      if (currentIndex === banners.length) {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }
    }, 500);

    return () => clearTimeout(transitionEndTimer);
  }, [currentIndex, banners.length]);

  const transformStyle = {
    transform: `translateX(-${(currentIndex + 1) * 100}%)`,
  };

  return (
    <div className="relative h-[80px] overflow-hidden rounded-[12px]">
      {/* 배너 슬라이드 */}
      <div
        className={`flex h-full ${
          isTransitioning
            ? "transition-transform duration-500 ease-in-out"
            : "transition-none"
        }`}
        style={transformStyle}
      >
        {augmentedBanners.map((banner, index) => (
          <div
            key={index}
            className="min-w-full h-full relative overflow-hidden"
            style={{ backgroundColor: banner.bgColor }}
          >
            <div className="relative z-10 h-full flex items-center justify-between pl-5 pr-5">
              <div className="flex-1">
                <h3
                  className="mb-1 text-[17px] font-semibold"
                  style={{ color: banner.titleColor }}
                >
                  {banner.title}
                </h3>
                <p
                  className="text-[13px] font-normal"
                  style={{ color: banner.descColor }}
                >
                  {banner.description}
                </p>
              </div>
              <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0 ml-4">
                <ImageWithFallback
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 인디케이터 점 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 hidden">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setCurrentIndex(index);
            }}
            // --- [수정] ---
            // 'index === currentIndex'
            // -> 'index === (currentIndex % banners.length)'
            //
            // (currentIndex가 3이 되어도 3 % 3 = 0 이므로 0번 점이 활성화됨)
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex % banners.length
                ? "bg-white w-6"
                : "bg-white/50 w-1.5"
            }`}
            aria-label={`배너 ${index + 1}로 이동`}
          />
        ))}
      </div>
    </div>
  );
}