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
import { Toaster } from "sonner@2.0.3"; // 👈 Toaster import

type Page = "home" | "community" | "hospital" | "profile" | "hospital-detail" | "upload" | "medical-history" | "my-reviews" | "favorite-hospitals" | "notifications" | "write-review" | "hospital-reviews" | "calendar";

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
  likedBy: string[]; // 좋아요 누른 사용자 목록
  visitType?: "첫방문" | "재방문";
}

export default function App() {
  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 온보딩 상태 관리
  const [showOnboarding, setShowOnboarding] = useState(false);
  // 로그인 플로우 상태: 'welcome' | 'social' | 'email'
  const [loginStep, setLoginStep] = useState<'welcome' | 'social' | 'email'>('welcome');
  const [userName, setUserName] = useState("관리자");
  // 사용자 프로필 이미지 관리 (없으면 기본 이미지)
  const [userAvatar, setUserAvatar] = useState("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80");
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  
  // 날짜 생성 헬퍼 함수 (현재 날짜 기준으로 랜덤하게 이전 날짜 생성)
  const getRandomPastDate = (maxDaysAgo: number = 365): Date => {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * maxDaysAgo);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };
  
  const formatDateKR = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };
  
  const formatDateISO = (date: Date): string => {
    return date.toISOString();
  };
  
  // 👇 네비게이션 히스토리 추가
  const [navigationHistory, setNavigationHistory] = useState<Page[]>(["home"]);
  
  // 수정할 리뷰 저장
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  // 알림 페이지에서 돌아갈 페이지 추적
  const [previousPage, setPreviousPage] = useState<Page>("home");
  
  // 👇 네비게이션 함수 추가
  const navigateTo = (page: Page) => {
    // 현재 페이지와 같은 페이지로 이동하려고 하면 무시
    if (currentPage === page) return;
    
    setNavigationHistory(prev => [...prev, page]);
    setCurrentPage(page);
  };
  
  const navigateBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // 현재 페이지 제거
      const previousPage = newHistory[newHistory.length - 1] || "home";
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      // 히스토리가 없으면 홈으로
      setNavigationHistory(["home"]);
      setCurrentPage("home");
    }
  };
  
  // 찜한 병원 목록 관리
  const [favoriteHospitals, setFavoriteHospitals] = useState<Hospital[]>([
    {
      id: 1,
      name: "매일건강의원",
      department: "가정의학과",
      specialtyText: "가정의학과와 전문의 2명",
      address: "서울 서초구 서초대로 59번길 19, 201호",
      phone: "02-1234-5678",
      hours: "10:00-20:00",
      distance: "37m",
      description: "환자 중심의 진료를 제공하는 가정의학과 전문 병원입니다. 만성질환 관리부터 건강검진까지 종합적인 의료 서비스를 제공합니다.",
      imageUrl: "https://images.unsplash.com/photo-1580281658136-17c835359e86?w=100&h=100&fit=crop",
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
      description: "최신 피부과 시술 장비를 갖춘 전문 클리닉입니다. 여드름, 미백, 안티에이징 등 다양한 피부 치료를 제공합니다.",
      imageUrl: "https://via.placeholder.com/100x100/E7F3FF/2F80ED?text=Logo",
      latitude: 37.4950,
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
      description: "사랑니 발치 전문 치과입니다. 통증 최소화와 빠른 회복을 위한 최신 시술 방법을 사용합니다.",
      imageUrl: "https://via.placeholder.com/100x100/E8F8F7/00C2B3?text=Logo",
      latitude: 37.4955,
      longitude: 127.0290,
      isAvailableNow: true,
      rating: 4.7,
      reviews: 41,
    },
  ]);
  
  // 작성한 리뷰 목록을 먼저 정의 (다른 state들이 이를 참조)
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
        reviewText: "아빠 감기몸살로 내원했는데 원장님이 정말 친절하게 진료해주셨어요. 과잉진료 없이 필요한 것만 처방해주셔서 좋았습니다.",
        userName: "관리자",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
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
        reviewText: "피부과 시술 받았는데 시설도 깨끗하고 직원분들도 친절하세요. 최신 장비로 시술해서 만족스러웠습니다.",
        userName: "관리자",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
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
        reviewText: "사랑니 발치했는데 원장님이 꼼꼼하게 설명해주시고 통증도 거의 없었어요. 대기시간도 짧아서 좋았습니다.",
        userName: "관리자",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        createdAt: formatDateISO(review3Date),
        visitType: "첫방문" as const,
        likes: 0,
        likedBy: [],
        dateObj: review3Date,
      },
    ];
    
    return reviews.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).map(({dateObj, ...rest}) => rest);
  })();
  
  // 리뷰 작성한 병원 ID 목록 관리 - initialMyReviews 기반으로 생성
  const [reviewedHospitals, setReviewedHospitals] = useState<number[]>(
    initialMyReviews.map(review => review.id)
  );
  
  // 진료내역 데이터 관리 - initialMyReviews 기반으로 생성
  const [medicalRecords, setMedicalRecords] = useState(() => {
    const record4Date = getRandomPastDate(30);  // 리뷰 미작성 진료내역
    const record5Date = getRandomPastDate(200); // 가족 진료내역
    
    // initialMyReviews를 기반으로 진료내역 생성
    const reviewBasedRecords = initialMyReviews.map((review, index) => ({
      id: review.id,
      code: `${new Date(review.createdAt).getFullYear()}${String(new Date(review.createdAt).getMonth() + 1).padStart(2, '0')}${String(new Date(review.createdAt).getDate()).padStart(2, '0')}-${String(index + 1).padStart(6, '0')}`,
      patientName: "관리자",
      patientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      hospitalName: review.hospitalName,
      visitDate: review.visitDate,
      visitTime: ["09:30", "14:00", "16:30"][index % 3],
      doctor: ["김건강 원장", "이의료 원장", "박진료 원장"][index % 3],
      memo: review.reviewText.substring(0, 40) + "...",
      isMyAppointment: true,
      dateObj: new Date(review.createdAt),
    }));
    
    // 추가 진료내역 (리뷰 미작성)
    const additionalRecords = [
      {
        id: 2001,
        code: `${record4Date.getFullYear()}${String(record4Date.getMonth() + 1).padStart(2, '0')}${String(record4Date.getDate()).padStart(2, '0')}-012345`,
        patientName: "관리자",
        patientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
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
        patientName: "김웰리",
        patientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        hospitalName: "바른정형외과의원",
        visitDate: formatDateKR(record5Date),
        visitTime: "15:30",
        doctor: "최재활 원장",
        memo: "엄마 물리치료 예약",
        isMyAppointment: false,
        dateObj: record5Date,
      },
    ];
    
    const allRecords = [...reviewBasedRecords, ...additionalRecords];
    
    // 날짜 최신순으로 정렬
    return allRecords.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).map(({dateObj, ...rest}) => rest);
  });
  
  // 작성한 리뷰 목록 state - initialMyReviews로 초기화
  const [myReviews, setMyReviews] = useState<Review[]>(initialMyReviews);

  // 샘플 리뷰 데이터 (다른 사용자들의 리뷰) - state로 관리
  const [sampleReviews, setSampleReviews] = useState<Review[]>(() => {
    // 병원별 랜덤 날짜 생성
    const r1001Date = getRandomPastDate(60);
    const r1002Date = getRandomPastDate(90);
    const r1003Date = getRandomPastDate(110);
    const r1004Date = getRandomPastDate(140);
    const r1005Date = getRandomPastDate(160);
    const r1006Date = getRandomPastDate(190);
    const r1007Date = getRandomPastDate(30);
    const r1008Date = getRandomPastDate(60);
    const r1009Date = getRandomPastDate(90);
    const r1010Date = getRandomPastDate(110);
    const r1011Date = getRandomPastDate(140);
    const r1012Date = getRandomPastDate(170);
    const r1013Date = getRandomPastDate(25);
    const r1014Date = getRandomPastDate(50);
    const r1015Date = getRandomPastDate(75);
    const r1016Date = getRandomPastDate(100);
    const r1017Date = getRandomPastDate(130);
    const r1018Date = getRandomPastDate(160);
    
    return [
      // 병원 ID 1: 바른정형외과의원 (6개 리뷰)
      {
        id: 1001,
        hospitalId: 1,
        hospitalName: "바른정형외과의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(r1001Date),
        rating: 5,
        keywords: ["친절해요", "꼼꼼해요", "시설이 깨끗해요"],
        reviewText: "물리치료 받으러 갔는데 선생님들이 너무 친절하고 시설도 깨끗해요. 재활 운동 방법도 자세히 알려주셔서 좋았습니다.",
        userName: "이지은",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        createdAt: formatDateISO(r1001Date),
        visitType: "첫방문",
        likes: 12,
        likedBy: ["김건강", "활력"],
      },
      {
        id: 1002,
        hospitalId: 1,
        hospitalName: "바른정형외과의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(r1002Date),
        rating: 4,
        keywords: ["회복이 빨라요", "과잉진료가 없어요"],
        reviewText: "허리 디스크로 방문했는데 필요한 치료만 해주셔서 좋았어요. 과잉진료 없이 정직하게 진료해주십니다.",
        userName: "박준서",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        createdAt: formatDateISO(r1002Date),
        visitType: "재방문",
        likes: 8,
        likedBy: ["김건강"],
      },
      {
        id: 1003,
        hospitalId: 1,
        hospitalName: "바른정형외과의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(r1003Date),
        rating: 5,
        keywords: ["대기시간이 짧아요", "시설이 깨끗해요"],
        reviewText: "무릎 통증으로 방문했는데 대기 시간도 짧고 진료도 신속하게 받았어요. 시설이 최신식이라 좋았습니다.",
        userName: "김도현",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
        createdAt: formatDateISO(r1003Date),
        visitType: "첫방문",
        likes: 7,
        likedBy: ["김건강"],
      },
      {
        id: 1004,
        hospitalId: 1,
        hospitalName: "바른정형외과의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(r1004Date),
        rating: 5,
        keywords: ["친절해요", "회복이 빨라요", "꼼꼼해요"],
        reviewText: "교통사고 후유증 치료 받고 있는데 원장님이 정말 꼼꼼하게 봐주세요. 회복도 생각보다 빠르고 만족스럽습니다.",
        userName: "최유진",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        createdAt: formatDateISO(r1004Date),
        visitType: "재방문",
        likes: 14,
        likedBy: ["김건강", "박활력"],
      },
      {
        id: 1005,
        hospitalId: 1,
        hospitalName: "바른정형외과의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(r1005Date),
        rating: 4,
        keywords: ["과잉진료가 없어요", "친절해요"],
        reviewText: "어깨 통증 때문에 갔는데 필요한 검사만 권유하시고 과잉 진료가 전혀 없어서 좋았어요. 원장님도 친절하십니다.",
        userName: "박서준",
        userAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80",
        createdAt: formatDateISO(r1005Date),
        visitType: "첫방문",
        likes: 9,
        likedBy: ["김건강"],
      },
      {
        id: 1006,
        hospitalId: 1,
        hospitalName: "바른정형외과의원",
        hospitalImage: "https://example.com/hospital1.jpg",
        visitDate: formatDateKR(r1006Date),
        rating: 5,
        keywords: ["시설이 깨끗해요", "꼼꼼해요", "회복이 빨라요"],
        reviewText: "발목 염좌 치료 받았는데 원장님이 정말 꼼꼼하게 봐주셔서 빠르게 회복했어요. 시설도 깨끗하고 좋습니다.",
        userName: "정민지",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
        createdAt: formatDateISO(r1006Date),
        visitType: "재방문",
        likes: 11,
        likedBy: ["김건강"],
      },
      
      // 병원 ID 2: 고운피부과 (6개 리뷰)
      {
        id: 1007,
        hospitalId: 2,
        hospitalName: "고운피부과",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(r1007Date),
        rating: 5,
        keywords: ["쾌적해요", "시설이 깨끗해요", "친절해요"],
        reviewText: "레이저 시술 받았는데 정말 만족스러워요! 병원도 깨끗하고 직원분들도 친절하세요.",
        userName: "최서연",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        createdAt: formatDateISO(r1007Date),
        visitType: "첫방문",
        likes: 15,
        likedBy: ["김건강", "박활력"],
      },
      {
        id: 1008,
        hospitalId: 2,
        hospitalName: "고운피부과",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(r1008Date),
        rating: 5,
        keywords: ["꼼꼼해요", "회복이 빨라요"],
        reviewText: "여드름 흉터 치료 받고 있는데 원장님이 정말 꼼꼼하게 봐주세요. 효과도 빠르게 나타나서 만족합니다.",
        userName: "김민준",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
        createdAt: formatDateISO(r1008Date),
        visitType: "재방문",
        likes: 10,
        likedBy: ["김건강"],
      },
      {
        id: 1009,
        hospitalId: 2,
        hospitalName: "고운피부과",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(r1009Date),
        rating: 5,
        keywords: ["친절해요", "시설이 깨끗해요", "쾌적해요"],
        reviewText: "피부과 처음 가봤는데 너무 친절하시고 시술 과정도 자세히 설명해주셔서 좋았어요. 병원 분위기도 쾌적합니다.",
        userName: "이수아",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        createdAt: formatDateISO(r1009Date),
        visitType: "첫방문",
        likes: 13,
        likedBy: ["김건강"],
      },
      {
        id: 1010,
        hospitalId: 2,
        hospitalName: "고운피부과",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(r1010Date),
        rating: 4,
        keywords: ["꼼꼼해요", "과잉진료가 없어요"],
        reviewText: "기미 치료 상담 받았는데 과잉 진료 없이 필요한 것만 권유해주셔서 신뢰가 갑니다. 꼼꼼하게 상담해주셨어요.",
        userName: "박지혜",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        createdAt: formatDateISO(r1010Date),
        visitType: "첫방문",
        likes: 8,
        likedBy: ["김건강"],
      },
      {
        id: 1011,
        hospitalId: 2,
        hospitalName: "고운피부과",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(r1011Date),
        rating: 5,
        keywords: ["회복이 빨라요", "시설이 깨끗해요", "친절해요"],
        reviewText: "보톡스 시술 받았는데 회복도 빠르고 효과도 좋아요! 시설도 최신식이고 간호사님들도 친절하십니다.",
        userName: "강하늘",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        createdAt: formatDateISO(r1011Date),
        visitType: "재방문",
        likes: 16,
        likedBy: ["김건강", "박활력"],
      },
      {
        id: 1012,
        hospitalId: 2,
        hospitalName: "고운피부과",
        hospitalImage: "https://example.com/hospital2.jpg",
        visitDate: formatDateKR(r1012Date),
        rating: 5,
        keywords: ["쾌적해요", "꼼꼼해요", "친절해요"],
        reviewText: "여드름 치료 받고 있는데 원장님이 매번 꼼꼼하게 봐주세요. 병원 환경도 쾌적하고 추천합니다!",
        userName: "윤서진",
        userAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
        createdAt: formatDateISO(r1012Date),
        visitType: "재방문",
        likes: 12,
        likedBy: ["김건강"],
      },
      
      // 병원 ID 3: 오늘도강한내과의원 (6개 리뷰)
      {
        id: 1013,
        hospitalId: 3,
        hospitalName: "오늘도강한내과의원",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(r1013Date),
        rating: 5,
        keywords: ["친절해요", "꼼꼼해요", "과잉진료가 없어요"],
        reviewText: "정기검진 받으러 갔는데 원장님이 정말 친절하고 꼼꼼하게 진료해주세요. 필요한 검사만 권유하셔서 신뢰가 갑니다.",
        userName: "정하윤",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
        createdAt: formatDateISO(r1013Date),
        visitType: "재방문",
        likes: 18,
        likedBy: ["김건강", "박활력"],
      },
      {
        id: 1014,
        hospitalId: 3,
        hospitalName: "오늘도강한내과의원",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(r1014Date),
        rating: 5,
        keywords: ["친절해요", "대기시간이 짧아요"],
        reviewText: "감기 때문에 급하게 방문했는데 대기 시간도 짧고 원장님도 친절하게 진료해주셨어요. 근처에 이런 병원이 있어 다행입니다.",
        userName: "김태현",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
        createdAt: formatDateISO(r1014Date),
        visitType: "첫방문",
        likes: 9,
        likedBy: ["김건강"],
      },
      {
        id: 1015,
        hospitalId: 3,
        hospitalName: "오늘도강한내과의원",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(r1015Date),
        rating: 4,
        keywords: ["꼼꼼해요", "과잉진료가 없어요", "친절해요"],
        reviewText: "건강검진 결과 상담 받았는데 원장님이 하나하나 자세히 설명해주셔서 좋았어요. 과잉 진료 없이 정직하게 진료해주십니다.",
        userName: "송민아",
        userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
        createdAt: formatDateISO(r1015Date),
        visitType: "재방문",
        likes: 11,
        likedBy: ["김건강"],
      },
      {
        id: 1016,
        hospitalId: 3,
        hospitalName: "오늘도강한내과의원",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(r1016Date),
        rating: 5,
        keywords: ["시설이 깨끗해요", "친절해요", "꼼꼼해요"],
        reviewText: "복통으로 방문했는데 원장님이 꼼꼼하게 진찰해주시고 치료도 잘 해주셨어요. 시설도 깨끗하고 좋습니다.",
        userName: "이재민",
        userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
        createdAt: formatDateISO(r1016Date),
        visitType: "첫방문",
        likes: 14,
        likedBy: ["김건강"],
      },
      {
        id: 1017,
        hospitalId: 3,
        hospitalName: "오늘도강한내과의원",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(r1017Date),
        rating: 5,
        keywords: ["대기시간이 짧아요", "친절해요", "과잉진료가 없어요"],
        reviewText: "만성 질환 관리 받고 있는데 대기 시간도 짧고 원장님도 항상 친절하세요. 과잉 진료 없이 꼭 필요한 것만 처방해주셔서 좋아요.",
        userName: "최은영",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
        createdAt: formatDateISO(r1017Date),
        visitType: "재방문",
        likes: 16,
        likedBy: ["김건강", "박활력"],
      },
      {
        id: 1018,
        hospitalId: 3,
        hospitalName: "오늘도강한내과의원",
        hospitalImage: "https://example.com/hospital3.jpg",
        visitDate: formatDateKR(r1018Date),
        rating: 5,
        keywords: ["친절해요", "꼼꼼해요", "시설이 깨끗해요"],
        reviewText: "알레르기 검사 받으러 갔는데 원장님이 정말 친절하고 꼼꼼하게 설명해주셨어요. 병원도 깨끗하고 추천합니다!",
        userName: "박현우",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
        createdAt: formatDateISO(r1018Date),
        visitType: "첫방문",
        likes: 13,
        likedBy: ["김건강"],
      },
    ];
  });

  // 병원별 리뷰 개수를 계산하는 함수
  const getHospitalReviewCount = (hospitalId: number): number => {
    const sampleCount = sampleReviews.filter(review => review.hospitalId === hospitalId).length;
    const userCount = myReviews.filter(review => review.hospitalId === hospitalId).length;
    return sampleCount + userCount;
  };
  
  // 병원별 평균 별점을 계산하는 함수
  const getHospitalAverageRating = (hospitalId: number): number => {
    const hospitalReviews = [
      ...sampleReviews.filter(review => review.hospitalId === hospitalId),
      ...myReviews.filter(review => review.hospitalId === hospitalId)
    ];
    
    if (hospitalReviews.length === 0) return 0;
    
    const totalRating = hospitalReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / hospitalReviews.length) * 10) / 10; // 소수점 첫째자리까지
  };
  
  // 병원별 키워드 통계를 계산하는 함수
  const getHospitalKeywordStats = (hospitalId: number): Array<{ keyword: string; count: number; percentage: number }> => {
    const hospitalReviews = [
      ...sampleReviews.filter(review => review.hospitalId === hospitalId),
      ...myReviews.filter(review => review.hospitalId === hospitalId)
    ];
    
    // 모든 키워드 수집
    const keywordCount: { [key: string]: number } = {};
    hospitalReviews.forEach(review => {
      review.keywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    });
    
    // 총 리뷰 개수
    const totalReviews = hospitalReviews.length;
    
    // 키워드 통계 배열 생성 및 정렬 (개수 많은 순)
    const stats = Object.entries(keywordCount)
      .map(([keyword, count]) => ({
        keyword,
        count,
        percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    return stats;
  };
  
  // 리뷰 삭제 함수
  const handleDeleteReview = (reviewId: number) => {
    setMyReviews(myReviews.filter(review => review.id !== reviewId));
  };

  // 도움돼요 토글 함수
  const handleToggleLike = (reviewId: number) => {
    // sampleReviews에서 해당 리뷰를 찾아 업데이트
    setSampleReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const isLiked = review.likedBy.includes(userName);
          return {
            ...review,
            likes: isLiked ? review.likes - 1 : review.likes + 1,
            likedBy: isLiked
              ? review.likedBy.filter(name => name !== userName)
              : [...review.likedBy, userName]
          };
        }
        return review;
      })
    );
    
    // myReviews에서 해당 리뷰를 찾아 업데이트
    setMyReviews(prevReviews =>
      prevReviews.map(review => {
        if (review.id === reviewId) {
          const isLiked = review.likedBy.includes(userName);
          return {
            ...review,
            likes: isLiked ? review.likes - 1 : review.likes + 1,
            likedBy: isLiked
              ? review.likedBy.filter(name => name !== userName)
              : [...review.likedBy, userName]
          };
        }
        return review;
      })
    );
  };
  
  // 진료내역에서 선택한 진료 기록 관리
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<{
    id: number;
    hospitalName: string;
    visitDate: string;
    visitTime: string;
  } | null>(null);

  // 커뮤니티 포스트 state
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
      badge: "🏆 주 1회 함께 걷기",
      userAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      caption: "챌린지 첫 시작!",
      userName: "관리자",
      textOverlay: "오늘부터 시작하는 건강한 습관!",
      comments: [
        {
          userName: "엄마",
          userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
          text: "멋져요! 저도 함께할게요 💪",
          timestamp: "5분 전"
        },
        {
          userName: "아빠",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
          text: "화이팅하세요!",
          timestamp: "2분 전"
        }
      ],
      reactions: [
        {
          emoji: "❤️",
          users: [
            {
              userName: "엄마",
              userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
            },
            {
              userName: "아빠",
              userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            }
          ]
        },
        {
          emoji: "👍",
          users: [
            {
              userName: "관리자",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
      badge: "💪 매일 운동하기",
      userAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      caption: "오늘도 달렸어요!",
      userName: "관리자",
      location: "한강공원",
      time: "오전 6:30",
      weather: "맑음 18°C",
      comments: [
        {
          userName: "엄마",
          userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
          text: "역시 대단해요! 👏",
          timestamp: "10분 전"
        }
      ],
      reactions: [
        {
          emoji: "👏",
          users: [
            {
              userName: "엄마",
              userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
            },
            {
              userName: "아빠",
              userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
      badge: "🧘‍♀️ 매일 요가",
      userAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      caption: "마음 챙기기",
      userName: "엄마",
      textOverlay: "하루를 평화롭게 시작하는 아침 요가",
      health: "혈압 120/80",
      comments: [
        {
          userName: "관리자",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "평화로운 하루 되세요 🙏",
          timestamp: "1시간 전"
        },
        {
          userName: "아빠",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
          text: "너무 좋아 보여요!",
          timestamp: "30분 전"
        }
      ],
      reactions: [
        {
          emoji: "😊",
          users: [
            {
              userName: "관리자",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            }
          ]
        },
        {
          emoji: "❤️",
          users: [
            {
              userName: "아빠",
              userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&q=80",
      badge: "🥗 건강한 식단",
      userAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      caption: "오늘의 건강 샐러드",
      userName: "엄마",
      textOverlay: "신선한 채소로 만든 사랑의 한 끼",
      time: "오후 12:30",
      comments: [
        {
          userName: "관리자",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "너무 맛있어 보여요! 😋",
          timestamp: "20분 전"
        },
        {
          userName: "아빠",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
          text: "오늘도 최고예요 👍",
          timestamp: "10분 전"
        }
      ],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: "관리자",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            },
            {
              userName: "아빠",
              userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
      badge: "🚶‍♀️ 매일 산책",
      userAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      caption: "동네 한 바퀴",
      userName: "엄마",
      location: "근린공원",
      weather: "맑음 20°C",
      health: "걸음수 8,432보",
      comments: [
        {
          userName: "아빠",
          userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
          text: "좋은 날씨네요! 🌤️",
          timestamp: "25분 전"
        }
      ],
      reactions: [
        {
          emoji: "😊",
          users: [
            {
              userName: "관리자",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            },
            {
              userName: "아빠",
              userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
      badge: "🏃‍♂️ 주 3회 러닝",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      caption: "아침 러닝 완료!",
      userName: "아빠",
      textOverlay: "5km 달리기 성공",
      location: "올림픽공원",
      time: "오전 6:00",
      weather: "맑음 15°C",
      comments: [
        {
          userName: "엄마",
          userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
          text: "수고했어요! 💪",
          timestamp: "1시간 전"
        },
        {
          userName: "관리자",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "대단하세요!",
          timestamp: "45분 전"
        }
      ],
      reactions: [
        {
          emoji: "👏",
          users: [
            {
              userName: "관리자",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            },
            {
              userName: "엄마",
              userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
            }
          ]
        },
        {
          emoji: "❤️",
          users: [
            {
              userName: "아빠",
              userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80"
            }
          ]
        }
      ]
    },
    {
      id: 7,
      image:
        "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80",
      badge: "💊 건강검진",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      caption: "정기 건강검진 다녀왔습니다",
      userName: "아빠",
      textOverlay: "건강이 최고!",
      health: "혈압 118/75, 콜레스테롤 정상",
      comments: [
        {
          userName: "엄마",
          userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
          text: "다행이네요! 😊",
          timestamp: "2시간 전"
        },
        {
          userName: "관리자",
          userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
          text: "건강 관리 잘하셨네요!",
          timestamp: "1시간 전"
        }
      ],
      reactions: [
        {
          emoji: "👍",
          users: [
            {
              userName: "엄마",
              userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80"
            },
            {
              userName: "관리자",
              userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80"
            }
          ]
        }
      ]
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

  const handleUpload = (newPost: Omit<Post, "id" | "userName" | "userAvatar">) => {
    const post: Post = {
      ...newPost,
      id: Math.max(0, ...posts.map(p => p.id)) + 1,
      userName: userName,
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    };
    setPosts([post, ...posts]); // 맨 앞에 추가
    navigateTo("community"); // 커뮤니티로 이동
  };

  // 찜한 병원 토글 함수
  const toggleFavorite = (hospital: any) => {
    const isFavorite = favoriteHospitals.some(h => h.id === hospital.id);
    if (isFavorite) {
      // 이미 찜한 병원이면 제거
      setFavoriteHospitals(favoriteHospitals.filter(h => h.id !== hospital.id));
    } else {
      // 찜하지 않은 병원이면 추가
      setFavoriteHospitals([...favoriteHospitals, hospital]);
    }
  };

  // 포스트 삭제 함수
  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  // 메모 업데이트 함수
  const handleUpdateMemo = (recordId: number, newMemo: string) => {
    setMedicalRecords(prevRecords =>
      prevRecords.map(record =>
        record.id === recordId ? { ...record, memo: newMemo } : record
      )
    );
  };

  // 프로필 이미지 업데이트 함수
  const handleUpdateAvatar = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 로그인 플로우 처리
  if (!isLoggedIn) {
    // Step 1: 환영 페이지
    if (loginStep === 'welcome') {
      return (
        <WelcomePage
          onGuestMode={() => {
            // 관리자 계정으로 둘러보기 - 온보딩 시작
            setUserName("관리자");
            setIsLoggedIn(true);
            setShowOnboarding(true);
          }}
          onSignUp={() => {
            // 다른 방법으로 시작하기 - SNS 로그인 페이지로
            setLoginStep('social');
          }}
        />
      );
    }
    
    // Step 2: SNS 로그인 페이지
    if (loginStep === 'social') {
      return (
        <SocialLoginPage
          onBack={() => setLoginStep('welcome')}
          onEmailLogin={() => setLoginStep('email')}
        />
      );
    }
    
    // Step 3: 이메일 로그인 페이지
    if (loginStep === 'email') {
      return <LoginPage onLogin={handleLogin} />;
    }
  }

  // 온보딩 화면 표시
  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={() => {
          setShowOnboarding(false);
          setCurrentPage("home");
        }}
        userName={userName}
        posts={posts}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex justify-center">
      <div className="w-full max-w-[500px] min-h-screen bg-white relative shadow-xl">
        {currentPage === "home" && (
          <HomePage
            userName={userName}
            currentPage={currentPage}
            onPageChange={(page) => {
              if (page === "notifications") {
                setPreviousPage("home");
              }
              navigateTo(page as Page);
            }}
            onHospitalClick={handleHospitalClick}
            getHospitalReviewCount={getHospitalReviewCount}
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
            averageRating={getHospitalAverageRating(selectedHospital.id)}
            keywordStats={getHospitalKeywordStats(selectedHospital.id)}
            onToggleLike={handleToggleLike}
            currentUserName={userName}
            previewReviews={[
              // 샘플 리뷰 먼저
              ...sampleReviews
                .filter(review => review.hospitalId === selectedHospital.id)
                .map(review => ({
                  id: `sample-${review.id}`,
                  author: review.userName,
                  date: review.visitDate,
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked: review.likedBy?.includes(userName) || false, // 사용자가 좋아요를 눌렀는지 확인
                  visitType: review.visitType || "첫방문", // visitType 추가
                  originalId: review.id,
                })),
              // 사용자가 작성한 리뷰 추가
              ...myReviews
                .filter(review => review.hospitalId === selectedHospital.id)
                .map(review => ({
                  id: `user-${review.id}`,
                  author: review.userName,
                  date: new Date(review.createdAt).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                  }).replace(/\. /g, '.').replace(/\.$/, ''),
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked: review.likedBy?.includes(userName) || false, // 사용자가 좋아요를 눌렀는지 확인
                  visitType: review.visitType || "첫방문", // visitType 추가
                  originalId: review.id,
                }))
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
            posts={posts}
            currentUserName={userName}
            currentUserAvatar={userAvatar}
            // 👇 아래 두 줄 추가
            currentPage="community"
            onPageChange={(page) => navigateTo(page as Page)}
          />
        )}
        {/* 👇 3. '준비중' 텍스트 대신 ProfilePage 컴포넌트로 교체 */}
        {currentPage === "profile" && (
          <ProfilePage
            userName={userName}
            userAvatar={userAvatar} // 👈 프로필 이미지 전달
            currentPage={currentPage}
            onPageChange={(page) => navigateTo(page as Page)}
            onBack={navigateBack} // '뒤로가기' 누르면 이전 페이지로
            onMyReviewsClick={() => navigateTo("my-reviews")}
            onFavoriteHospitalsClick={() => navigateTo("favorite-hospitals")}
            myReviewsCount={myReviews.length} // 👈 리뷰 개수 전달
          />
        )}
        {/* 👇 4. '업로드' 페이지 추가 */}
        {currentPage === "upload" && (
          <UploadPage
            onBack={navigateBack}
            onUpload={handleUpload}
          />
        )}
        {/* 👇 5. '의료기록' 페이지 추가 */}
        {currentPage === "medical-history" && (
          <MedicalHistoryPage
            onBack={navigateBack}
            onWriteReview={(record) => {
              // 선택한 진료 기록 저장
              setSelectedMedicalRecord({
                id: record.id,
                hospitalName: record.hospitalName,
                visitDate: record.visitDate,
                visitTime: record.visitTime,
              });
              // 리뷰 작성 페이지로 이동
              navigateTo("write-review");
            }}
            reviewedHospitals={reviewedHospitals}
            onViewReviews={() => navigateTo("my-reviews")}
            records={medicalRecords}
            onUpdateMemo={handleUpdateMemo}
          />
        )}
        {/* 👇 6. '내 리뷰' 페이지 추가 */}
        {currentPage === "my-reviews" && (
          <MyReviewsPage
            onBack={navigateBack}
            reviews={myReviews}
            onDeleteReview={handleDeleteReview}
            onEditReview={(review) => {
              // 수정할 리뷰 정보를 저장하고 리뷰 작성 페이지로 이동
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
        {/* 👇 7. '즐겨찾는 병원' 페이지 추가 */}
        {currentPage === "favorite-hospitals" && (
          <FavoriteHospitalsPage
            onBack={navigateBack}
            favoriteHospitals={favoriteHospitals}
            onToggleFavorite={toggleFavorite}
            getHospitalReviewCount={getHospitalReviewCount}
          />
        )}
        {/* 👇 8. '알림' 페이지 추가 */}
        {currentPage === "notifications" && (
          <NotificationPage
            onBack={navigateBack}
          />
        )}
        {/* 👇 9. '리뷰 작성' 페이지 추가 */}
        {currentPage === "write-review" && selectedMedicalRecord && (
          <ReviewWritePage
            onBack={() => {
              // 뒤로가기 시 수정 모드 해제하고 이전 페이지로
              setEditingReview(null);
              navigateBack();
            }}
            onComplete={(reviewData: Omit<Review, "id" | "createdAt">) => {
              if (editingReview) {
                // 기존 리뷰 수정
                setMyReviews(prevReviews =>
                  prevReviews.map(review =>
                    review.id === editingReview.id
                      ? {
                          ...review,
                          rating: reviewData.rating,
                          keywords: reviewData.keywords,
                          reviewText: reviewData.reviewText,
                          visitType: reviewData.visitType,
                        }
                      : review
                  )
                );
                setEditingReview(null); // 수정 모드 해제
              } else {
                // 새로운 리뷰 생성
                const newReview: Review = {
                  ...reviewData,
                  id: myReviews.length + 1,
                  createdAt: new Date().toISOString(),
                };
                // 리뷰 목록에 추가
                setMyReviews([newReview, ...myReviews]);
                // 리뷰 작성한 병원 ID 추가
                setReviewedHospitals([...reviewedHospitals, reviewData.hospitalId]);
              }
              // 나의후기 페이지로 이동
              navigateTo("my-reviews");
            }}
            userName={userName}
            hospitalName={selectedMedicalRecord.hospitalName}
            visitDate={`${selectedMedicalRecord.visitDate} ${selectedMedicalRecord.visitTime}`}
            hospitalId={selectedMedicalRecord.id}
            editingReview={editingReview}
          />
        )}
        {/* 👇 10. '병원 리뷰' 페이지 추가 */}
        {currentPage === "hospital-reviews" && selectedHospital && (
          <HospitalReviewsPage
            onBack={navigateBack}
            hospitalName={selectedHospital.name}
            keywordStats={getHospitalKeywordStats(selectedHospital.id)}
            onToggleLike={handleToggleLike}
            currentUserName={userName}
            reviews={[
              // 샘플 리뷰 먼저
              ...sampleReviews
                .filter(review => review.hospitalId === selectedHospital.id)
                .map(review => ({
                  id: `sample-${review.id}`,
                  author: review.userName,
                  date: review.visitDate,
                  visitType: review.visitType || "첫방문",
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked: review.likedBy?.includes(userName) || false,
                  originalId: review.id,
                })),
              // 내 리뷰 추가
              ...myReviews
                .filter(review => review.hospitalId === selectedHospital.id)
                .map(review => ({
                  id: `user-${review.id}`,
                  author: review.userName,
                  date: review.visitDate,
                  visitType: review.visitType || "첫방문",
                  rating: review.rating,
                  tags: review.keywords,
                  content: review.reviewText,
                  likes: review.likes || 0,
                  liked: review.likedBy?.includes(userName) || false,
                  originalId: review.id,
                }))
            ].sort((a, b) => {
              // 날짜 문자열을 Date 객체로 변환하여 비교 (YYYY.MM.DD 형식)
              const dateA = new Date(a.date.replace(/\./g, '-'));
              const dateB = new Date(b.date.replace(/\./g, '-'));
              return dateB.getTime() - dateA.getTime();
            })}
          />
        )}
        {/* 👇 11. '캘린더' 페이지 추가 */}
        {currentPage === "calendar" && (
          <CalendarPage onBack={navigateBack} />
        )}
      </div>
      {/* 👇 Toaster 추가 - 화면 하단에 토스트 메시지 표시 */}
      <Toaster position="bottom-center" />
    </div>
  );
}