import { Header } from "./Header";
import { UserGreeting } from "./UserGreeting";
import { CalendarCard } from "./CalendarCard";
import { PromoBanner } from "./PromoBanner";
import { CTAButtons } from "./CTAButtons";
import { BottomNav } from "./BottomNav";
import { SecondaryMenu } from "./SecondaryMenu";
import { HealthKnowledge } from "./HealthKnowledge";
import { motion, type Variants } from "framer-motion";
import type { Page } from "../types/page";

interface HomePageProps {
  userName: string;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onHospitalClick?: (hospital: any) => void;
  onCommunityClick?: (community: any) => void;
  getHospitalReviewCount?: (hospitalId: number) => number;
  hasUnreadNotification?: boolean;
  onNotificationClick?: () => void;
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function HomePage({
  userName,
  currentPage,
  onPageChange,
  onHospitalClick,
  onCommunityClick,
  getHospitalReviewCount,
  hasUnreadNotification,
  onNotificationClick,
}: HomePageProps) {
  return (
    <>
      {/* 🔔 상단 헤더 */}
      <Header
        hasUnreadNotification={hasUnreadNotification}
        onNotificationClick={onNotificationClick}
      />

      {/* 메인 컨텐츠 */}
      <motion.main
        className="bg-[#F7F7F7] pb-24"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={itemVariants}>
          <UserGreeting userName={userName} />
        </motion.div>

        <motion.div
          className="relative -mt-10 z-10"
          variants={itemVariants}
        >
          <CalendarCard />
        </motion.div>

        <motion.div
          className="px-5 xs:px-6 sm:px-8 mt-5"
          variants={itemVariants}
        >
          <CTAButtons
            onHospitalClick={() => onPageChange("hospital")}
            onCommunityClick={() => onPageChange("community")}
          />
        </motion.div>

        <motion.div
          className="px-5 xs:px-6 sm:px-8 mt-3"
          variants={itemVariants}
        >
          <SecondaryMenu />
        </motion.div>

        <motion.div
          className="px-5 xs:px-6 sm:px-8 mt-5"
          variants={itemVariants}
        >
          <PromoBanner />
        </motion.div>

        <motion.div className="mt-8" variants={itemVariants}>
          <HealthKnowledge />
        </motion.div>
      </motion.main>

      {/* 하단 GNB */}
      <BottomNav
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
    </>
  );
}
