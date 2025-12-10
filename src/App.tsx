import { useState, useEffect } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SocialLoginPage } from "./components/SocialLoginPage";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { HospitalSearchPage } from "./components/HospitalSearchPage";
import { CommunityPage } from "./components/CommunityPage";
import { ProfilePage } from "./components/ProfilePage";
import { HospitalDetailPage } from "./components/HospitalDetailPage";
import { UploadPage } from "./components/UploadPage";
import { MedicalHistoryPage } from "./components/MedicalHistoryPage";
import { MyReviewsPage } from "./components/MyReviewsPage";
import { FavoriteHospitalsPage } from "./components/FavoriteHospitalsPage";
import { NotificationPage } from "./components/NotificationPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { ReviewWritePage } from "./components/ReviewWritePage";
import { HospitalReviewsPage } from "./components/HospitalReviewsPage";
import { CalendarPage } from "./components/CalendarPage";
import { Toaster } from "sonner";
import { hospitalMap } from "./components/hospitalInfo";
import { COMMUNITY_IMAGES } from "./components/communityImages";
import TogetherIcon from "./assets/images/TogetherIcon.svg"
import MapPin from "./assets/images/icon_com_map.svg"
import WalkIcon from "./assets/images/WalkIcon.svg"

type Page =
  | "home"
  | "community"
  | "hospital"
  | "profile"
  | "hospital-detail"
  | "upload"
  | "medical-history"
  | "my-reviews"
  | "favorite-hospitals"
  | "notifications"
  | "write-review"
  | "hospital-reviews"
  | "calendar";

// 병원 타입 정의
interface Hospital {
  id: number;
  name: string;
  department: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  distance?: string;
  isAvailableNow?: boolean;
  specialtyText?: string;
  rating?: number;
  reviews?: number;
}

// 포스트 타입 정의
interface Post {
  id: number;
  image: string;
  badge?: {
    text: string;
    icon?: string;
  };
  userAvatar: string;
  caption: string;
  userName: string;
  textOverlay?: string;
  location?: string;
  weather?: string;
  time?: string;
  health?: string;
  createdAt?: string; // 작성 날짜 (YYYY-MM-DD 형식)
  comments?: Array<{
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: Array<{
      userName: string;
      userAvatar: string;
    }>;
  }>;
}

// 리뷰 타입 정의
interface Review {
  id: number;
  hospitalId: number;
  hospitalName: string;
  hospitalImage: string;
  visitDate: string;
  rating: number;
  keywords: string[];
  reviewText: string;
  userName: string;
  userAvatar: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  visitType?: "첫방문" | "재방문";
}

interface Notification {
  id: number;
  type: "hospital" | "family" | "medicine" | "challenge" | "community";
  category: string;
  message: string;
  time: string;
  isRead: boolean;
}

// 👥 앱을 함께 사용하는 가족 구성원
const USERS = {
  wellie: {
    name: "김웰리",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  dongseok: {
    name: "김동석",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
  seunghee: {
    name: "박승희",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
  },
} as const;

// 🌐 리뷰 작성자 (일반 유저들 - 가족이 아닌 다른 사람들)
const REVIEW_AUTHORS = [
  {
    name: "이서연",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    name: "박지훈",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    name: "최민지",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    name: "강태욱",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
  {
    name: "정하은",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
  },
  {
    name: "윤서준",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
  },
  {
    name: "임지원",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
  },
  {
    name: "홍준영",
    avatar:
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&q=80",
  },
  {
    name: "김나연",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80",
  },
  {
    name: "오현수",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80",
  },
  {
    name: "송유진",
    avatar:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&q=80",
  },
  {
    name: "배준호",
    avatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&q=80",
  },
  {
    name: "서민수",
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&q=80",
  },
  {
    name: "한지민",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
  },
  {
    name: "조성훈",
    avatar:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&q=80",
  },
];

// 🔹 날짜 유틸: YYYY-MM-DD 형식으로 통일
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateNDaysAgo = (daysAgo: number): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() - daysAgo);
  return formatDateKey(today);
};

// 🔹 오늘 기준으로 초기 커뮤니티 포스트 생성
const createInitialPosts = (): Post[] => {
  return [
    {
      id: 1,
      image: COMMUNITY_IMAGES.IMG1,
      badge: {
        text: "주 1회 함께 걷기",
        icon: TogetherIcon
      },
      userAvatar: USERS.wellie.avatar,
      caption: "챌린지 시작!",
      userName: USERS.wellie.name,
      textOverlay: "챌린지 첫 시작!",
      createdAt: getDateNDaysAgo(1), // 오늘
      comments: [
        {
          userName: USERS.dongseok.name,
          userAvatar: USERS.dongseok.avatar,
          text: "우리가족 1등 가보자!",
          timestamp: "5분 전",
        },
        {
          userName: USERS.seunghee.name,
          userAvatar: USERS.seunghee.avatar,
          text: "워치까지 맞췄으니 꼭 끝까지 ~^^",
          timestamp: "1분 전",
        },
      ],
      reactions: [
        {
          emoji: "🎉",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
            {
              userName: USERS.dongseok.name,
              userAvatar: USERS.dongseok.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      image: COMMUNITY_IMAGES.IMG2,
      userAvatar: USERS.dongseok.avatar,
      caption: "혈압관리를 응원",
      userName: USERS.dongseok.name,
      textOverlay: "님의 혈압관리를 응원해 주세요!",
      createdAt: getDateNDaysAgo(2), // 1일 전
      comments: [],
      reactions: [
        {
          emoji: "🔥",
          users: [
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      image: COMMUNITY_IMAGES.IMG3,
      userAvatar: USERS.wellie.avatar,
      caption: "오늘도 혈당방어 성공!",
      userName: USERS.wellie.name,
      textOverlay: "오늘도 혈당방어 성공!",
      createdAt: getDateNDaysAgo(3),
      comments: [],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 4,
      image: COMMUNITY_IMAGES.IMG4,
      userAvatar: USERS.dongseok.avatar,
      caption: "오늘도 친구놈 버리고 오운완!",
      userName: USERS.dongseok.name,
      textOverlay: "오늘도 친구놈 버리고 오운완!",
      createdAt: getDateNDaysAgo(5),
      comments: [],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 5,
      image: COMMUNITY_IMAGES.IMG5,
      userAvatar: USERS.seunghee.avatar,
      caption: "우리 가족 깍두기 준비 완료",
      userName: USERS.seunghee.name,
      textOverlay: "우리 가족 깍두기 준비 완료^^",
      createdAt: getDateNDaysAgo(6),
      comments: [
        {
          userName: USERS.wellie.name,
          userAvatar: USERS.wellie.avatar,
          text: "참석 희망합니다 🖐️",
          timestamp: "5분 전",
        },
      ],
      reactions: [
        {
          emoji: "❤️",
          users: [
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 6,
      image: COMMUNITY_IMAGES.IMG6,
      userAvatar: USERS.wellie.avatar,
      caption: "딸은 출석 완료입니다",
      userName: USERS.wellie.name,
      textOverlay: "딸은 출석 완료입니다",
      createdAt: getDateNDaysAgo(15),
      comments: [],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: USERS.dongseok.name,
              userAvatar: USERS.dongseok.avatar,
            },
          ],
        },
        {
          emoji: "🔥",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 7,
      image: COMMUNITY_IMAGES.IMG7,
      badge: {
        text: "올림픽공원",
        icon: MapPin
      },
      userAvatar: USERS.seunghee.avatar,
      caption: "가을이 오나보다",
      userName: USERS.seunghee.name,
      textOverlay: "가을이 오나보다 🍂",
      createdAt: getDateNDaysAgo(17),
      comments: [
        {
          userName: USERS.wellie.name,
          userAvatar: USERS.wellie.avatar,
          text: "아빠 배아프겠는데 ㅎㅎ",
          timestamp: "25.10.05",
        },
        {
          userName: USERS.dongseok.name,
          userAvatar: USERS.dongseok.avatar,
          text: "혼자가니까 좋나!!",
          timestamp: "25.10.05",
        },
      ],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 8,
      image: COMMUNITY_IMAGES.IMG8,
      badge: {
        text: "타이베이시",
        icon: MapPin
      },
      userAvatar: USERS.wellie.avatar,
      caption: "대만에서도 관리중",
      userName: USERS.wellie.name,
      textOverlay: "대만에서도 관리중",
      createdAt: getDateNDaysAgo(20),
      comments: [
        {
          userName: USERS.seunghee.name,
          userAvatar: USERS.seunghee.avatar,
          text: "올때 누가크래커 ^^",
          timestamp: "2025-09-30",
        },
      ],
      reactions: [
        {
          emoji: "❤️",
          users: [
            {
              userName: USERS.dongseok.name,
              userAvatar: USERS.dongseok.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 9,
      image: COMMUNITY_IMAGES.IMG9,
      userAvatar: USERS.dongseok.avatar,
      caption: "당신 닮은 꽃 사간다",
      userName: USERS.dongseok.name,
      textOverlay: "당신 닮은 꽃 사간다",
      createdAt: getDateNDaysAgo(25),
      comments: [
        {
          userName: USERS.wellie.name,
          userAvatar: USERS.wellie.avatar,
          text: "크 로맨티스트 멋져멋져",
          timestamp: "25.09.22.",
        },
      ],
      reactions: [
        {
          emoji: "❤️",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 10,
      image: COMMUNITY_IMAGES.IMG10,
      userAvatar: USERS.wellie.avatar,
      caption: "열심히 합시다",
      userName: USERS.wellie.name,
      textOverlay: "열심히 합시다",
      createdAt: getDateNDaysAgo(27),
      comments: [],
      reactions: [
        {
          emoji: "🔥",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
            {
              userName: USERS.dongseok.name,
              userAvatar: USERS.dongseok.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 11,
      image: COMMUNITY_IMAGES.IMG11,
      badge: {
        text: "9월 누적 15만보 걷기",
        icon: WalkIcon
      },
      userAvatar: USERS.wellie.avatar,
      caption: "챌린지 완료",
      userName: USERS.wellie.name,
      textOverlay: "15만보 걷기 끝이 보인다",
      createdAt: getDateNDaysAgo(30),
      comments: [
        {
          userName: USERS.seunghee.name,
          userAvatar: USERS.seunghee.avatar,
          text: "엄마는 아직 멀었어 ㅠㅠ",
          timestamp: "25.09.16.",
        },
        {
          userName: USERS.dongseok.name,
          userAvatar: USERS.dongseok.avatar,
          text: "딸램 장하다",
          timestamp: "25.09.16.",
        },
      ],
      reactions: [
        {
          emoji: "🎉",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
            {
              userName: USERS.dongseok.name,
              userAvatar: USERS.dongseok.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 12,
      image: COMMUNITY_IMAGES.IMG12,
      badge: {
        text: "9월 누적 15만보 걷기",
        icon: WalkIcon
      },
      userAvatar: USERS.wellie.avatar,
      caption: "오챌완💪",
      userName: USERS.wellie.name,
      textOverlay: "오챌완💪",
      createdAt: getDateNDaysAgo(31),
      comments: [],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
          ],
        },
        {
          emoji: "🎉",
          users: [
            {
              userName: USERS.dongseok.name,
              userAvatar: USERS.dongseok.avatar,
            },
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 13,
      image: COMMUNITY_IMAGES.IMG13,
      userAvatar: USERS.wellie.avatar,
      caption: "자주 삐뚤어지기",
      userName: USERS.wellie.name,
      textOverlay: "자주 삐뚤어지기",
      createdAt: getDateNDaysAgo(32),
      comments: [
        {
          userName: USERS.seunghee.name,
          userAvatar: USERS.seunghee.avatar,
          text: "반달이만 보이는데!?^^",
          timestamp: "25.09.14",
        },
      ],
      reactions: [],
    },
    {
      id: 14,
      image: COMMUNITY_IMAGES.IMG14,
      userAvatar: USERS.wellie.avatar,
      caption: "가끔은 삐뚤어지기",
      userName: USERS.wellie.name,
      textOverlay: "가끔은 삐뚤어지기",
      createdAt: getDateNDaysAgo(33),
      comments: [
        {
          userName: USERS.seunghee.name,
          userAvatar: USERS.seunghee.avatar,
          text: "이번주 혈당 낮았으니까 봐준다",
          timestamp: "25.09.14",
        },
        {
          userName: USERS.dongseok.name,
          userAvatar: USERS.dongseok.avatar,
          text: "아빠는!!",
          timestamp: "25.09.14",
        },
      ],
      reactions: [
        {
          emoji: "🔥",
          users: [
            {
              userName: USERS.seunghee.name,
              userAvatar: USERS.seunghee.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 15,
      image: COMMUNITY_IMAGES.IMG15,
      badge: {
        text: "9월 누적 15만보 걷기",
        icon: WalkIcon
      },
      userAvatar: USERS.wellie.avatar,
      caption: "오챌완💪",
      userName: USERS.wellie.name,
      textOverlay: "오챌완💪",
      createdAt: getDateNDaysAgo(34),
      comments: [],
      reactions: [],
    },
    {
      id: 16,
      image: COMMUNITY_IMAGES.IMG16,
      badge: {
        text: "9월 누적 15만보 걷기",
        icon: WalkIcon
      },
      userAvatar: USERS.seunghee.avatar,
      caption: "오챌완💪 이렇게 하면 되나",
      userName: USERS.seunghee.name,
      textOverlay: "오챌완💪 이렇게 하면 되나",
      createdAt: getDateNDaysAgo(34),
      comments: [
        {
          userName: USERS.wellie.name,
          userAvatar: USERS.wellie.avatar,
          text: "짜란다 짜란다 짜란다👏👏",
          timestamp: "25.09.14",
        },
      ],
      reactions: [
        {
          emoji: "🔥",
          users: [
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
          ],
        },
      ],
    },
    {
      id: 17,
      image: COMMUNITY_IMAGES.IMG17,
      userAvatar: USERS.seunghee.avatar,
      caption: "예쁘니들 수확 완료",
      userName: USERS.seunghee.name,
      textOverlay: "예쁘니들 수확 완료^^",
      createdAt: getDateNDaysAgo(35),
      comments: [
        {
          userName: USERS.wellie.name,
          userAvatar: USERS.wellie.avatar,
          text: "드라이토마토 신청합니다",
          timestamp: "25.09.14",
        },
      ],
      reactions: [
        {
          emoji: "❤️",
          users: [
            {
              userName: USERS.wellie.name,
              userAvatar: USERS.wellie.avatar,
            },
          ],
        },
      ],
    },
  ];
};

export default function App() {
  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginStep, setLoginStep] =
    useState<"welcome" | "social" | "email">("welcome");
  const [userName, setUserName] = useState(USERS.wellie.name);
  const [userAvatar, setUserAvatar] = useState(USERS.wellie.avatar);
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedHospital, setSelectedHospital] =
    useState<Hospital | null>(null);
  const [selectedPostId, setSelectedPostId] =
    useState<number | null>(null);

  // 1) Chatbase 스크립트 로드
  useEffect(() => {
    if (!isLoggedIn || showOnboarding) return;

    // 이미 스크립트가 있으면 재로딩 X
    if (document.getElementById("chatbase-widget")) return;

    const script = document.createElement("script");
    script.id = "chatbase-widget";
    script.src = "https://www.chatbase.co/embed.min.js";
    script.defer = true;
    script.setAttribute("chatbotId", "irCuwpc7c06Qva9cN3Qz6");
    script.setAttribute("domain", "www.chatbase.co");
    document.body.appendChild(script);

    return () => {
      script.remove();
      document.querySelector("#chatbase-bubble-button")?.remove();
      document.querySelector("#chatbase-bubble-window")?.remove();
      document.querySelector("#chatbase-message-bubbles")?.remove();
    };
  }, [isLoggedIn, showOnboarding]);

  // 2) 최초 진입 시에는 채팅창(창만) 무조건 닫아두기
  useEffect(() => {
    if (!isLoggedIn || showOnboarding) return;

    const forceCloseAtStart = () => {
      const windowEl = document.querySelector(
        "#chatbase-bubble-window"
      ) as HTMLElement | null;

      if (windowEl) {
        windowEl.style.display = "none";
        clearInterval(intervalId);
      }
    };

    const intervalId = window.setInterval(forceCloseAtStart, 200);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, showOnboarding]);

  // 3) 홈 / 병원에서만 아이콘 & 말풍선 보여주고, 위치 맞추기
  useEffect(() => {
    const showOnPages: Page[] = ["home", "hospital"];
    const shouldShow =
      isLoggedIn &&
      !showOnboarding &&
      showOnPages.includes(currentPage);

    const getElements = () => {
      const bubble = document.querySelector(
        "#chatbase-bubble-button"
      ) as HTMLElement | null;
      const windowEl = document.querySelector(
        "#chatbase-bubble-window"
      ) as HTMLElement | null;
      const messageBubbles = document.querySelector(
        "#chatbase-message-bubbles"
      ) as HTMLElement | null;

      return { bubble, windowEl, messageBubbles };
    };

    const hideAll = () => {
      const { bubble, windowEl, messageBubbles } = getElements();
      if (bubble) bubble.style.display = "none";
      if (windowEl) windowEl.style.display = "none";
      if (messageBubbles) messageBubbles.style.display = "none";
    };

    if (!shouldShow) {
      hideAll();
      return;
    }

    const updatePosition = () => {
      const { bubble, windowEl, messageBubbles } = getElements();
      if (!bubble) return;

      const viewportWidth = window.innerWidth;
      const containerWidth = 500; // 실제 앱 너비
      const sideGap = Math.max((viewportWidth - containerWidth) / 2, 0);
      const baseRight = sideGap + 16; // 앱 오른쪽 내부 여백

      // 🔵 1) 아이콘 위치
      bubble.style.position = "fixed";
      bubble.style.bottom = "100px";
      bubble.style.right = `${baseRight}px`;
      bubble.style.zIndex = "9999";
      bubble.style.display = "block";

      // 🟣 2) 채팅창 위치 (display 는 여기서 건드리지 않음!)
      if (windowEl) {
        const isMobile = window.innerWidth <= 640;

        windowEl.style.position = "fixed";
        windowEl.style.bottom = isMobile ? "170px" : "170px";
        windowEl.style.top = isMobile ? '0' : "auto";          // 🔴 이게 중요: top 0 덮어쓰기
        windowEl.style.right = isMobile ? `0` : `${baseRight}px`;       // 혹시 모를 left: 0도 초기화

        // 가로 사이즈
        if (isMobile) {
          windowEl.style.maxWidth = "100%";
          windowEl.style.width = "100%";
        } else {
          windowEl.style.maxWidth = "360px";
          windowEl.style.width = "360px";
        }

        // 세로 사이즈
        windowEl.style.maxHeight = isMobile ? "100vh" : "500px";

        windowEl.style.borderRadius = "16px";
        windowEl.style.overflow = "hidden";
        windowEl.style.zIndex = "9999";
      }

      // 🟡 3) “안녕하세요 챗봇입니다” 말풍선 위치
      if (messageBubbles) {
        messageBubbles.style.position = "fixed";
        messageBubbles.style.bottom = "120px";
        messageBubbles.style.right = `${baseRight + 60}px`;
        messageBubbles.style.maxWidth = "270px";
        messageBubbles.style.height = "45px";
        messageBubbles.style.zIndex = "9999";
        messageBubbles.style.display = "block";
      }
    };

    const intervalId = window.setInterval(() => {
      const { bubble } = getElements();
      if (bubble) {
        updatePosition();
        window.clearInterval(intervalId);
      }
    }, 200);

    window.addEventListener("resize", updatePosition);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("resize", updatePosition);
    };
  }, [currentPage, isLoggedIn, showOnboarding]);

  useEffect(() => {
    // 윈도우 스크롤 리셋
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    // 내부 스크롤 컨테이너들 리셋 (필요한 경우)
    const containers = document.querySelectorAll<HTMLElement>("[data-page-scroll]");
    containers.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [currentPage]);

  // useEffect(() => {
  //   if (!isLoggedIn || showOnboarding) return;

  //   const attachClickHandler = () => {
  //     const bubble = document.querySelector(
  //       "#chatbase-bubble-button"
  //     ) as HTMLElement | null;

  //     if (!bubble) return false;

  //     const handleClick = (e: MouseEvent) => {
  //       e.preventDefault();
  //       e.stopPropagation();

  //       const windowEl = document.querySelector(
  //         "#chatbase-bubble-window"
  //       ) as HTMLElement | null;

  //       // 아직 창 DOM이 안 만들어졌으면 그냥 chatbase 기본 동작에 맡김
  //       if (!windowEl) return;

  //       const isHidden =
  //         windowEl.style.display === "none" ||
  //         window.getComputedStyle(windowEl).display === "none";

  //       windowEl.style.display = isHidden ? "block" : "none";
  //     };

  //     // 중복 방지용: 이전에 달려 있던 핸들러 제거
  //     (bubble as any)._wellioChatHandler &&
  //       bubble.removeEventListener(
  //         "click",
  //         (bubble as any)._wellioChatHandler
  //       );

  //     bubble.addEventListener("click", handleClick);
  //     (bubble as any)._wellioChatHandler = handleClick;

  //     return true;
  //   };

  //   const intervalId = window.setInterval(() => {
  //     if (attachClickHandler()) {
  //       window.clearInterval(intervalId);
  //     }
  //   }, 200);

  //   return () => {
  //     window.clearInterval(intervalId);
  //     const bubble = document.querySelector(
  //       "#chatbase-bubble-button"
  //     ) as HTMLElement | null;
  //     if (bubble && (bubble as any)._wellioChatHandler) {
  //       bubble.removeEventListener(
  //         "click",
  //         (bubble as any)._wellioChatHandler
  //       );
  //       delete (bubble as any)._wellioChatHandler;
  //     }
  //   };
  // }, [isLoggedIn, showOnboarding]);

  // 알림 상태
  const [notifications, setNotifications] = useState<Notification[]>([

    {
      id: 1,
      type: "hospital",
      category: "병원 예약",
      message:
        "**김동석**님 매일건강의원 **14:00 진료** 접수되었습니다.\n초진이라면 신분증을 반드시 챙겨주세요.",
      time: "지금",
      isRead: false,
    },
    {
      id: 2,
      type: "community",
      category: "커뮤니티",
      message:
        "**김동석님**이 새로운 글을 올렸어요.",
      time: "10분전",
      isRead: false,
    },
    {
      id: 3,
      type: "family",
      category: "가족",
      message: "**김동석**님이 가족에 추가됐어요.",
      time: "1일전",
      isRead: false,
    },
    {
      id: 4,
      type: "medicine",
      category: "복약알림",
      message: "오늘 오후 9시 복용할 약이 있습니다.",
      time: "1일전",
      isRead: true,
    },
    {
      id: 5,
      type: "challenge",
      category: "챌린지",
      message:
        "**김웰리**님 새로운 추천 챌린지가 있어요.\n눌러서 알아보세요.",
      time: "1일전",
      isRead: true,
    },
    {
      id: 6,
      type: "medicine",
      category: "복약알림",
      message:
        "오늘 오후 13시, **박승희**님의 약 복용 시간입니다.",
      time: "1일전",
      isRead: true,
    },
  ]);

  const hasUnreadNotification = notifications.some((n) => !n.isRead);

  const handleMarkNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkNotificationAsRead(notification.id);

    if (notification.type === "community") {
      const postId = 2;

      // ✅ 1단계: postId 설정
      setSelectedPostId(postId);

      // ✅ 2단계: 페이지 전환 (약간 지연)
      setTimeout(() => {
        navigateTo("community");
      }, 50);  // 50ms만 충분
    }
  };
  const handleDeleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 날짜 생성 헬퍼 함수 (리뷰/샘플용으로만 사용)
  const getRandomPastDate = (maxDaysAgo: number = 365): Date => {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  const formatDateKR = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const formatDateISO = (date: Date): string => {
    return date.toISOString();
  };

  // 네비게이션 히스토리
  const [navigationHistory, setNavigationHistory] =
    useState<Page[]>(["home"]);

  // 수정할 리뷰 저장
  const [editingReview, setEditingReview] = useState<Review | null>(
    null,
  );

  // 알림 페이지에서 돌아갈 페이지 추적 (현재는 사용 X)
  const [previousPage, setPreviousPage] = useState<Page>("home");

  const navigateTo = (page: Page) => {
    if (currentPage === page) return;

    // ✅ 커뮤니티로 갈 때는 selectedPostId 유지
    if (page !== "community") {
      setSelectedPostId(null);
    }

    setNavigationHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };
  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const prev =
        newHistory[newHistory.length - 1] || ("home" as Page);
      setNavigationHistory(newHistory);
      setCurrentPage(prev);
    } else {
      setNavigationHistory(["home"]);
      setCurrentPage("home");
    }
  };

  // 찜한 병원 목록


  // 🔹 처음에 기본으로 찜해 둘 병원 ID
  const INITIAL_FAVORITE_HOSPITAL_IDS = [1, 3, 8, 10];

  const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>(() => {
    // hospitalMap 에서 ID 기준으로 병원 정보를 가져와서 초기값으로 세팅
    return INITIAL_FAVORITE_HOSPITAL_IDS
      .map((id) => hospitalMap[id])
      .filter((hospital): hospital is Hospital => !!hospital);
  });


  // 🔹 찜 토글 함수
  const toggleFavorite = (hospital: Hospital) => {
    setFavoriteHospitals((prev) => {
      const isFavorite = prev.some((h) => h.id === hospital.id);

      // 이미 찜 되어 있으면 제거
      if (isFavorite) {
        return prev.filter((h) => h.id !== hospital.id);
      }

      // hospitalMap 에 있는 "정식" 데이터로 추가
      const fullHospital = hospitalMap[hospital.id];

      if (fullHospital) {
        return [...prev, fullHospital];
      }

      // 혹시 map에 없으면 넘어온 hospital 그대로 추가
      return [...prev, hospital];
    });
  };


  const parseKRDateString = (dateStr: string): Date => {
    // 괄호 뒤 요일은 버리고 "2025.08.08"만 사용
    const [datePart] = dateStr.split("(");
    const [year, month, day] = datePart.split(".").map((v) => Number(v));
    return new Date(year, month - 1, day);
  };

  const initialMyReviews = (() => {
    const visit1Str = "2025.08.08";
    const visit2Str = "2025.07.14";
    const visit3Str = "2025.06.27";
    const visit4Str = "2025.05.20";
    const visit5Str = "2025.05.02";
    const visit6Str = "2025.05.01";

    const review1Date = parseKRDateString(visit1Str);
    const review2Date = parseKRDateString(visit2Str);
    const review3Date = parseKRDateString(visit3Str);
    const review4Date = parseKRDateString(visit4Str);
    const review5Date = parseKRDateString(visit5Str);
    const review6Date = parseKRDateString(visit6Str);

    const h1 = hospitalMap[8];
    const h2 = hospitalMap[9];
    const h3 = hospitalMap[10];
    const h4 = hospitalMap[3];
    const h5 = hospitalMap[10];
    const h6 = hospitalMap[8];

    const reviews = [
      {
        id: 1001,
        hospitalId: h1.id,
        hospitalName: h1.name,
        hospitalImage: h1.imageUrl,
        visitDate: visit1Str,
        rating: 5,
        keywords: ["시설 좋아요", "과잉진료가 없어요", "친절해요"],
        reviewText:
          "대기 많아서 대리접수 해드렸어요. 꾸준히 물치 받고 많이 좋아지셨습니다 첨엔 가만히 있어도 통증이 심했는데 3개월 정도 다녔는데 이제 통증도 없으시다고 하네요. 앞으로도 잘부탁드립니다",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: review1Date.toISOString(),
        visitType: "재방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review1Date,
      },
      {
        id: 1002,
        hospitalId: h2.id,
        hospitalName: h2.name,
        hospitalImage: h2.imageUrl,
        visitDate: visit2Str,
        rating: 5,
        keywords: ["꼼꼼해요", "친절해요"],
        reviewText:
          "토닝이랑 재생관리 받으려고 방문했어요. 장비도 최신 모델이고, 시술 과정도 꼼꼼해서 믿음이 갔습니다. 레이저는 살짝 따끔했는데 바로 재생팩 해주셔서 붉은기 거의 없었어요.  다음 날 화장도 잘 먹어서 만족해요. 가격도 주변 대비 크게 부담되지 않는 편이에요.",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: review2Date.toISOString(),
        visitType: "첫방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review2Date,
      },
      {
        id: 1003,
        hospitalId: h3.id,
        hospitalName: h3.name,
        hospitalImage: h3.imageUrl,
        visitDate: visit3Str,
        rating: 5,
        keywords: ["진료 만족해요"],
        reviewText:
          "제가 어렸을때부터 우리 가족 다니는 병원이에요. 항상 설명 꼼꼼하게 해주시고 과잉진료 없이 필요한 부분만 딱딱 진료해주십니다. 최근에 당때문에 주기적으로 체크중인데 원장님한테 많이 혼나서 습관 고치고 좋아지는 중이에요 항상 감사합니다!",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: review3Date.toISOString(),
        visitType: "재방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review3Date,
      },
      {
        id: 1004,
        hospitalId: h4.id,
        hospitalName: h4.name,
        hospitalImage: h4.imageUrl,
        visitDate: visit3Str,
        rating: 5,
        keywords: ["과잉진료가 없어요", "꼼꼼해요"],
        reviewText:
          "매복 사랑니 때문에 유명하다고 해서 다녀왔는데 진짜 하나도 안아프게 뽑아주셨어요 ㅠㅠ 최고에요",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: review4Date.toISOString(),
        visitType: "첫방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review4Date,
      },
      {
        id: 1005,
        hospitalId: h5.id,
        hospitalName: h5.name,
        hospitalImage: h5.imageUrl,
        visitDate: visit5Str,
        rating: 5,
        keywords: ["과잉진료가 없어요", "꼼꼼해요"],
        reviewText: "원장님 건강하세요!!!!!!!!!! 감사합니다",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: review3Date.toISOString(),
        visitType: "재방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review5Date,
      },
      {
        id: 1006,
        hospitalId: h6.id,
        hospitalName: h6.name,
        hospitalImage: h6.imageUrl,
        visitDate: visit6Str,
        rating: 5,
        keywords: ["진료 만족해요"],
        reviewText:
          "엄마 오십견 증상이 있어서 오십견에 유명하다는 곳 검색해서 다녀왔어요 시설도 좋고 장비들도 다양해서 꼼꼼하게 검사해주셨어요. 통증이 심하셔서 걱정했는데 당분간 물치만 꾸준히 받으면 된다고 하네요. 최대한 수술이나 힘든 치료보다 꾸준한 관리로 추천해주셔서 좋았습니다. 원장님 설명도 잘해주시고 전문적으로 잘 봐주셔서 믿음이 갑니다.",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: review3Date.toISOString(),
        visitType: "첫방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review6Date,
      },
    ];

    return reviews
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(({ dateObj, ...rest }) => rest);
  })();

  const [reviewedHospitals, setReviewedHospitals] = useState<number[]>([
    2, 3, 5, 6, 7, 8,
  ]);

  const [medicalRecords, setMedicalRecords] = useState(() => [
    {
      id: 1,
      code: "20250808-012345",
      patientName: USERS.dongseok.name,
      patientAvatar: USERS.dongseok.avatar,
      hospitalName: "매일건강의원",
      visitDate: "2025.08.08",
      visitTime: "14:00",
      doctor: "이준호",
      memo: "아빠 감기몸살로 내원, 3일 뒤 재진",
      isMyAppointment: true,
    },
    {
      id: 2,
      code: "20250805-012345",
      patientName: USERS.seunghee.name,
      patientAvatar: USERS.seunghee.avatar,
      hospitalName: "바른정형외과의원",
      visitDate: "2025.08.05(화)",
      visitTime: "10:25",
      doctor: "김슬기",
      memo: "엄마 2일마다 물리치료",
      isMyAppointment: true,
    },
    {
      id: 3,
      code: "20250714-012345",
      patientName: USERS.wellie.name,
      patientAvatar: USERS.wellie.avatar,
      hospitalName: "고운피부과 ",
      visitDate: "2025.07.14",
      visitTime: "18:50",
      doctor: "이윤지",
      memo: "",
      isMyAppointment: true,
    },
    {
      id: 4,
      code: "20250702-012345",
      patientName: USERS.dongseok.name,
      patientAvatar: USERS.dongseok.avatar,
      hospitalName: "오늘도강한내과의원",
      visitDate: "2025.07.02",
      visitTime: "11:00",
      doctor: "강한",
      memo: "정기 검진 완료, 특이사항 없음",
      isMyAppointment: false,
    },
    {
      id: 5,
      code: "20250627-012345",
      patientName: USERS.wellie.name,
      patientAvatar: USERS.wellie.avatar,
      hospitalName: "오늘도강한내과의원",
      visitDate: "2025.06.27",
      visitTime: "18:30",
      doctor: "강한",
      memo: "혈당재검",
      isMyAppointment: true,
    },
    {
      id: 6,
      code: "20250520-012345",
      patientName: USERS.wellie.name,
      patientAvatar: USERS.wellie.avatar,
      hospitalName: "사랑니쏙쏙 강남본점",
      visitDate: "2025.05.20",
      visitTime: "14:00",
      doctor: "유치영",
      memo: "",
      isMyAppointment: true,
    },
    {
      id: 7,
      code: "20250502-012345",
      patientName: USERS.dongseok.name,
      patientAvatar: USERS.dongseok.avatar,
      hospitalName: "오늘도강한내과의원",
      visitDate: "2025.05.02",
      visitTime: "11:00",
      doctor: "강한",
      memo: "혈압약",
      isMyAppointment: true,
    },
    {
      id: 8,
      code: "20250501-012345",
      patientName: USERS.seunghee.name,
      patientAvatar: USERS.seunghee.avatar,
      hospitalName: "바른정형외과의원",
      visitDate: "2025.05.01",
      visitTime: "10:10",
      doctor: "김슬기",
      memo: "",
      isMyAppointment: true,
    },
    {
      id: 9,
      code: "20250311-012345",
      patientName: USERS.seunghee.name,
      patientAvatar: USERS.seunghee.avatar,
      hospitalName: "오늘도강한내과의원",
      visitDate: "2025.03.11",
      visitTime: "15:10",
      doctor: "김슬기",
      memo: "",
      isMyAppointment: false,
    },
  ]);

  const [myReviews, setMyReviews] =
    useState<Review[]>(initialMyReviews);

  const [sampleReviews, setSampleReviews] = useState<Review[]>(() => {
    const getRandomReviewer = () => {
      const randomIndex = Math.floor(
        Math.random() * REVIEW_AUTHORS.length,
      );
      return REVIEW_AUTHORS[randomIndex];
    };

    const dates = Array.from({ length: 30 }, () =>
      getRandomPastDate(360),
    );

    const reviews: Review[] = [];

    const reviewTemplates = [
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "친절해요", "재진료 희망해요"],
        text: "건강검진에서 간 수치가 높게 나와 걱정이 많았습니다. 직장 동료 추천으로 매일건강의원을 찾았는데, 원장님이 저의 음주 습관이나 식습관을 자세히 물어보시더군요. 단순 처방이 아니라, 앞으로 3개월간의 관리 계획까지 같이 짜주셔서 책임감을 느끼고 있습니다. 확실히 믿고 다닐 수 있는 곳입니다.",
        visitType: "첫방문" as const,
        likes: 11,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["과잉진료가 없어요", "친절해요",],
        text: "친절하고 빠른 진료! 갑자기 목이 칼칼하고 열이 나서 급하게 방문했어요. 대기 없이 바로 진료 봤고, 의사 선생님 설명도 간단명료해서 좋았습니다. 아픈데 오래 앉아있지 않아서 만족도 최상! 주변 지인들에게도 추천할게요.",
        visitType: "재방문" as const,
        likes: 2,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요",],
        text: "만성 질환 관리 받고 있는데 대기 시간도 짧고 원장님도 항상 친절하세요. 과잉 진료 없이 꼭 필요한 것만 처방해주셔서 좋아요.",
        visitType: "재방문" as const,
        likes: 16,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "친절해요", "재진료 희망해요"],
        text: "알레르기 검사 받으러 갔는데 원장님이 정말 친절하고 꼼꼼하게 설명해주셨어요. 병원도 깨끗하고 추천합니다!",
        visitType: "첫방문" as const,
        likes: 13,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["과잉진료가 없어요", "친절해요",],
        text: "소화불량으로 방문했는데 원장님이 친절하게 진료해주셨어요. 과잉 처방 없이 필요한 약만 처방해주셔서 좋았습니다.",
        visitType: "첫방문" as const,
        likes: 8,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "친절해요", "재진료 희망해요",],
        text: "당뇨 관리 받고 있는데 원장님이 매번 꼼꼼하게 봐주세요. 대기 시간도 짧고 시설도 깨끗합니다.",
        visitType: "재방문" as const,
        likes: 12,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "친절해요", "진료 만족해요"],
        text: "장염으로 방문했는데 원장님이 정말 꼼꼼하게 진료해주셔서 빠르게 회복했어요. 직원분들도 모두 친절하십니다.",
        visitType: "첫방문" as const,
        likes: 10,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "재진료 희망해요"],
        text: "고혈압 정기 검진 받는데 원장님이 항상 친절하고 꼭 필요한 검사만 권유하세요. 병원도 깨끗하고 만족합니다.",
        visitType: "재방문" as const,
        likes: 15,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "쾌적해요",],
        text: "목이 아프고 근육통이 심해서 방문했는데 친절하게 진료 잘 봐주셔서 좋았습니다! 목 상태 확인하시고 간단한 증상 상담 후 약 처방해 주셨어요. 처방받은 약 먹고 한숨 잤더니 한결 개운해졌습니다. 갑자기 아파서 가장 가까운 데로 바로 접수 후에 대기 없이 진료받을 수 있었어요. 기운 없었는데 빨리 진료 끝나서 만족합니다. 서초동 근처에 병원 찾으시면 추천해요 ㅎㅎ",
        visitType: "첫방문" as const,
        likes: 6,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "재진료 희망해요"],
        text: "만족스러운 첫 방문! 이사 와서 처음 방문했는데, 앞으로 꾸준히 다닐 것 같습니다. 제 건강을 믿고 맡길 수 있는 주치의를 만난 것 같아 든든해요.",
        visitType: "첫방문" as const,
        likes: 15,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "재진료 희망해요"],
        text: "고혈압 정기 검진 받는데 원장님이 항상 친절하고 꼭 필요한 검사만 권유하세요. 병원도 깨끗하고 만족합니다.",
        visitType: "재방문" as const,
        likes: 15,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "재진료 희망해요"],
        text: "이석증 증세와 비슷한 어지럼증으로 방문했습니다. 처음에는 이비인후과를 가야 하나 고민했는데, 원장님께서 전반적인 컨디션과 생활습관까지 체크하며 진료해 주셨어요. 스트레스나 피로가 원인일 수 있다고 하셔서 마음 편하게 약 복용하고 휴식을 취했더니 많이 나아졌습니다. 전문성과 따뜻함이 느껴지는 병원이에요.",
        visitType: "재방문" as const,
        likes: 11,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "재진료 희망해요"],
        text: "매달 정기적으로 혈당 체크와 약 처방을 받고 있습니다. 단순 처방이 아니라, 식단이나 운동에 대한 조언도 매번 잊지 않고 해주셔서 동기 부여가 돼요. 꼼꼼한 관리 덕분에 혈당 수치도 많이 안정되었습니다.",
        visitType: "재방문" as const,
        likes: 3,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["주차 편해요", "쾌적해요", "재진료 희망해요"],
        text: "주차 공간도 넉넉하고 병원도 최신 시설이라 쾌적합니다. 냄새나 불쾌한 느낌 전혀 없이 깔끔해서 기분 좋게 진료받았습니다. 위생에 민감한 분들도 만족할 거예요.",
        visitType: "재방문" as const,
        likes: 10,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "친절해요", "과잉진료가 없어요"],
        text: "고지혈증 약 복용 시작했어요. 콜레스테롤 수치가 높아져서 걱정했는데, 약 복용에 대한 불안감을 잘 해소시켜 주셨어요. 작용 설명도 상세했고, 꼭 필요한 검사만 권유하셔서 신뢰가 갔습니다. 앞으로도 여기서 관리받을 예정입니다.",
        visitType: "재방문" as const,
        likes: 5,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["친절해요", "과잉진료가 없어요"],
        text: "밤에 기침 때문에 잠을 못 잘 지경이었는데, 엑스레이나 다른 검사 없이도 증상만 듣고 어떤 약이 좋을지 딱! 아시더라고요. 약 먹고 이틀 만에 기침 횟수가 확 줄었어요.",
        visitType: "재방문" as const,
        likes: 7,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["예약이 쉬워요", "친절해요", "과잉진료가 없어요"],
        text: "피로 회복 주사 맞았어요. 만성 피로 때문에 주말에도 녹초였는데, 영양 수액 상담받고 맞았습니다. 효과가 바로 드라마틱 하진 않지만, 확실히 몸이 가벼워진 느낌이에요. 다음 주에 한 번 더 맞으러 갈까 생각 중입니다.",
        visitType: "첫방문" as const,
        likes: 6,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["재진료 희망해요", "친절해요", "꼼꼼해요"],
        text: "약 복용 관련 질문에도 친절하세요. 만성 질환 약 먹으면서 궁금한 점이 많았는데, 갈 때마다 질문해도 귀찮은 내색없이 잘 답변해 주셨습니다. 환자가 이해하기 쉽게 설명해 주시는 점이 가장 마음에 들어요.",
        visitType: "재방문" as const,
        likes: 7,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["친절해요", "재진료 희망해요"],
        text: "만성 소화불량 상담 내과 가야 하나 고민했는데, 가정의학과에서 전반적인 컨디션까지 함께 체크해 주셨습니다. 스트레스성 소화불량 같다고 하셔서 상담 위주로 진료받고 생활 습관 개선 조언도 들었어요. 단순 증상 치료를 넘어선 진료라 좋았습니다.",
        visitType: "재방문" as const,
        likes: 3,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "재진료 희망해요",],
        text: "온 가족 주치의 병원 아이부터 부모님까지 온 가족이 다니는 병원입니다. 연령별로 진료 방식이 달라서 좋아요. 아이가 갑자기 열이 나도 안심하고 데려갈 수 있습니다.",
        visitType: "재방문" as const,
        likes: 2,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["친절해요", "진료 만족해요", "재진료 희망해요",],
        text: "가정의학과의 장점이 잘 드러나는 곳. 어디가 아픈지 모를 때, 혹은 여러 증상이 복합적일 때 무조건 여기로 옵니다. 전체적인 밸런스를 맞춰서 진료해 주시는 점이 가장 큰 장점입니다.",
        visitType: "재방문" as const,
        likes: 0,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["과잉진료가 없어요", "친절해요"],
        text: "원장님이 굉장히 젠틀하시고 전문적이십니다. 어려운 의학 용어를 쓰지 않고 쉽게 설명해 주셔서 이해하기 편했어요.",
        visitType: "재방문" as const,
        likes: 0,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["예약이 쉬워요", "과잉진료가 없어요", "친절해요"],
        text: "친절하고 빠른 진료! 갑자기 목이 칼칼하고 열이 나서 급하게 방문했어요. 대기 없이 바로 진료 봤고, 의사 선생님 설명도 간단명료해서 좋았습니다. 아픈데 오래 앉아있지 않아서 만족도 최상! 주변 지인들에게도 추천할게요.",
        visitType: "재방문" as const,
        likes: 0,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["재진료 희망해요", "친절해요"],
        text: "만족스러운 첫 방문! 이사 와서 처음 방문했는데, 앞으로 꾸준히 다닐 것 같습니다. 제 건강을 믿고 맡길 수 있는 주치의를 만난 것 같아 든든해요.",
        visitType: "첫방문" as const,
        likes: 17,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "과잉진료가 없어요"],
        text: "건강검진에서 간 수치가 높게 나와 걱정이 많았습니다. 직장 동료 추천으로 매일건강의원을 찾았는데, 원장님이 저의 음주 습관이나 식습관을 자세히 물어보시더군요. 단순 처방이 아니라, 앞으로 3개월간의 관리 계획까지 같이 짜주셔서 책임감을 느끼고 있습니다. 확실히 믿고 다닐 수 있는 곳입니다.",
        visitType: "첫방문" as const,
        likes: 11,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["예약이 쉬워요", "과잉진료가 없어요", "친절해요",],
        text: "점심시간 30분 안에 진료를 봐야 하는 상황이었는데, 말씀드리니 최대한 빠르게 처리해 주셨어요. 물론 진료 내용은 꼼꼼했습니다. 바쁜 현대인에게 딱 맞는 병원! ",
        visitType: "첫방문" as const,
        likes: 0,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["과잉진료가 없어요", "친절해요"],
        text: "간호사 선생님들이 정말 친절하세요! 처음 접수할 때부터 나갈 때까지 기분 좋게 응대해 주셔서 아픈 와중에도 마음이 편했습니다. 의사 선생님 친절은 기본이고요.",
        visitType: "재방문" as const,
        likes: 2,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["과잉진료가 없어요", "친절해요", "쾌적해요"],
        text: "회사에서 검진받았는데 비타민 D가 너무 낮다고 해서 주사 맞으러 갔습니다. 왜 비타민 D가 중요한지, 얼마나 주기적으로 맞아야 하는지 상세히 알려주셔서 유익했습니다.",
        visitType: "재방문" as const,
        likes: 9,
      },
    ];

    reviewTemplates.forEach((template, index) => {
      const reviewer = getRandomReviewer();
      const date = dates[index];
      reviews.push({
        id: 1001 + index,
        hospitalId: template.hospitalId,
        hospitalName: template.hospitalName,
        hospitalImage: `https://example.com/hospital${template.hospitalId}.jpg`,
        visitDate: formatDateKR(date),
        rating: template.rating,
        keywords: template.keywords,
        reviewText: template.text,
        userName: reviewer.name,
        userAvatar: reviewer.avatar,
        createdAt: formatDateISO(date),
        visitType: template.visitType,
        likes: template.likes,
        likedBy: [],
      });
    });

    return reviews.slice(0, 30);
  });

  const getHospitalReviewCount = (hospitalId: number): number => {
    const sampleCount = sampleReviews.filter(
      (review) => review.hospitalId === hospitalId,
    ).length;
    const userCount = myReviews.filter(
      (review) => review.hospitalId === hospitalId,
    ).length;
    return sampleCount + userCount;
  };

  const getHospitalAverageRating = (hospitalId: number): number => {
    const hospitalReviews = [
      ...sampleReviews.filter(
        (review) => review.hospitalId === hospitalId,
      ),
      ...myReviews.filter(
        (review) => review.hospitalId === hospitalId,
      ),
    ];

    if (hospitalReviews.length === 0) return 0;

    const totalRating = hospitalReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return Math.round((totalRating / hospitalReviews.length) * 10) / 10;
  };

  const getHospitalKeywordStats = (
    hospitalId: number,
  ): Array<{ keyword: string; count: number; percentage: number }> => {
    const hospitalReviews = [
      ...sampleReviews.filter(
        (review) => review.hospitalId === hospitalId,
      ),
      ...myReviews.filter(
        (review) => review.hospitalId === hospitalId,
      ),
    ];

    const keywordCount: { [key: string]: number } = {};
    hospitalReviews.forEach((review) => {
      review.keywords.forEach((keyword) => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });

    const totalReviews = hospitalReviews.length;

    const stats = Object.entries(keywordCount)
      .map(([keyword, count]) => ({
        keyword,
        count,
        percentage:
          totalReviews > 0
            ? Math.round((count / totalReviews) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return stats;
  };

  const handleDeleteReview = (reviewId: number) => {
    setMyReviews(myReviews.filter((review) => review.id !== reviewId));
  };

  const handleToggleLike = (reviewId: number) => {
    setSampleReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          const isLiked = review.likedBy.includes(userName);
          return {
            ...review,
            likes: isLiked ? review.likes - 1 : review.likes + 1,
            likedBy: isLiked
              ? review.likedBy.filter((name) => name !== userName)
              : [...review.likedBy, userName],
          };
        }
        return review;
      }),
    );

    setMyReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          const isLiked = review.likedBy.includes(userName);
          return {
            ...review,
            likes: isLiked ? review.likes - 1 : review.likes + 1,
            likedBy: isLiked
              ? review.likedBy.filter((name) => name !== userName)
              : [...review.likedBy, userName],
          };
        }
        return review;
      }),
    );
  };

  const [selectedMedicalRecord, setSelectedMedicalRecord] =
    useState<{
      id: number;
      hospitalName: string;
      visitDate: string;
      visitTime: string;
    } | null>(null);

  // 🔹 커뮤니티 포스트: 오늘 기준 상대 날짜 사용
  const [posts, setPosts] = useState<Post[]>(() => createInitialPosts());

  const handleLogin = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
  };

  const handleHospitalClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    navigateTo("hospital-detail");
  };

  const handleUpload = (
    newPost: Omit<Post, "id" | "userName" | "userAvatar">,
  ) => {
    const today = new Date();
    const dateStr = formatDateKey(today);

    const post: Post = {
      ...newPost,
      textOverlay: newPost.textOverlay?.trim() || undefined,
      id: Math.max(0, ...posts.map((p) => p.id)) + 1,
      userName: userName,
      userAvatar: userAvatar,
      createdAt: newPost.createdAt || dateStr,
    };
    setPosts([post, ...posts]);

    // ✅ 히스토리 유지하면서 커뮤니티로 복귀
    navigateTo("community");
  };


  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handleUpdateMemo = (recordId: number, newMemo: string) => {
    setMedicalRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === recordId ? { ...record, memo: newMemo } : record,
      ),
    );
  };

  const handleUpdateAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 로그인 플로우
  if (!isLoggedIn) {
    if (loginStep === "welcome") {
      return (
        <WelcomePage
          onGuestMode={() => {
            setUserName(USERS.wellie.name);
            setUserAvatar(USERS.wellie.avatar);
            setIsLoggedIn(true);
            setShowOnboarding(true);
          }}
          onSignUp={() => {
            setLoginStep("social");
          }}
        />
      );
    }

    if (loginStep === "social") {
      return (
        <SocialLoginPage
          onBack={() => setLoginStep("welcome")}
          onEmailLogin={() => setLoginStep("email")}
        />
      );
    }

    if (loginStep === "email") {
      return <LoginPage onLogin={handleLogin} />;
    }
  }

  // 온보딩
  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentPage("home");
        }}
        userName={userName}
        posts={posts}
        medicalRecords={medicalRecords}
        reviewedHospitals={reviewedHospitals}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] flex justify-center">
      <div className="w-full max-w-[500px] min-h-screen bg-white relative shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]">
        {currentPage === "home" && (
          <HomePage
            userName={userName}
            currentPage={currentPage}
            onPageChange={(page) => {
              navigateTo(page as Page);
            }}
            onHospitalClick={handleHospitalClick}
            getHospitalReviewCount={getHospitalReviewCount}
            hasUnreadNotification={hasUnreadNotification}
            onNotificationClick={() => {
              setPreviousPage("home");
              navigateTo("notifications" as Page);
            }}
          />
        )}

        {currentPage === "hospital" && (
          <HospitalSearchPage
            onBack={navigateBack}
            onHospitalClick={handleHospitalClick}
            favoriteHospitals={favoriteHospitals}
            onToggleFavorite={toggleFavorite}
            getHospitalReviewCount={getHospitalReviewCount}
            onPageChange={(page) => navigateTo(page as Page)}
          />
        )}

        {currentPage === "hospital-detail" && selectedHospital && (
          <HospitalDetailPage
            hospital={selectedHospital}
            onBack={navigateBack}
            onReviewsClick={() => navigateTo("hospital-reviews")}
            reviewCount={getHospitalReviewCount(selectedHospital.id)}
            averageRating={getHospitalAverageRating(
              selectedHospital.id,
            )}
            keywordStats={getHospitalKeywordStats(
              selectedHospital.id,
            )}
            onToggleLike={handleToggleLike}
            currentUserName={userName}
            previewReviews={[
              ...sampleReviews
                .filter(
                  (review) =>
                    review.hospitalId === selectedHospital.id,
                )
                .map((review) => ({
                  id: `sample-${review.id}`,
                  author: review.userName,
                  date: review.visitDate,
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked:
                    review.likedBy?.includes(userName) || false,
                  visitType: review.visitType || "첫방문",
                  originalId: review.id,
                })),
              ...myReviews
                .filter(
                  (review) =>
                    review.hospitalId === selectedHospital.id,
                )
                .map((review) => ({
                  id: `user-${review.id}`,
                  author: review.userName,
                  date: new Date(
                    review.createdAt,
                  ).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                    .replace(/\. /g, ".")
                    .replace(/\.$/, ""),
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked:
                    review.likedBy?.includes(userName) || false,
                  visitType: review.visitType || "첫방문",
                  originalId: review.id,
                })),
            ]}
          />
        )}

        {currentPage === "community" && (
          <CommunityPage
            onBack={navigateBack}
            onUploadClick={() => navigateTo("upload")}
            onNotificationClick={() => navigateTo("notifications")}
            posts={posts}
            currentUserId={"kim-welly"}
            initialPostId={selectedPostId}  // ✅ 이게 제대로 전달되는지
            onPageChange={(page) => {
              if (page === "calendar") navigateTo("calendar");
            }}
            onDeletePost={handleDeletePost}
            hasUnreadNotification={hasUnreadNotification}
          />
        )}

        {currentPage === "profile" && (
          <ProfilePage
            userName={userName}
            userAvatar={userAvatar}
            currentPage={currentPage}
            onPageChange={(page) => navigateTo(page as Page)}
            onBack={navigateBack}
            onMyReviewsClick={() => navigateTo("my-reviews")}
            onFavoriteHospitalsClick={() =>
              navigateTo("favorite-hospitals")
            }
            myReviewsCount={myReviews.length}
          />
        )}

        {currentPage === "upload" && (
          <UploadPage onBack={navigateBack} onUpload={handleUpload} />
        )}

        {currentPage === "medical-history" && (
          <MedicalHistoryPage
            onBack={navigateBack}
            onWriteReview={(record) => {
              setSelectedMedicalRecord({
                id: record.id,
                hospitalName: record.hospitalName!,
                visitDate: record.visitDate,
                visitTime: record.visitTime,
              });
              navigateTo("write-review");
            }}
            reviewedHospitals={reviewedHospitals}
            onViewReviews={() => navigateTo("my-reviews")}
            records={medicalRecords}
            onUpdateMemo={handleUpdateMemo}
            currentPage={currentPage}
            onPageChange={(page) => navigateTo(page as Page)}
          />
        )}

        {currentPage === "my-reviews" && (
          <MyReviewsPage
            onBack={navigateBack}  // ✅ 기존: () => setCurrentPage("home") → 변경: navigateBack
            reviews={myReviews}
            onDeleteReview={handleDeleteReview}
            onEditReview={(review) => {
              setEditingReview(review);
              setSelectedMedicalRecord({
                id: review.hospitalId,
                hospitalName: review.hospitalName,
                visitDate: review.visitDate,
                visitTime: "",
              });
              navigateTo("write-review");
            }}
          />
        )}

        {currentPage === "favorite-hospitals" && (
          <FavoriteHospitalsPage
            onBack={navigateBack}
            favoriteHospitals={favoriteHospitals}
            onToggleFavorite={toggleFavorite}
            getHospitalReviewCount={getHospitalReviewCount}
          />
        )}

        {currentPage === "notifications" && (
          <NotificationPage
            onBack={navigateBack}
            notifications={notifications}
            onDeleteNotification={handleDeleteNotification}
            onMarkAsRead={handleMarkNotificationAsRead}
            onNotificationClick={handleNotificationClick}  // ✅ 추가!
          />
        )}

        {currentPage === "write-review" && selectedMedicalRecord && (
          <ReviewWritePage
            onBack={() => {
              setEditingReview(null);
              navigateBack();
            }}
            onComplete={(
              reviewData: Omit<Review, "id" | "createdAt">,
            ) => {
              if (editingReview) {
                setMyReviews((prevReviews) =>
                  prevReviews.map((review) =>
                    review.id === editingReview.id
                      ? {
                        ...review,
                        rating: reviewData.rating,
                        keywords: reviewData.keywords,
                        reviewText: reviewData.reviewText,
                        visitType: reviewData.visitType,
                      }
                      : review,
                  ),
                );
                setEditingReview(null);
              } else {
                const newReview: Review = {
                  ...reviewData,
                  id: myReviews.length + 1,
                  createdAt: new Date().toISOString(),
                };
                setMyReviews([newReview, ...myReviews]);
                setReviewedHospitals([
                  ...reviewedHospitals,
                  reviewData.hospitalId,
                ]);
              }
              navigateTo("my-reviews");
            }}
            userName={userName}
            hospitalName={selectedMedicalRecord.hospitalName}
            visitDate={`${selectedMedicalRecord.visitDate} ${selectedMedicalRecord.visitTime}`}
            hospitalId={selectedMedicalRecord.id}
            editingReview={editingReview}
          />
        )}

        {currentPage === "hospital-reviews" && selectedHospital && (
          <HospitalReviewsPage
            onBack={navigateBack}
            hospitalName={selectedHospital.name}
            keywordStats={getHospitalKeywordStats(
              selectedHospital.id,
            )}
            onToggleLike={handleToggleLike}
            currentUserName={userName}
            reviews={[
              ...sampleReviews
                .filter(
                  (review) =>
                    review.hospitalId === selectedHospital.id,
                )
                .map((review) => ({
                  id: `sample-${review.id}`,
                  author: review.userName,
                  date: review.visitDate,
                  visitType: review.visitType || "첫방문",
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked:
                    review.likedBy?.includes(userName) || false,
                  originalId: review.id,
                })),
              ...myReviews
                .filter(
                  (review) =>
                    review.hospitalId === selectedHospital.id,
                )
                .map((review) => ({
                  id: `user-${review.id}`,
                  author: review.userName,
                  date: review.visitDate,
                  visitType: review.visitType || "첫방문",
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked:
                    review.likedBy?.includes(userName) || false,
                  originalId: review.id,
                })),
            ].sort((a, b) => {
              const dateA = new Date(a.date.replace(/\./g, "-"));
              const dateB = new Date(b.date.replace(/\./g, "-"));
              return dateB.getTime() - dateA.getTime();
            })}
          />
        )}

        {currentPage === "calendar" && (
          <CalendarPage
            onBack={navigateBack}
            posts={posts}
            onPostClick={(postId) => {
              setSelectedPostId(postId);
              navigateTo("community");
            }}
          />
        )}
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
}