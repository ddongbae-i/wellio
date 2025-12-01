// src/components/communityImages.ts

// 1) 에셋 이미지 전부 import
import img1 from "../assets/images/img1.png";
import img2 from "../assets/images/img2.png";
import img3 from "../assets/images/img3.png";
import img4 from "../assets/images/img4.png";
import img5 from "../assets/images/img5.png";
import img6 from "../assets/images/img6.png";
import img7 from "../assets/images/img7.png";
import img8 from "../assets/images/img8.png";
import img9 from "../assets/images/img9.png";
import img10 from "../assets/images/img10.png";
import img11 from "../assets/images/img11.png";
import img12 from "../assets/images/img12.png";
import img13 from "../assets/images/img13.png";
import img14 from "../assets/images/img14.png";
import img15 from "../assets/images/img15.png";
import img16 from "../assets/images/img16.png";
import img17 from "../assets/images/img17.png";
import img18 from "../assets/images/img18.png";
import img19 from "../assets/images/img19.png";
import img20 from "../assets/images/img20.png";

// 2) 키로 쓰고 싶을 때
export const COMMUNITY_IMAGES = {
  IMG1: img1,
  IMG2: img2,
  IMG3: img3,
  IMG4: img4,
  IMG5: img5,
  IMG6: img6,
  IMG7: img7,
  IMG8: img8,
  IMG9: img9,
  IMG10: img10,
  IMG11: img11,
  IMG12: img12,
  IMG13: img13,
  IMG14: img14,
  IMG15: img15,
  IMG16: img16,
  IMG17: img17,
  IMG18: img18,
  IMG19: img19,
  IMG20: img20,
} as const;

export type CommunityImageKey = keyof typeof COMMUNITY_IMAGES;

// 3) 필요하면 배열로도 제공 (랜덤 뽑기용 등)
export const COMMUNITY_IMAGE_LIST = Object.values(COMMUNITY_IMAGES);
