import HomeOn from "../assets/images/icon_home_on.svg";
import HomeOff from "../assets/images/icon_home_off.svg";

import ComOn from "../assets/images/icon_com_on.svg";
import ComOff from "../assets/images/icon_com_off.svg";

import ListOn from "../assets/images/icon_list_on.svg";
import ListOff from "../assets/images/icon_list_off.svg";

import MyOn from "../assets/images/icon_my_on.svg";
import MyOff from "../assets/images/icon_my_off.svg";
import type { Page } from "../types/page";

interface BottomNavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}


export function BottomNav({
  currentPage,
  onPageChange,
}: BottomNavProps) {
  const navItems = [
    { label: "홈", page: "home" as const, on: HomeOn, off: HomeOff },
    { label: "커뮤니티", page: "community" as const, on: ComOn, off: ComOff },
    { label: "진료내역", page: "medical-history" as const, on: ListOn, off: ListOff },
    { label: "내정보", page: "profile" as const, on: MyOn, off: MyOff },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)] rounded-t-[16px] bg-white max-w-[500px]">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item, index) => {
          const isActive = currentPage === item.page;

          return (
            <button
              key={index}
              onClick={() => onPageChange(item.page)}
              className={`flex flex-col items-center mt-3 gap-1 transition-colors ${isActive ? "text-[#2ECACA]" : "text-[#aeaeae]"
                }`}
            >
              <img
                src={isActive ? item.on : item.off}
                alt={item.label}
                className="w-6 h-6 object-contain"
              />
              <span className="text-[12px] font-normal">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
