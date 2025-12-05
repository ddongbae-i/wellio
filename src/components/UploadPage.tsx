"use client";

import { Camera } from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import MapPin from "../assets/images/icon_com_map.svg";
import Cloud from "../assets/images/icon_com_sun.svg";
import Clock from "../assets/images/icon_com_time.svg";
import Type from "../assets/images/icon_com_text.svg";
import Heart from "../assets/images/icon_com_data.svg";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import Edit from "../assets/images/icon_com_edit.svg";
import X from "../assets/images/icon_com_x.svg";
import Upload from "../assets/images/icon_com_up.svg";
import RefreshCw from "../assets/images/icon_com_change.svg";
import ImageIcon from "../assets/images/icon_com_gallery.svg";
import Sparkles from "../assets/images/icon_com_filter.svg";
import WalkIcon from "../assets/images/WalkIcon.svg"
import TogetherIcon from "../assets/images/TogetherIcon.svg"
import HabitIcon from "../assets/images/HabitIcon.svg"
import TrophyIcon from "../assets/images/TrophyIcon.svg"
import { FreeMode, Mousewheel } from "swiper/modules";
import "swiper/css/free-mode";


// 커스텀 알럿 컴포넌트
interface CustomAlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  cancelText = "취소",
  confirmText = "확인",
}) => {
  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* 배경 오버레이 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* 모달 컨텐츠 */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-[340px] bg-white rounded-[16px] p-6 shadow-lg"
        >
          <h2 className="text-[19px] font-semibold mb-1 text-[#202020]">
            {title}
          </h2>
          <p className="text-[15px] text-[#555555] mb-3 leading-[1.4]">
            {description}
          </p>

          <div className="flex gap-2">
            {onConfirm && (
              <button
                onClick={onConfirm}
                className="              
                flex-1 px-4 py-3 bg-[#e8e8e8] text-[17px] text-[#555] rounded-[12px] transition-colors font-medium"
              >
                {confirmText}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#2ECACA] text-[17px] text-white rounded-[12px] transition-colors font-medium"
            >
              {cancelText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// 원본 필터 목록
const ORIGINAL_FILTERS = [
  { name: "Normal", filter: "none" },
  {
    name: "Kilda",
    filter:
      "brightness(1.0) contrast(1.2) saturate(1.25) hue-rotate(-5deg)",
  },
  {
    name: "Still",
    filter:
      "brightness(1.0) contrast(1.0) saturate(0.5) grayscale(0.3)",
  },
  {
    name: "Fade",
    filter:
      "brightness(1.1) contrast(0.85) saturate(0.9) sepia(0.05)",
  },
  {
    name: "Paris",
    filter:
      "brightness(1.15) contrast(0.95) saturate(1.0) sepia(0.08) blur(0.3px)",
  },
  {
    name: "Lapis",
    filter:
      "brightness(1.0) contrast(1.08) saturate(1.1) hue-rotate(10deg)",
  },
  {
    name: "Simple",
    filter: "brightness(1.08) contrast(1.0) saturate(1.0)",
  },
];




interface UploadPageProps {
  onBack: () => void;
  onUpload: (post: {
    image: string;
    caption: string;
    textOverlay?: string;
    location?: string;
    weather?: string;
    time?: string;
    health?: string;
    createdAt?: string;
  }) => void;
}

export function UploadPage({ onBack, onUpload }: UploadPageProps) {
  const [showCameraPermission, setShowCameraPermission] =
    useState(false);
  const [showGalleryPermission, setShowGalleryPermission] =
    useState(false);
  const [permissionsGranted, setPermissionsGranted] =
    useState(false);
  const [isTextInputFocused, setIsTextInputFocused] =
    useState(false);

  const [isFrontCamera, setIsFrontCamera] = useState(false); // 후면 카메라가 기본
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    null,
  );
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [hasCameraDevice, setHasCameraDevice] = useState<boolean | null>(
    null,
  );
  const [isDetailEditMode, setIsDetailEditMode] = useState(false);


  // 세부 입력 state
  const [textInput, setTextInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [weatherInput, setWeatherInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [healthInput, setHealthInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [healthIcon, setHealthIcon] = useState<string | null>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showNoImageAlert, setShowNoImageAlert] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  const [showLeaveDetailAlert, setShowLeaveDetailAlert] =
    useState(false);
  const [showLeaveUploadAlert, setShowLeaveUploadAlert] =
    useState(false);

  const hasDraft =
    !!selectedImage ||
    !!textInput ||
    !!locationInput ||
    !!weatherInput ||
    !!timeInput ||
    !!healthInput;

  // 키보드 높이 감지 상태 및 Ref
  const initialViewportHeight = useRef(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // 필터 모드 state
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Normal");
  const [previousFilter, setPreviousFilter] = useState("Normal");

  // 모바일 감지 state
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 추천 캡션 데이터
  const aiCaptions = [
    { text: "오랫동안 ❤️" },
    { text: "오운완 💪" },
    { text: "우리 가족 건강의 발걸음 👣" },
    { text: "좋은 날 좋은 시간 ☀️" },
    { text: "갓 수확한 채소 🥬" },
  ];

  // ✅ 글자 수 제한 함수 (한글 28, 그 외 33)
  const applyTextLimit = (value: string) => {
    const hasKorean = /[ㄱ-ㅎ가-힣]/.test(value);
    const limit = hasKorean ? 28 : 33;
    return value.slice(0, limit);
  };

  const handleCaptionClick = useCallback(
    (caption: string) =>
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const combined = textInput.trim()
          ? `${textInput.trim()} ${caption}`
          : caption;
        const newText = applyTextLimit(combined);
        setTextInput(newText);
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      },
    [textInput],
  );

  const loopFilters = useMemo(
    () => [
      ...ORIGINAL_FILTERS,
      ...ORIGINAL_FILTERS,
      ...ORIGINAL_FILTERS,
    ],
    [],
  );

  const isKeyboardVisible =
    keyboardHeight > 0 &&
    showTextInput &&
    isDetailEditMode &&
    isMobile &&
    isTextInputFocused;

  // 권한은 디자인 상 이미 허용된 상태로 가정
  useEffect(() => {
    setPermissionsGranted(true);
  }, []);

  // ✅ iPhone 텍스트 입력 시 자동 줌 방지
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const originalContent = viewport?.getAttribute('content');

    if (viewport && showTextInput && isTextInputFocused) {
      // 텍스트 입력 중일 때 줌 방지
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }

    return () => {
      // 원래 설정으로 복구
      if (viewport && originalContent) {
        viewport.setAttribute('content', originalContent);
      }
    };
  }, [showTextInput, isTextInputFocused]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ 키보드 높이 감지 + body 높이 조절
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    if (initialViewportHeight.current === 0) {
      initialViewportHeight.current = vv.height;
    }

    const handleResize = () => {
      if (
        !(
          showTextInput &&
          isDetailEditMode &&
          isMobile &&
          isTextInputFocused
        )
      ) {
        setKeyboardHeight(0);
        document.body.style.height = "";
        return;
      }

      const base = initialViewportHeight.current || vv.height;
      const diff = base - vv.height;

      if (diff > 80) {
        setKeyboardHeight(diff);
        document.body.style.height = `${vv.height}px`;
      } else {
        setKeyboardHeight(0);
        document.body.style.height = "";
      }
    };

    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);

    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
      document.body.style.height = "";
    };
  }, [
    showTextInput,
    isDetailEditMode,
    isMobile,
    isTextInputFocused,
  ]);

  const getControlsBottom = () => {
    if (isKeyboardVisible) return 0;
    if (isDetailEditMode) return 50;
    return 120;
  };

  // 카메라 스트림 시작
  useEffect(() => {
    if (!permissionsGranted || isUploadMode) return;

    const startCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const devices =
          await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        if (videoDevices.length === 0) {
          setCameraError("사용 가능한 카메라가 없습니다.");
          setHasCameraDevice(false);
          return;
        } else {
          setHasCameraDevice(true);
        }

        const constraints: MediaStreamConstraints = {
          video:
            videoDevices.length > 1
              ? {
                facingMode: isFrontCamera
                  ? "user"
                  : "environment",
              }
              : true,
          audio: false,
        };

        const newStream =
          await navigator.mediaDevices.getUserMedia(
            constraints,
          );
        setStream(newStream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error("카메라 접근 실패:", error);
        setCameraError("카메라를 시작할 수 없습니다.");
      }
    };

    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [permissionsGranted, isFrontCamera, isUploadMode]);

  const handleCameraPermissionAllow = () => {
    setShowCameraPermission(false);
    setShowGalleryPermission(true);
  };

  const handleGalleryPermissionAllow = () => {
    setShowGalleryPermission(false);
    setPermissionsGranted(true);
  };

  const handlePermissionDeny = () => {
    setShowCameraPermission(false);
    setShowGalleryPermission(false);
    onBack();
  };

  // 이미지를 335x400 크기로 크롭/리사이즈
  const resizeAndCropImage = (imageSrc: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetWidth = 335;
        const targetHeight = 400;
        const targetRatio = targetWidth / targetHeight;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgRatio > targetRatio) {
          drawHeight = targetHeight;
          drawWidth = img.width * (targetHeight / img.height);
          offsetX = -(drawWidth - targetWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = targetWidth;
          drawHeight = img.height * (targetWidth / img.width);
          offsetX = 0;
          offsetY = -(drawHeight - targetHeight) / 2;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(
          img,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight,
        );
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };

      img.onerror = () => reject(new Error("Image load failed"));
      img.src = imageSrc;
    });

  // ✅ Canvas 필터 적용 (iOS 완벽 호환 버전 - 개선)
  const applyFilterToImage = (
    imageSrc: string,
    filterString: string
  ): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();

      // base64 이미지에는 crossOrigin 설정하지 않음
      if (!imageSrc.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d", {
            willReadFrequently: false,
            alpha: true
          });

          if (!ctx) {
            // Canvas 실패 시 원본 반환
            console.warn("Canvas context 생성 실패, 원본 사용");
            resolve(imageSrc);
            return;
          }

          // 캔버스 초기화 및 필터 적용
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.filter = filterString || "none";
          ctx.drawImage(img, 0, 0);
          ctx.filter = "none"; // 필터 리셋

          // ✅ iOS: toDataURL을 먼저 시도 (더 안정적)
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            if (dataUrl && dataUrl.length > 50 && dataUrl.startsWith('data:image')) {
              resolve(dataUrl);
              return;
            }
          } catch (e) {
            console.warn("toDataURL 실패, toBlob 시도:", e);
          }

          // toDataURL 실패 시 toBlob 시도
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // 모두 실패하면 원본 반환
                console.warn("toBlob 실패, 원본 사용");
                resolve(imageSrc);
                return;
              }

              const reader = new FileReader();
              reader.onloadend = () => {
                const result = reader.result as string;
                if (result && result.length > 50 && result.startsWith('data:image')) {
                  resolve(result);
                } else {
                  resolve(imageSrc);
                }
              };
              reader.onerror = () => {
                console.warn("FileReader 실패, 원본 사용");
                resolve(imageSrc);
              };
              reader.readAsDataURL(blob);
            },
            "image/jpeg",
            0.95
          );
        } catch (e) {
          console.error("필터 적용 중 에러:", e);
          // 에러 시 원본 반환
          resolve(imageSrc);
        }
      };

      img.onerror = () => {
        console.error("이미지 로드 실패, 원본 사용");
        resolve(imageSrc);
      };

      img.src = imageSrc;
    });

  const handleCapture = async () => {
    // 업로드 모드일 때: 최종 업로드
    if (isUploadMode) {
      if (!selectedImage) {
        setShowNoImageAlert(true);
        return;
      }

      let finalImage = selectedImage;

      const currentFilter = ORIGINAL_FILTERS.find(
        (f) => f.name === selectedFilter,
      );

      // 필터가 Normal이 아닐 때만 적용
      if (currentFilter && currentFilter.filter !== "none") {
        try {
          const filteredImage = await applyFilterToImage(
            selectedImage,
            currentFilter.filter,
          );

          // 필터 적용 결과 검증
          if (filteredImage && filteredImage !== selectedImage) {
            finalImage = filteredImage;
            console.log("필터 적용 성공");
          } else {
            console.warn("필터 적용 실패, 원본 사용");
          }
        } catch (error) {
          console.error("필터 적용 에러:", error);
        }
      }

      const today = new Date();
      const createdAt = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

      onUpload({
        image: finalImage,
        caption: textInput,
        textOverlay: textInput,
        location: locationInput,
        weather: weatherInput,
        time: timeInput,
        health: healthInput,
        createdAt,
      });

      // ✅ 모든 state 초기화
      setSelectedImage(null);
      setTextInput("");
      setLocationInput("");
      setWeatherInput("");
      setTimeInput("");
      setHealthInput("");
      setHealthIcon(null);
      setIsUploadMode(false);
      setIsDetailEditMode(false);
      setShowTextInput(false);
      setSelectedFilter("Normal");

      toast.success("업로드 되었습니다!");

      // ✅ 페이지 나가기
      onBack();
      return;
    }

    // 카메라 캡처
    if (hasCameraDevice && videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
          const capturedImage = reader.result as string;
          try {
            setSelectedImage(capturedImage);
          } catch (error) {
            console.error("이미지 리사이즈 실패:", error);
            setSelectedImage(capturedImage);
          }
          setIsUploadMode(true);
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
          }
        };
        reader.readAsDataURL(blob);
      }, "image/jpeg");
    } else {
      toast.error("카메라를 사용할 수 없습니다.");
    }
  };