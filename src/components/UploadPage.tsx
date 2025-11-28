"use client";

import {
  Image as ImageIcon,
  Camera,
  RefreshCw,
  ArrowLeft,
  Upload,
  Edit,
  Sparkles,
  X,
  Type,
  MapPin,
  Cloud,
  Clock,
  Heart,
  Footprints,
  Flame,
  TrendingUp,
} from "lucide-react";
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
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "framer-motion";

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

export function UploadPage({
  onBack,
  onUpload,
}: UploadPageProps) {
  const [showCameraPermission, setShowCameraPermission] =
    useState(false);
  const [showGalleryPermission, setShowGalleryPermission] =
    useState(false);
  const [permissionsGranted, setPermissionsGranted] =
    useState(false);
  const [isTextInputFocused, setIsTextInputFocused] =
    useState(false);

  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(
    null,
  );
  const [cameraError, setCameraError] = useState<string | null>(
    null,
  );
  const [selectedImage, setSelectedImage] = useState<
    string | null
  >(null);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [hasCameraDevice, setHasCameraDevice] = useState<
    boolean | null
  >(null);
  const [isDetailEditMode, setIsDetailEditMode] =
    useState(false);

  // 세부 입력 state
  const [textInput, setTextInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [weatherInput, setWeatherInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [healthInput, setHealthInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showNoImageAlert, setShowNoImageAlert] =
    useState(false);
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
  const [selectedFilter, setSelectedFilter] =
    useState("Normal");
  const [previousFilter, setPreviousFilter] =
    useState("Normal");

  // 모바일 감지 state
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 추천 캡션 데이터
  const aiCaptions = [
    { text: "오랫동안 ❤️" },
    { text: "오운완 💪" },
    { text: "우리 가족 건강의 발걸음 👣" },
    { text: "오늘은 맑음 ☀️" },
    { text: "갓 수확한 채소 🥬" },
  ];

  const handleCaptionClick = useCallback(
    (caption: string) =>
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const newText = textInput.trim()
          ? `${textInput.trim()} ${caption}`
          : caption;
        setTextInput(newText);
        // 이미 텍스트 모드이므로 포커스만 다시
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
    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  // 키보드 높이 감지
  useEffect(() => {
    if (initialViewportHeight.current === 0) {
      initialViewportHeight.current = window.innerHeight;
    }

    const handleResize = () => {
      // 🔐 "실제로 텍스트 입력 중" + "세부조정 모드" + "모바일 폭" 일 때만 키보드로 취급
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

      if (!window.visualViewport) return;

      const currentVisualHeight = window.visualViewport.height;
      const initialHeight = initialViewportHeight.current;
      const layoutHeightNow = window.innerHeight;

      const diff = initialHeight - currentVisualHeight;

      // ⚠️ 브라우저 창 자체를 줄인 경우: window.innerHeight도 같이 줄어든다
      const isLayoutResized =
        Math.abs(
          layoutHeightNow - initialViewportHeight.current,
        ) > 40;

      if (diff > 80 && !isLayoutResized) {
        // 👉 진짜 키보드가 올라온 상황으로 간주
        setKeyboardHeight(diff);
        document.body.style.height = currentVisualHeight + "px";
      } else {
        // 👉 단순 화면 리사이즈라면 키보드 아님
        setKeyboardHeight(0);
        document.body.style.height = "";
      }
    };

    window.visualViewport?.addEventListener(
      "resize",
      handleResize,
    );
    window.visualViewport?.addEventListener(
      "scroll",
      handleResize,
    );

    return () => {
      window.visualViewport?.removeEventListener(
        "resize",
        handleResize,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleResize,
      );
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
  const resizeAndCropImage = (
    imageSrc: string,
  ): Promise<string> =>
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

      img.onerror = () =>
        reject(new Error("Image load failed"));
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

      img.onerror = () =>
        reject(new Error("Image load failed"));
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
      const createdAt = `${today.getFullYear()}-${
        today.getMonth() + 1
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
      setCameraError(null); // 갤러리 업로드 시 카메라 오류 문구 제거
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
      setIsTextInputFocused(true); // 🔹 포커스 상태 미리 true
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
  const getTextBottom = () => {
    return 12;
  };

  const TOOLBAR_BASE_HEIGHT = 72; // 대략 툴바 자체 높이 (필요하면 조정)

  const AICaptionToolbar: React.FC = () => (
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
      className="fixed left-1/2 -translate-x-1/2 z-[100] w-full max-w-[500px] bg-white rounded-t-3xl shadow-[0_-6px_20px_rgba(0,0,0,0.12)]"
      style={{
        // ✅ 키보드 있으면 키보드 위, 없으면 화면 맨 아래
        bottom: keyboardHeight > 0 ? keyboardHeight : 0,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="px-4 pt-3 pb-2">
        <p className="text-[15px] font-semibold text-[#222222] mb-2">
          AI 추천 캡션
        </p>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {aiCaptions.map((caption, index) => (
            <button
              key={index}
              onMouseDown={handleCaptionClick(caption.text)}
              className="flex-shrink-0 px-4 py-2 text-[13px] font-medium border rounded-full whitespace-nowrap bg-white text-[#555555] border-[#E0E0E0]"
            >
              {caption.text}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const cardTranslateY =
    showTextInput && isDetailEditMode && isTextInputFocused
      ? isMobile
        ? -keyboardHeight
        : 0 // ✅ 웹(데스크탑)에서는 위치 이동 없음
      : 0;
  return (
    <>
      {/* 카메라/갤러리 권한 다이얼로그 */}
      <AlertDialog open={showCameraPermission}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              카메라 권한 허용
            </AlertDialogTitle>
            <AlertDialogDescription>
              사진을 촬영하려면 카메라 접근 권한이 필요합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handlePermissionDeny}>
              거부
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCameraPermissionAllow}
            >
              허용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showGalleryPermission}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              갤러리 권한 허용
            </AlertDialogTitle>
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

      <div className="relative w-full h-screen bg-white overflow-hidden">
        {/* 헤더(110px) + 툴바(대략 160px)를 제외한 영역 전체를 컨텐츠로 사용 */}
        <div className="absolute inset-x-0 top-0 bottom-0 flex justify-center">
          <div className="w-full max-w-[500px] h-full flex flex-col">
            {/* 🔹헤더 아래 여백 + 툴바 위 여백 포함한 컨텐츠 영역 */}
            <div className="flex-1 pt-[110px] pb-[160px] flex justify-center items-center px-5 xs:px-6 sm:px-8">
              {/* 카드 래퍼: 키보드 뜨면 위로 슬라이드 */}
              <div
                className="w-full flex justify-center"
                style={{
                  transform: `translateY(${cardTranslateY}px)`,
                  transition: "transform 0.25s ease-out",
                }}
              >
                <div
                  className="relative w-full aspect-[335/400] bg-gray-900 rounded-2xl overflow-hidden shadow-lg"
                  style={{
                    // 📏 세로 공간(100vh - 헤더 - 툴바)에 맞춰 카드 폭 줄이기
                    maxWidth:
                      keyboardHeight > 0
                        ? 400 // 키보드 있을 땐 폭 고정, 위치만 카드 전체 올리기
                        : "min(400px, calc((100vh - 110px - 160px) * 335 / 400))",
                  }}
                >
                  {/* 🔻 여기부터는 너가 이미 써둔 내용 그대로 붙이면 돼 🔻 */}

                  {/* 카메라 비디오 */}
                  {!isUploadMode && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {/* 선택된 이미지 */}
                  {selectedImage && (
                    <div className="absolute inset-0 bg-white">
                      <ImageWithFallback
                        src={selectedImage}
                        alt="Selected Image"
                        className="w-full h-full object-cover"
                        style={{
                          filter:
                            ORIGINAL_FILTERS.find(
                              (f) => f.name === selectedFilter,
                            )?.filter || "none",
                        }}
                      />

                      {/* 텍스트 모드일 때 이미지 어둡게 */}
                      {showTextInput && (
                        <div className="absolute inset-0 bg-black/35" />
                      )}

                      {/* 위치 / 날씨 / 시간 / 건강 캡슐들 */}
                      {(locationInput ||
                        weatherInput ||
                        timeInput ||
                        healthInput) && (
                        <div className="absolute top-4 left-4 flex flex-row flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                          {/* 위치 */}
                          {locationInput && (
                            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                              <MapPin
                                size={16}
                                className="text-white"
                              />
                              <span className="text-white text-sm">
                                {locationInput}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setLocationInput("")
                                }
                                className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-white/20"
                              >
                                <X
                                  size={10}
                                  className="text-white"
                                />
                              </button>
                            </div>
                          )}
                          {/* 날씨 */}
                          {weatherInput && (
                            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                              <Cloud
                                size={16}
                                className="text-white"
                              />
                              <span className="text-white text-sm">
                                {weatherInput}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setWeatherInput("")
                                }
                                className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-white/20"
                              >
                                <X
                                  size={10}
                                  className="text-white"
                                />
                              </button>
                            </div>
                          )}
                          {/* 시간 */}
                          {timeInput && (
                            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                              <Clock
                                size={16}
                                className="text-white"
                              />
                              <span className="text-white text-sm">
                                {timeInput}
                              </span>
                              <button
                                type="button"
                                onClick={() => setTimeInput("")}
                                className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-white/20"
                              >
                                <X
                                  size={10}
                                  className="text-white"
                                />
                              </button>
                            </div>
                          )}
                          {/* 건강 */}
                          {healthInput && (
                            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                              <Heart
                                size={16}
                                className="text-white"
                              />
                              <span className="text-white text-sm">
                                {healthInput}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setHealthInput("")
                                }
                                className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-white/20"
                              >
                                <X
                                  size={10}
                                  className="text-white"
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 텍스트 입력 / 캡슐 */}
                      <div
                        className="absolute left-4 right-4 transition-all duration-200 ease-out"
                        style={{ bottom: getTextBottom() }}
                      >
                        {showTextInput ? (
                          <input
                            ref={textInputRef}
                            type="text"
                            value={textInput}
                            onChange={(e) =>
                              setTextInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                setShowTextInput(false);
                                setIsTextInputFocused(false);
                                textInputRef.current?.blur();
                              }
                            }}
                            onFocus={() =>
                              setIsTextInputFocused(true)
                            }
                            onBlur={() => {
                              setIsTextInputFocused(false);
                              setShowTextInput(false);
                            }}
                            placeholder="텍스트를 입력하세요"
                            className="w-full text-black text-lg bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md outline-none focus:ring-2 focus:ring-[#36D2C5] placeholder:text-gray-500/70"
                          />
                        ) : textInput ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowTextInput(true);
                              setIsTextInputFocused(true);
                              setTimeout(
                                () =>
                                  textInputRef.current?.focus(),
                                80,
                              );
                            }}
                            className="w-full text-left text-black text-lg bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md"
                          >
                            {textInput}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* 카메라 에러 (업로드 모드 아닐 때만) */}
                  {cameraError && !isUploadMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-2xl z-20">
                      <div className="text-center px-6">
                        <Camera
                          size={48}
                          className="text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-white mb-2">
                          {cameraError}
                        </p>
                        <p className="text-gray-400 text-sm">
                          갤러리 버튼을 눌러 사진을 업로드할 수
                          있습니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 헤더 */}
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-4 flex items-center justify-center w-full bg-white max-w-[500px] mx-auto min-h-[110px]">
          {isFilterMode ? (
            <>
              <button
                onClick={() => {
                  setSelectedFilter(previousFilter);
                  setIsFilterMode(false);
                }}
                className="absolute left-4 p-1"
              >
                <ArrowLeft
                  size={24}
                  className="text-[#1A1A1A]"
                />
              </button>
              <button
                onClick={() => setIsFilterMode(false)}
                className="absolute right-4 px-4 py-2 text-[#36D2C5] font-semibold"
              >
                완료
              </button>
            </>
          ) : isDetailEditMode ? (
            <>
              <button
                onClick={() => {
                  if (hasDraft) {
                    setShowLeaveDetailAlert(true);
                  } else {
                    handleCloseDetailEdit();
                  }
                }}
                className="absolute left-4 p-1"
              >
                <X size={24} className="text-[#1A1A1A]" />
              </button>
              {/* ✅ 세부조정 완료: 업로드 X, 세부조정 모드만 종료 */}
              <button
                onClick={() => {
                  setShowTextInput(false);
                  textInputRef.current?.blur();
                  setIsDetailEditMode(false); // 다시 업로드 상태로
                }}
                className="absolute right-4 px-4 py-2 text-[#36D2C5] font-semibold"
              >
                완료
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                if (hasDraft) {
                  setShowLeaveUploadAlert(true);
                } else {
                  onBack();
                }
              }}
              className="absolute left-4 p-1"
            >
              <ArrowLeft size={24} className="text-[#1A1A1A]" />
            </button>
          )}

          <h1 className="text-xl font-bold text-[#1A1A1A] text-center">
            {isFilterMode
              ? "필터"
              : isDetailEditMode
                ? "세부조정"
                : "업로드"}
          </h1>
        </header>

        {/* 하단 컨트롤 */}
        <div
          className="absolute left-0 right-0 z-10 pt-4 pb-10 bg-white max-w-[500px] mx-auto"
          style={
            showTextInput &&
            isDetailEditMode &&
            isMobile &&
            isTextInputFocused &&
            keyboardHeight > 0
              ? { bottom: -keyboardHeight } // 키보드만큼 내려서 가려지게
              : { bottom: 0 } // 평소엔 화면 맨 아래 고정
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          {isFilterMode ? (
            <div className="w-full h-28 relative flex items-center justify-center">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="w-[68px] h-[68px] rounded-full border-[3px] border-[#36D2C5]" />
              </div>
              <div className="w-full h-full z-20">
                <Swiper
                  spaceBetween={14}
                  slidesPerView="auto"
                  className="w-full h-full"
                  loop={true}
                  centeredSlides={true}
                  slideToClickedSlide={true}
                  threshold={10}
                  speed={400}
                  onRealIndexChange={(swiper) => {
                    const realIndex =
                      swiper.realIndex %
                      ORIGINAL_FILTERS.length;
                    setSelectedFilter(
                      ORIGINAL_FILTERS[realIndex].name,
                    );
                  }}
                >
                  {loopFilters.map((filter, index) => (
                    <SwiperSlide
                      key={`${filter.name}-${index}`}
                      style={{
                        width: "auto",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {({ isActive }) => (
                        <button
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide select-none transition-all duration-200 ${
                            isActive
                              ? "bg-white text-gray-900 shadow-sm scale-100"
                              : "bg-[#EEEEEE] text-gray-400 scale-95"
                          }`}
                        >
                          {filter.name.toUpperCase()}
                        </button>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          ) : isDetailEditMode ? (
            <div className="flex flex-col items-center gap-3 max-w-md mx-auto px-4">
              {/* 👇 1. 여기서부터 "텍스트 입력 중이 아닐 때(!showTextInput)" 조건을 시작합니다 */}
              {!showTextInput && (
                <>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handleTextInputToggle}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#E5F9F8] text-[#36D2C5] transition-colors hover:bg-[#D0F0ED]">
                        <Type size={24} />
                      </div>
                      <span className="text-xs text-gray-600">
                        텍스트
                      </span>
                    </button>

                    <button
                      onClick={handleLocationInput}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFF4E5] text-[#FF9800] transition-colors hover:bg-[#FFE8CC]">
                        <MapPin size={24} />
                      </div>
                      <span className="text-xs text-gray-600">
                        위치
                      </span>
                    </button>

                    <button
                      onClick={handleWeatherInput}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#E8F8F7] text-[#36D2C5] transition-colors hover:bg-[#D0F0ED]">
                        <Cloud size={24} />
                      </div>
                      <span className="text-xs text-gray-600">
                        날씨
                      </span>
                    </button>

                    <button
                      onClick={handleTimeInput}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#F3E5F5] text-[#9C27B0] transition-colors hover:bg-[#E1BEE7]">
                        <Clock size={24} />
                      </div>
                      <span className="text-xs text-gray-600">
                        시간
                      </span>
                    </button>

                    <button
                      onClick={handleHealthInput}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFEBEE] text-[#F44336] transition-colors hover:bg-[#FFCDD2]">
                        <Heart size={24} />
                      </div>
                      <span className="text-xs text-gray-600">
                        건강
                      </span>
                    </button>
                  </div>

                  {/* 👇 2. 원래 밖에 있던 "업로드 버튼"을 여기(조건문 안)로 가져왔습니다 */}
                  <button
                    onClick={handleCapture}
                    className="w-16 h-16 rounded-full border-4 border-gray-100 bg-[#36D2C5] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
                  >
                    <Upload size={28} className="text-white" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between max-w-md mx-auto px-6">
              <button
                onClick={
                  isUploadMode
                    ? handleEdit
                    : () => fileInputRef.current?.click()
                }
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200"
              >
                {isUploadMode ? (
                  <Edit size={32} />
                ) : (
                  <ImageIcon size={32} />
                )}
              </button>

              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-gray-100 bg-[#36D2C5] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
              >
                {isUploadMode ? (
                  <Upload size={28} className="text-white" />
                ) : (
                  <div className="w-14 h-14 rounded-full border-4 border-white" />
                )}
              </button>

              <button
                onClick={
                  isUploadMode
                    ? handleFilter
                    : handleCameraSwitch
                }
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors"
              >
                {isUploadMode ? (
                  <Sparkles size={32} />
                ) : (
                  <RefreshCw size={32} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 건강 기록 모달 */}
      <AnimatePresence>
        {showHealthModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => setShowHealthModal(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
              }}
              className="relative w-full max-w-[500px] bg-white rounded-t-2xl p-6 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">
                    오늘 운동 기록
                  </h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "걸음수 8,542보",
                        )
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <Footprints
                        size={16}
                        className="text-gray-300"
                      />
                      <span className="text-[15px] font-medium">
                        걸음수
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "소모칼로리 450kcal",
                        )
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <Flame
                        size={16}
                        className="text-orange-400"
                        fill="currentColor"
                      />
                      <span className="text-[15px] font-medium">
                        소모칼로리
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect(
                          "오른층수 12층",
                        )
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <TrendingUp
                        size={16}
                        className="text-yellow-500"
                      />
                      <span className="text-[15px] font-medium">
                        오른층수
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">
                    오늘 감정 기록
                  </h3>
                  <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {[
                      "😄",
                      "😊",
                      "😐",
                      "😔",
                      "😫",
                      "😢",
                      "😭",
                    ].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleHealthRecordSelect(
                            `오늘의 기분 ${emoji}`,
                          )
                        }
                        className="w-11 h-11 flex items-center justify-center bg-[#555555] rounded-full text-2xl shrink-0 hover:bg-[#444444] transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 이미지 선택 안 했을 때 경고 */}
      <AlertDialog open={showNoImageAlert}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              이미지 선택 필요
            </AlertDialogTitle>
            <AlertDialogDescription>
              사진을 선택하거나 촬영한 후 업로드할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowNoImageAlert(false)}
            >
              닫기
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI 추천 캡션 바: 텍스트 입력 모드 + 세부조정 모드일 때 */}
      <AnimatePresence>
        {selectedImage &&
          isDetailEditMode &&
          showTextInput &&
          isTextInputFocused && <AICaptionToolbar />}
      </AnimatePresence>

      {/* 세부조정 종료 확인 */}
      <AlertDialog open={showLeaveDetailAlert}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              세부조정을 종료할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              입력한 내용은 그대로 유지되지만 세부조정 화면을
              닫습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowLeaveDetailAlert(false)}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLeaveDetailAlert(false);
                handleCloseDetailEdit();
              }}
            >
              종료
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 업로드 작성 취소 확인 */}
      <AlertDialog open={showLeaveUploadAlert}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              작성을 취소할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              지금까지 작성한 내용이 모두 사라집니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowLeaveUploadAlert(false)}
            >
              계속 작성
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // 전체 작성 내용 초기화
                setShowLeaveUploadAlert(false);
                setSelectedImage(null);
                setTextInput("");
                setLocationInput("");
                setWeatherInput("");
                setTimeInput("");
                setHealthInput("");
                setIsUploadMode(false);
                setIsDetailEditMode(false);
                setShowTextInput(false);
                onBack();
              }}
            >
              취소하고 나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}