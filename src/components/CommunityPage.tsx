"use client";

import { Camera } from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
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

  const [isFrontCamera, setIsFrontCamera] = useState(true);
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

  // 🔹 글자수 제한 함수 (한글 28, 영어 33)
  const applyTextLimit = (value: string) => {
    const hasKorean = /[ㄱ-ㅎ가-힣]/.test(value);
    const maxLen = hasKorean ? 28 : 33;
    if (value.length > maxLen) {
      return value.slice(0, maxLen);
    }
    return value;
  };

  const handleCaptionClick = useCallback(
    (caption: string) =>
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const raw = textInput.trim()
          ? `${textInput.trim()} ${caption}`
          : caption;
        const limited = applyTextLimit(raw);
        setTextInput(limited);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ 키보드 높이 감지 (innerHeight 기준 – 커뮤니티 페이지 방식)
  useEffect(() => {
    if (initialViewportHeight.current === 0) {
      initialViewportHeight.current = window.innerHeight;
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
        return;
      }

      const currentHeight = window.innerHeight;
      const diff = initialViewportHeight.current - currentHeight;

      if (diff > 50) {
        setKeyboardHeight(Math.min(diff, 360));
      } else {
        setKeyboardHeight(0);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [
    showTextInput,
    isDetailEditMode,
    isMobile,
    isTextInputFocused,
  ]);

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
          (videoRef.current as any).srcObject = newStream;
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

  // Canvas 필터 적용
  const applyFilterToImage = (
    imageSrc: string,
    filterString: string,
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };

      img.onerror = () => reject(new Error("Image load failed"));
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
      if (currentFilter && currentFilter.filter !== "none") {
        try {
          finalImage = await applyFilterToImage(
            finalImage,
            currentFilter.filter,
          );
        } catch (error) {
          console.error("필터 적용 실패:", error);
        }
      }

      const today = new Date();
      const createdAt = `${today.getFullYear()}-${today.getMonth() + 1
        }-${today.getDate()}`;

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
      toast.success("업로드 되었습니다!");
      return;
    }

    // 카메라 캡처
    if (hasCameraDevice && videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = (videoRef.current as any).videoWidth;
      canvas.height = (videoRef.current as any).videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(videoRef.current as any, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
          const capturedImage = reader.result as string;
          try {
            const resizedImage =
              await resizeAndCropImage(capturedImage);
            setSelectedImage(resizedImage);
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

  const handleCameraSwitch = () =>
    setIsFrontCamera((prev) => !prev);

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const originalImage = reader.result as string;
      try {
        const resizedImage =
          await resizeAndCropImage(originalImage);
        setSelectedImage(resizedImage);
      } catch (error) {
        console.error("이미지 리사이즈 실패:", error);
        setSelectedImage(originalImage);
      }
      setIsUploadMode(true);
      setCameraError(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => setIsDetailEditMode(true);
  const handleCloseDetailEdit = () => {
    setIsDetailEditMode(false);
    setShowTextInput(false);
  };

  const handleTextInputToggle = () => {
    if (showTextInput) {
      setShowTextInput(false);
      setIsTextInputFocused(false);
      textInputRef.current?.blur();
    } else {
      setShowTextInput(true);
      setIsTextInputFocused(true);
      setTimeout(() => textInputRef.current?.focus(), 80);
    }
  };

  const handleLocationInput = () =>
    setLocationInput("서울시 강남구");
  const handleWeatherInput = () =>
    setWeatherInput("맑음 • 22°C");
  const handleTimeInput = () => {
    const now = new Date();
    setTimeInput(
      `${now.getFullYear()}.${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}.${String(now.getDate()).padStart(
        2,
        "0",
      )}`,
    );
  };
  const handleHealthInput = () => setShowHealthModal(true);
  const handleHealthRecordSelect = (record: string) => {
    setHealthInput(record);
    setShowHealthModal(false);
  };
  const handleFilter = () => {
    setIsFilterMode(true);
    setPreviousFilter(selectedFilter);
  };

  // 텍스트 인풋/캡슐 bottom 위치 (카드 안에서 12px)
  const getTextBottom = () => 12;

  // ✅ 캡션 바: 키보드 높이만큼 올리기
  const AICaptionToolbar: React.FC<{
    keyboardHeight: number;
  }> = ({ keyboardHeight }) => (
    <motion.div
      key="ai-caption-toolbar"
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 260,
      }}
      className="fixed left-1/2 -translate-x-1/2 z-[100] w-full max-w-[500px] bg-white rounded-t-[16px] shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)]"
      style={{
        bottom: keyboardHeight > 0 ? keyboardHeight : 0,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="px-6 pt-6 pb-2">
        <p className="text-[19px] font-semibold text-[#2b2b2b] mb-2">
          AI 추천 캡션
        </p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {aiCaptions.map((caption, index) => (
            <button
              key={index}
              onMouseDown={handleCaptionClick(caption.text)}
              className="flex-shrink-0 px-5 py-2 text-[14px] font-normal border rounded-full whitespace-nowrap bg-white text-[#555555] border-[#d9d9d9]"
            >
              {caption.text}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* 카메라/갤러리 권한 다이얼로그 */}
      <AlertDialog open={showCameraPermission}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>카메라 권한 허용</AlertDialogTitle>
            <AlertDialogDescription>
              사진을 촬영하려면 카메라 접근 권한이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePermissionDeny}>
              거부
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCameraPermissionAllow}>
              허용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showGalleryPermission}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>갤러리 권한 허용</AlertDialogTitle>
            <AlertDialogDescription>
              사진을 업로드하려면 갤러리 접근 권한이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePermissionDeny}>
              거부
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGalleryPermissionAllow}
            >
              허용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 메인 래퍼 */}
      <div className="relative w-full min-h-screen bg-[#f7f7f7] overflow-hidden">
        <div className="absolute inset-0 flex justify-center overflow-visible">
          <div className="relative w-full max-w-[500px] h-full">
            {/* 이미지 카드 컨테이너 */}
            <div
              className="absolute left-0 right-0 flex flex-col items-center w-full justify-center px-5 xs:px-6 sm:px-8 transition-all duration-300"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <div className="relati
