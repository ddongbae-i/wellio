import { useState } from "react";
import { WelcomePage } from "./components/WelcomePage";
import { SocialLoginPage } from "./components/SocialLoginPage";
import { LoginPage } from "./components/LoginPage";
import { HomePage } from "./components/HomePage";
import { HospitalSearchPage } from "./components/HospitalSearchPage";
import { CommunityPage } from "./components/CommunityPage";
import { ProfilePage } from "./components/ProfilePage"; // 👈 1. ProfilePage import
import { HospitalDetailPage } from "./components/HospitalDetailPage"; // 👈 HospitalDetailPage import
import { UploadPage } from "./components/UploadPage"; // 👈 UploadPage import
import { MedicalHistoryPage } from "./components/MedicalHistoryPage"; // 👈 MedicalHistoryPage import
import { MyReviewsPage } from "./components/MyReviewsPage"; // 👈 MyReviewsPage import
import { FavoriteHospitalsPage } from "./components/FavoriteHospitalsPage"; // 👈 FavoriteHospitalsPage import
import { NotificationPage } from "./components/NotificationPage"; // 👈 NotificationPage import
import { OnboardingPage } from "./components/OnboardingPage"; // 👈 OnboardingPage import
import { ReviewWritePage } from "./components/ReviewWritePage"; // 👈 ReviewWritePage import
import { HospitalReviewsPage } from "./components/HospitalReviewsPage"; // 👈 HospitalReviewsPage import
import { CalendarPage } from "./components/CalendarPage"; // 👈 CalendarPage import
import { Toaster } from "sonner"; // 👈 Toaster import

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
  badge?: string;
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

// ✅ 진료내역 기본 mock 데이터 (메모 포함 원본 3개)
const MOCK_MEDICAL_RECORDS = [
  {
    id: 1,
    code: "20250811-012345",
    patientName: USERS.dongseok.name,
    patientAvatar: USERS.dongseok.avatar,
    hospitalName: "매일건강의원",
    visitDate: "2025.08.11",
    visitTime: "14:00",
    doctor: "이준호",
    memo: "아빠 감기몸살로 내원, 3일 뒤 재진",
    isMyAppointment: true,
    dateObj: new Date("2025-08-11T14:00:00"),
  },
  {
    id: 2,
    code: "20250805-012345",
    patientName: USERS.seunghee.name,
    patientAvatar: USERS.seunghee.avatar,
    hospitalName: "365클리닉 강남본점",
    visitDate: "2025.08.05",
    visitTime: "10:25",
    doctor: "김슬기",
    memo: "엄마 2일마다 물리치료",
    isMyAppointment: true,
    dateObj: new Date("2025-08-05T10:25:00"),
  },
  {
    id: 3,
    code: "REC-2024-003",
    patientName: USERS.wellie.name,
    patientAvatar: USERS.wellie.avatar,
    hospitalName: "매일건강의원",
    visitDate: "2024.11.05",
    visitTime: "16:00",
    doctor: "박민준 교수",
    memo: "정기 검진 완료, 특이사항 없음",
    isMyAppointment: false,
    dateObj: new Date("2024-11-05T16:00:00"),
  },
];

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
      type: "family",
      category: "가족",
      message: "**박승희**님이 가족에 추가됐어요.",
      time: "5분전",
      isRead: false,
    },
    {
      id: 3,
      type: "family",
      category: "가족",
      message: "**김동석**님이 가족에 추가됐어요.",
      time: "5분전",
      isRead: false,
    },
    {
      id: 4,
      type: "medicine",
      category: "복약알림",
      message: "오늘 오후 9시 복용할 약이 있습니다.",
      time: "3시간전",
      isRead: true,
    },
    {
      id: 5,
      type: "challenge",
      category: "챌린지",
      message:
        "**김웰리**님 새로운 추천 챌린지가 있어요.\n눌러서 알아보세요.",
      time: "12시간전",
      isRead: true,
    },
    {
      id: 6,
      type: "medicine",
      category: "복약알림",
      message:
        "오늘 오후 6시, **박승희**님의 약 복용 시간입니다.",
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

  const handleDeleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // 날짜 생성 헬퍼 함수
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
  const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>(
    [
      {
        id: 1,
        name: "매일건강의원",
        department: "가정의학과",
        specialtyText: "가정의학과와 전문의 2명",
        address: "서울 서초구 서초대로 59번길 19, 201호",
        phone: "02-1234-5678",
        hours: "10:00-20:00",
        distance: "37m",
        description:
          "환자 중심의 진료를 제공하는 가정의학과 전문 병원입니다. 만성질환 관리부터 건강검진까지 종합적인 의료 서비스를 제공합니다.",
        imageUrl:
          "https://images.unsplash.com/photo-1580281658136-17c835359e86?w=100&h=100&fit=crop",
        latitude: 37.4949,
        longitude: 127.0283,
        isAvailableNow: true,
        rating: 4.8,
        reviews: 223,
      },
      {
        id: 2,
        name: "365클리닉 강남본점",
        department: "피부과",
        specialtyText: "피부과와 전문의 3명",
        address: "서울 서초구 서초대로 16가길, 3층",
        phone: "02-2345-6789",
        hours: "09:30-20:30",
        distance: "58m",
        description:
          "최신 피부과 시술 장비를 갖춘 전문 클리닉입니다. 여드름, 미백, 안티에이징 등 다양한 피부 치료를 제공합니다.",
        imageUrl:
          "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
        latitude: 37.495,
        longitude: 127.0285,
        isAvailableNow: true,
        rating: 4.6,
        reviews: 12,
      },
      {
        id: 3,
        name: "사랑니쏙쏙 강남본점",
        department: "치과",
        specialtyText: "치과",
        address: "서울 서초구 강남대로 102",
        phone: "02-3456-7890",
        hours: "10:00-18:00",
        distance: "167m",
        description:
          "사랑니 발치 전문 치과입니다. 통증 최소화와 빠른 회복을 위한 최신 시술 방법을 사용합니다.",
        imageUrl:
          "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
        latitude: 37.4955,
        longitude: 127.029,
        isAvailableNow: true,
        rating: 4.7,
        reviews: 41,
      },
    ],
  );

  // 작성한 리뷰 목록 초기값
  const initialMyReviews = (() => {
    const review1Date = getRandomPastDate(80);
    const review2Date = getRandomPastDate(120);
    const review3Date = getRandomPastDate(150);

    const reviews = [
      {
        id: 1001,
        hospitalId: 1,
        hospitalName: "매일건강의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(review1Date),
        rating: 5,
        keywords: ["친절해요", "과잉진료가 없어요", "꼼꼼해요"],
        reviewText:
          "아빠 감기몸살로 내원했는데 원장님이 정말 친절하게 진료해주셨어요. 과잉진료 없이 필요한 것만 처방해주셔서 좋았습니다.",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: formatDateISO(review1Date),
        visitType: "재방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review1Date,
      },
      {
        id: 1002,
        hospitalId: 2,
        hospitalName: "365클리닉 강남본점",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(review2Date),
        rating: 5,
        keywords: ["쾌적해요", "시설이 깨끗해요", "친절해요"],
        reviewText:
          "피부과 시술 받았는데 시설도 깨끗하고 직원분들도 친절하세요. 최신 장비로 시술해서 만족스러웠습니다.",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: formatDateISO(review2Date),
        visitType: "첫방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review2Date,
      },
      {
        id: 1003,
        hospitalId: 3,
        hospitalName: "사랑니쏙쏙 강남본점",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(review3Date),
        rating: 4,
        keywords: ["친절해요", "대기시간이 짧아요"],
        reviewText:
          "사랑니 발치했는데 원장님이 꼼꼼하게 설명해주시고 통증도 거의 없었어요. 대기시간도 짧아서 좋았습니다.",
        userName: USERS.wellie.name,
        userAvatar: USERS.wellie.avatar,
        createdAt: formatDateISO(review3Date),
        visitType: "첫방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review3Date,
      },
    ];

    return reviews
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(({ dateObj, ...rest }) => rest);
  })();

  // ✅ 리뷰 작성한 진료 기록 id 목록 (1,2는 리뷰 있음으로 가정)
  const [reviewedHospitals, setReviewedHospitals] = useState<number[]>(
    [1, 2],
  );

  // ✅ 진료내역 데이터 관리 (메모는 그대로, 추가/미작성 기록 포함)
  const [medicalRecords, setMedicalRecords] = useState(() => {
    const record4Date = getRandomPastDate(30);
    const record5Date = getRandomPastDate(200);
    const record6Date = getRandomPastDate(10); // 미작성 예시

    const additionalRecords = [
      {
        id: 2001,
        code: `${record4Date.getFullYear()}${String(
          record4Date.getMonth() + 1,
        ).padStart(2, "0")}${String(record4Date.getDate()).padStart(
          2,
          "0",
        )}-012345`,
        patientName: USERS.wellie.name,
        patientAvatar: USERS.wellie.avatar,
        hospitalName: "서울대학교병원",
        visitDate: formatDateKR(record4Date),
        visitTime: "11:00",
        doctor: "박민준 교수",
        memo: "정기 검진 완료, 특이사항 없음",
        isMyAppointment: true,
        dateObj: record4Date,
      },
      {
        id: 2002,
        code: "REC-2024-FAM001",
        patientName: USERS.dongseok.name,
        patientAvatar: USERS.dongseok.avatar,
        hospitalName: "바른정형외과의원",
        visitDate: formatDateKR(record5Date),
        visitTime: "15:30",
        doctor: "최재활 원장",
        memo: "아빠 물리치료 예약",
        isMyAppointment: false,
        dateObj: record5Date,
      },
      // ⭐ 리뷰 미작성 진료 예시
      {
        id: 3001,
        code: `${record6Date.getFullYear()}${String(
          record6Date.getMonth() + 1,
        ).padStart(2, "0")}${String(record6Date.getDate()).padStart(
          2,
          "0",
        )}-000777`,
        patientName: USERS.wellie.name,
        patientAvatar: USERS.wellie.avatar,
        hospitalName: "행복이비인후과",
        visitDate: formatDateKR(record6Date),
        visitTime: "09:20",
        doctor: "이청력 원장",
        memo: "봄철 알레르기 증상 확인, 약 처방 받음",
        isMyAppointment: true,
        dateObj: record6Date,
      },
    ];

    const allRecordsWithDateObj = [
      ...MOCK_MEDICAL_RECORDS,
      ...additionalRecords,
    ];

    return allRecordsWithDateObj
      .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
      .map(({ dateObj, ...rest }) => rest);
  });

  // 작성한 리뷰 목록 state
  const [myReviews, setMyReviews] =
    useState<Review[]>(initialMyReviews);

  // 샘플 리뷰 데이터 (다른 사용자들)
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
      // (여기 기존 긴 템플릿들 그대로 — 생략 없이 유지)
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["친절해요", "꼼꼼해요", "시설이 깨끗해요"],
        text: "물리치료 받으러 갔는데 선생님들이 너무 친절하고 시설도 깨끗해요. 재활 운동 방법도 자세히 알려주셔서 좋았습니다.",
        visitType: "첫방문" as const,
        likes: 12,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["회복이 빨라요", "과잉진료가 없어요"],
        text: "허리 디스크로 방문했는데 필요한 치료만 해주셔서 좋았어요. 과잉진료 없이 정직하게 진료해주십니다.",
        visitType: "재방문" as const,
        likes: 8,
      },
      // ... 👇 아래 나머지 템플릿들 전부 기존 코드 그대로 유지
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["대기시간이 짧아요", "친절해요", "과잉진료가 없어요"],
        text: "만성 질환 관리 받고 있는데 대기 시간도 짧고 원장님도 항상 친절하세요. 과잉 진료 없이 꼭 필요한 것만 처방해주셔서 좋아요.",
        visitType: "재방문" as const,
        likes: 16,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["친절해요", "꼼꼼해요", "시설이 깨끗해요"],
        text: "알레르기 검사 받으러 갔는데 원장님이 정말 친절하고 꼼꼼하게 설명해주셨어요. 병원도 깨끗하고 추천합니다!",
        visitType: "첫방문" as const,
        likes: 13,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 4,
        keywords: ["친절해요", "과잉진료가 없어요"],
        text: "소화불량으로 방문했는데 원장님이 친절하게 진료해주셨어요. 과잉 처방 없이 필요한 약만 처방해주셔서 좋았습니다.",
        visitType: "첫방문" as const,
        likes: 8,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["꼼꼼해요", "시설이 깨끗해요", "대기시간이 짧아요"],
        text: "당뇨 관리 받고 있는데 원장님이 매번 꼼꼼하게 봐주세요. 대기 시간도 짧고 시설도 깨끗합니다.",
        visitType: "재방문" as const,
        likes: 12,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["친절해요", "회복이 빨라요", "꼼꼼해요"],
        text: "장염으로 방문했는데 원장님이 정말 꼼꼼하게 진료해주셔서 빠르게 회복했어요. 직원분들도 모두 친절하십니다.",
        visitType: "첫방문" as const,
        likes: 10,
      },
      {
        hospitalId: 1,
        hospitalName: "매일건강의원",
        rating: 5,
        keywords: ["시설이 깨끗해요", "친절해요", "과잉진료가 없어요"],
        text: "고혈압 정기 검진 받는데 원장님이 항상 친절하고 꼭 필요한 검사만 권유하세요. 병원도 깨끗하고 만족합니다.",
        visitType: "재방문" as const,
        likes: 15,
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

  // 병원별 리뷰 개수
  const getHospitalReviewCount = (hospitalId: number): number => {
    const sampleCount = sampleReviews.filter(
      (review) => review.hospitalId === hospitalId,
    ).length;
    const userCount = myReviews.filter(
      (review) => review.hospitalId === hospitalId,
    ).length;
    return sampleCount + userCount;
  };

  // 병원별 평균 별점
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

  // 병원별 키워드 통계
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

  // 리뷰 삭제
  const handleDeleteReview = (reviewId: number) => {
    setMyReviews(myReviews.filter((review) => review.id !== reviewId));
  };

  // 도움돼요 토글
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

  // 진료내역에서 선택한 기록
  const [selectedMedicalRecord, setSelectedMedicalRecord] =
    useState<{
      id: number;
      hospitalName: string;
      visitDate: string;
      visitTime: string;
    } | null>(null);

  // 커뮤니티 포스트
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8ed8c?w=800&q=80",
      badge: "🏃 아침 러닝",
      userAvatar: USERS.dongseok.avatar,
      caption: "챌린지 시작!",
      userName: USERS.dongseok.name,
      textOverlay: "오전 조깅으로 상쾌하게!",
      createdAt: "2025-10-14",
      comments: [
        {
          userName: USERS.seunghee.name,
          userAvatar: USERS.seunghee.avatar,
          text: "멋져요! 저도 함께할게요 💪",
          timestamp: "5분 전",
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
          ],
        },
      ],
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      badge: "🧘‍♀️ 요가",
      userAvatar: USERS.seunghee.avatar,
      caption: "요가 수업",
      userName: USERS.seunghee.name,
      textOverlay: "몸과 마음을 편안하게",
      createdAt: "2025-10-15",
      comments: [],
      reactions: [],
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      badge: "💪 헬스",
      userAvatar: USERS.dongseok.avatar,
      caption: "웨이트 트레이닝",
      userName: USERS.dongseok.name,
      textOverlay: "챌린지 완료!",
      createdAt: "2025-10-16",
      comments: [],
      reactions: [],
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      badge: "💪 운동 완료",
      userAvatar: USERS.dongseok.avatar,
      caption: "헬스장에서",
      userName: USERS.dongseok.name,
      textOverlay: "오늘도 열심히!",
      createdAt: "2025-11-3",
      comments: [],
      reactions: [],
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&q=80",
      badge: "🏃 러닝 완료",
      userAvatar: USERS.dongseok.avatar,
      caption: "공원에서 조깅",
      userName: USERS.dongseok.name,
      textOverlay: "5km 완주!",
      createdAt: "2025-11-7",
      comments: [],
      reactions: [],
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      badge: "🧘‍♀️ 요가 완료",
      userAvatar: USERS.seunghee.avatar,
      caption: "저녁 요가",
      userName: USERS.seunghee.name,
      textOverlay: "몸과 마음을 정리하는 시간",
      createdAt: "2025-11-13",
      comments: [],
      reactions: [],
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8ed8c?w=800&q=80",
      badge: "🏆 챌린지 시작",
      userAvatar: USERS.wellie.avatar,
      caption: "새로운 챌린지 시작!",
      userName: USERS.wellie.name,
      textOverlay: "주 3회 운동하기",
      createdAt: "2025-11-16",
      comments: [],
      reactions: [],
    },
    {
      id: 8,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      badge: "🏋️ 웨이트 트레이닝",
      userAvatar: USERS.dongseok.avatar,
      caption: "챌린지 4일차",
      userName: USERS.dongseok.name,
      textOverlay: "스쿼트 100개!",
      createdAt: "2025-11-19",
      comments: [],
      reactions: [],
    },
    {
      id: 9,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      badge: "🏆 챌린지 완료",
      userAvatar: USERS.dongseok.avatar,
      caption: "챌린지 7일차 완료!",
      userName: USERS.dongseok.name,
      textOverlay: "마지막 날도 성공!",
      createdAt: "2025-11-22",
      comments: [],
      reactions: [],
    },
    {
      id: 10,
      image:
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
      badge: "🥗 식단 챌린지",
      userAvatar: USERS.wellie.avatar,
      caption: "새로운 챌린지 시작!",
      userName: USERS.wellie.name,
      textOverlay: "건강한 식단 3일",
      createdAt: "2025-11-23",
      comments: [],
      reactions: [],
    },
    {
      id: 11,
      image:
        "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80",
      badge: "🥗 건강한 식단",
      userAvatar: USERS.wellie.avatar,
      caption: "식단 챌린지 완료!",
      userName: USERS.wellie.name,
      textOverlay: "3일 완주했어요!",
      createdAt: "2025-11-25",
      comments: [],
      reactions: [],
    },
  ]);

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
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1
      }-${today.getDate()}`;

    const post: Post = {
      ...newPost,
      id: Math.max(0, ...posts.map((p) => p.id)) + 1,
      userName: userName,
      userAvatar: userAvatar,
      createdAt: newPost.createdAt || dateStr,
    };
    setPosts([post, ...posts]);
    navigateTo("community");
  };

  const toggleFavorite = (hospital: any) => {
    const isFavorite = favoriteHospitals.some(
      (h) => h.id === hospital.id,
    );
    if (isFavorite) {
      setFavoriteHospitals(
        favoriteHospitals.filter((h) => h.id !== hospital.id),
      );
    } else {
      setFavoriteHospitals([...favoriteHospitals, hospital]);
    }
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
            onNotificationClick={() => {
              setPreviousPage("community");
              navigateTo("notifications");
            }}
            onDeletePost={handleDeletePost}
            initialPostId={selectedPostId || undefined}
            posts={posts}
            currentUserName={userName}
            currentUserAvatar={userAvatar}
            currentPage="community"
            onPageChange={(page) => {
              setSelectedPostId(null);
              navigateTo(page as Page);
            }}
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
          />
        )}

        {currentPage === "my-reviews" && (
          <MyReviewsPage
            onBack={navigateBack}
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
