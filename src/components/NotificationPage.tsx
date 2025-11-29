"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import { Variants } from "framer-motion";
import IconHospital from "../assets/images/icon_alarm_hos.svg";
import IconFamily from "../assets/images/icon_alarm_fam.svg";
import IconMedicine from "../assets/images/icon_alarm_medecine.svg";
import IconChallenge from "../assets/images/icon_alarm_chall.svg";

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  }),
  exit: {
    opacity: 0,
    x: -300,
    transition: { duration: 0.2 },
  },
};

// --- [타입 정의] ---
interface Notification {
  id: number;
  type: "hospital" | "family" | "medicine" | "challenge" /* | "community" */;
  category: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationPageProps {
  onBack: () => void;
  notifications: Notification[];                 // 🔹 부모에서 내려줌
  onDeleteNotification: (id: number) => void;    // 🔹 삭제 콜백
  onMarkAsRead: (id: number) => void;            // 🔹 읽음 처리 콜백
}

export function NotificationPage({
  onBack,
  notifications,         // ✅ props
  onDeleteNotification,   // ✅ props
  onMarkAsRead,           // ✅ props
}: NotificationPageProps) {
  // 모달 상태만 로컬에서 관리
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<number | null>(null);

  // --- [이벤트 핸들러] ---
  const handleNotificationClick = (id: number) => {
    onMarkAsRead(id);  // ✅ 부모에게 "읽음 처리" 요청
  };

  const handleDragEnd = (
    event: any,
    info: any,
    notificationId: number,
  ) => {
    if (info.offset.x < -100) {
      setNotificationToDelete(notificationId);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete != null) {
      onDeleteNotification(notificationToDelete);   // ✅ 부모에게 삭제 요청
    }
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  // --- [UI 헬퍼 함수] ---
  const getIconAndColor = (type: string) => {
    switch (type) {
      case "hospital":
        return { icon: IconHospital };

      case "family":
        return { icon: IconFamily };

      case "medicine":
        return { icon: IconMedicine };

      case "challenge":
        return { icon: IconChallenge };

      // case "community":
      //   return { icon: IconCommunity };

      default:
        return { icon: IconHospital };

    }
  };
  const formatMessage = (message: string) => {
    const parts = message.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold">{part.replace(/\*\*/g, "")}</strong>;
      }
      return part;
    });
  };

  // --- [화면 렌더링] ---
  return (
    <div className="min-h-screen bg-[#f7f7f7] max-w-[500px] mx-auto">
      {/* 헤더 */}
      <div className="px-5 xs:px-6 sm:px-8 py-4 flex items-center justify-center sticky top-0  bg-[#f7f7f7]/80 backdrop-blur-xs relative z-40 min-h-[80px]">
        <button
          onClick={onBack}
          className="absolute left-4 xs:left-6 sm:left-8 text-[#555] hover:text-[#333] transition-colors cursor-pointer"
        >
          <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
        </button>
        <h1 className="text-[19px] font-semibold text-[#202020]">
          알림
        </h1>
      </div>

      {/* 알림 리스트 영역 */}
      <div className="p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification, index) => {
            const { icon } = getIconAndColor(notification.type);

            return (
              <motion.div
                key={notification.id}
                layout
                custom={index}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={itemVariants}
                className="relative"
              >
                {/* 뒤 배경 */}
                <div className="absolute inset-0.5 flex items-center justify-end pr-6 rounded-xl z-0">
                  <Trash2 size={24} className="text-gray-400" />
                </div>

                {/* 실제 카드 */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(event, info) =>
                    handleDragEnd(event, info, notification.id)
                  }
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`${notification.isRead ? "bg-white" : "bg-[#E2F7F7]"
                    } relative z-10 rounded-[8px] p-4 shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] flex items-start gap-4 cursor-pointer transition-shadow hover:shadow-[0_4px_6px_0_rgba(201,208,216,0.25)]`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"

                  >
                    <img src={icon} alt="icon" className="w-6 h-6 object-contain" />
                  </div>

                  <div className="flex-1">
                    <div className="text-[15px] mb-1 font-medium text-[#555555]">
                      {notification.category}
                    </div>
                    <div className="text-sm leading-[1.4] text-[#555555] whitespace-pre-line">
                      {formatMessage(notification.message)}
                    </div>
                  </div>

                  <div
                    className={`text-[12px] flex-shrink-0 font-light ${notification.time === "지금"
                      ? "text-[#555]"
                      : "text-[#555]"
                      }`}
                  >
                    {notification.time}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={handleCancelDelete}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white rounded-2xl shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] z-50 overflow-hidden"
            >
              <div className="px-[32px] pt-[22px] pb-[26px] ">
                <h3 className="text-[19px] font-semibold mb-1 text-[#202020]">
                  알림을 삭제하시겠습니까?
                </h3>
                <p className="text-sm text-[#777777] mb-3 font-normal">
                  삭제한 알림은 복구할 수 없습니다.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-3 bg-[#e8e8e8] text-[17px] text-[#555] rounded-[12px] transition-colors font-medium"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-3 bg-[#2ECACA] text-[17px] text-white rounded-[12px] transition-colors font-medium"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
