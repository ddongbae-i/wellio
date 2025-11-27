import { Home, Users, Calendar, User, ClipboardList } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onPageChange: (
    page: "home" | "community" | "hospital" | "profile" | "medical-history",
  ) => void;
}

export function BottomNav({
  currentPage,
  onPageChange,
}: BottomNavProps) {
  const navItems = [
    { icon: Home, label: "홈", page: "home" as const },
    {
      icon: Users,
      label: "커뮤니티",
      page: "community" as const,
    },
    {
      icon: ClipboardList,
      label: "진료내역",
      page: "medical-history" as const,
    },
    { icon: User, label: "내정보", page: "profile" as const },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)] rounded-t-[16px] bg-white max-w-[500px]">
      <div className="grid grid-cols-4 h-20">
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => onPageChange(item.page)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentPage === item.page
                ? "text-[#36D2C5]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}