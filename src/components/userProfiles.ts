// src/components/userProfiles.ts

import Na from "../assets/images/my_na.png";
import Mama from "../assets/images/mama.png";
import Papa from "../assets/images/papa.png";

export type PatientId = "kim-welly" | "park-sw" | "kim-ds";

export interface PatientProfile {
  id: PatientId;
  name: string;
  avatar: string;
  isAdmin?: boolean; // 김웰리 어드민 표시용
}

export const patientMap: Record<PatientId, PatientProfile> = {
  "kim-welly": {
    id: "kim-welly",
    name: "김웰리",
    avatar: Na,
    isAdmin: true, // ✅ 현재 계정 주인
  },
  "park-sw": {
    id: "park-sw",
    name: "박승희",
    avatar: Mama,
  },
  "kim-ds": {
    id: "kim-ds",
    name: "김동석",
    avatar: Papa,
  },
};

// 필요하면 배열로도 쓸 수 있게
export const patientList = Object.values(patientMap);
