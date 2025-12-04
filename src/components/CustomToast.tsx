import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import ChevronRight from "../assets/images/icon_chevron_right_12.svg";

interface CustomToastProps {
    show: boolean;
    message: string;
    onClose: () => void;
    duration?: number;
    showArrow?: boolean;
    onClick?: () => void;
}

export function CustomToast({
    show,
    message,
    onClose,
    duration = 2000,
    showArrow = false,
    onClick,
}: CustomToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={onClick}
                    className={`fixed top-[calc(100vh-80px)] left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 text-[#2b2b2b] rounded-full border border-[#D9ABA0] bg-[#FFF7F5] w-fit max-w-[calc(500px-40px)] ${onClick ? "cursor-pointer" : ""
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <p className="text-[15px] font-medium text-center whitespace-nowrap">
                            {message}
                        </p>
                        {showArrow && (
                            <span className="text-[#2b2b2b] text-[15px] font-medium">›</span>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}