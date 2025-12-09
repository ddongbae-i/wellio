// src/components/hospitalInfo.ts

import hos1 from "../assets/images/hos1.png";
import hos2 from "../assets/images/hos2.png";
import hos3 from "../assets/images/hos3.png";
import hos4 from "../assets/images/hos4.png";
import hos5 from "../assets/images/hos5.png";
import hos6 from "../assets/images/hos6.png";
import hos7 from "../assets/images/hos7.png";
import hos8 from "../assets/images/hos8.png";
import hos9 from "../assets/images/hos9.png";
import hos10 from "../assets/images/hos10.png";

export type TodayStatus = "open" | "closed" | "break";

export interface Hospital {
  id: number;
  name: string;
  specialtyText: string;
  department?: string; 
  hours: string;
  distance: string;
  address: string;
  todayStatus: TodayStatus;
  rating: number;
  reviews: number;
  imageUrl: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export const hospitalList: Hospital[] = [
{
  id: 1,
  name: "매일건강의원",
  specialtyText: "가정의학과 전문의 2명",
  department: "가정의학과",  // 추가
  hours: "10:00-20:00",
  distance: "37m",
  address: "서울 서초구 서초대로 59번길 19, 201호",
  todayStatus: "open",
  rating: 4.8,
  reviews: 223,
  imageUrl: hos1,
  latitude: 37.50392,
  longitude: 127.02531,  // 추가
  phone: "02-1234-5678", // 있으면 추가
},
  {
    id: 2,
    name: "365클리닉 강남본점",
    specialtyText: "피부과 전문의 3명",
    hours: "09:30-20:30",
    distance: "58m",
    address: "서울 서초구 서초대로 16가길, 3층",
    todayStatus: "open",
    rating: 4.6,
    reviews: 12,
    imageUrl: hos2,
  },
  {
    id: 3,
    name: "사랑니쏙쏙 강남본점",
    specialtyText: "치과 전문의 1명",
    hours: "10:00-18:00",
    distance: "167m",
    address: "서울 서초구 강남대로 102",
    todayStatus: "open",
    rating: 4.7,
    reviews: 41,
    imageUrl: hos3,
  },
  {
    id: 4,
    name: "강남예쁜이치과의원",
    specialtyText: "치과 전문의 3명",
    hours: "10:00-20:00",
    distance: "209m",
    address: "서울 서초구 강남대로 222, 10층",
    todayStatus: "open",
    rating: 4.4,
    reviews: 56,
    imageUrl: hos4,
  },
  {
    id: 5,
    name: "늘행복한의원",
    specialtyText: "가정의학과 전문의 1명",
    hours: "09:00-19:00",
    distance: "255m",
    address: "서울 서초구 서초동 강남대로 402, 5층",
    todayStatus: "break",
    rating: 4.7,
    reviews: 22,
    imageUrl: hos5,
  },
  {
    id: 6,
    name: "비타민의원",
    specialtyText: "피부과 전문의 1명",
    hours: "10:00-20:00",
    distance: "311m",
    address: "서울 서초구 서초동 강남대로 1025",
    todayStatus: "open",
    rating: 5.0,
    reviews: 3,
    imageUrl: hos6,
  },
  {
    id: 7,
    name: "밝은내일 정신건강의학과의원",
    specialtyText: "정신건강의학과 전문의 2명",
    hours: "매주 목요일 휴무",
    distance: "209m",
    address: "서울 서초구 강남대로 222, 10층",
    todayStatus: "closed",
    rating: 4.4,
    reviews: 56,
    imageUrl: hos7,
  },
  {
    id: 8,
    name: "바른정형외과의원",
    specialtyText: "정형외과 전문의 6명",
    hours: "09:30-19:00",
    distance: "209m",
    address: "서울 서초구 서초대로 75번길 25, 1-5층 ",
    todayStatus: "open",
    rating: 4.7,
    reviews: 1253,
    imageUrl: hos8,
  },
  {
    id: 9,
    name: "고운피부과",
    specialtyText: "피부과 전문의 2명",
    hours: "09:00-18:00",
    distance: "209m",
    address: "서울 서초구 강남대로 222, 10층",
    todayStatus: "open",
    rating: 4.4,
    reviews: 56,
    imageUrl: hos9,
  },
  {
    id: 10,
    name: "오늘도강한내과의원",
    specialtyText: "내과 전문의 1명",
    hours: "여름 휴가",
    distance: "209m",
    address: "서울 서초구 강남대로 161, 335호 ",
    todayStatus: "closed",
    rating: 5.0,
    reviews: 240,
    imageUrl: hos10,
  },
];

// 🔥 id → 병원 객체 매핑
export const hospitalMap = hospitalList.reduce(
  (acc, hospital) => {
    acc[hospital.id] = hospital;
    return acc;
  },
  {} as Record<number, Hospital>,
);
