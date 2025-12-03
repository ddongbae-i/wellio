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
      const diff = base - vv.height; // 키보드로 줄어든 높이

      if (diff > 80) {
        setKeyboardHeight(diff);
        // 👉 뷰포트를 키보드 위까지만 보이게
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
    if (isKeyboardVisible) return 0;      // 키보드 떠 있을 때는 화면 맨 아래

    // ✅ 세부조정 모드(텍스트/위치/날씨 버튼 + 업로드 버튼 분리)
    // → 업로드 버튼은 원래처럼 아래에 붙여두고 싶으니까 0이나 16 정도
    if (isDetailEditMode) return 50;

    // ✅ 기본 촬영/업로드 모드
    // → 카메라 컨트롤 묶음을 사진 쪽으로 끌어올리기
    return 120; // 숫자 마음에 안 들면 64, 80 이런 식으로 조정 가능
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

  // ✅ 캡션 바: 항상 "현재 뷰포트"의 바닥 (키보드 위) 에 고정
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
      className="fixed left-1/2 -translate-x-1/2 z-[100] w-full max-w-[500px] bg-white rounded-t-[16px] shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)]"
      style={{
        bottom: isKeyboardVisible ? 90 : 0,
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
                top: isKeyboardVisible ? "180px" : "46%",
                transform: isKeyboardVisible
                  ? "translateY(0)"
                  : "translateY(-50%)",
              }}
            >
              <div className="relative w-full mx-auto overflow-visible flex-shrink-0 aspect-[335/400] max-h-[calc(100vh-280px)]">
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] z-50">
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
                            {locationInput && (
                              <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                <img
                                  src={MapPin}
                                  alt="위치"
                                  className="w-[18px] h-[18px]"
                                />
                                <span className="text-[#555555] text-[15px]">
                                  {locationInput}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setLocationInput("")}
                                  className="ml-1 flex items-center justify-center w-4 h-4"
                                >
                                  <img
                                    src={X}
                                    alt="삭제"
                                    className="w-3 h-3"
                                  />
                                </button>
                              </div>
                            )}

                            {weatherInput && (
                              <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                <img
                                  src={Cloud}
                                  alt="날씨"
                                  className="w-[18px] h-[18px]"
                                />
                                <span className="text-[#555555] text-[15px]">
                                  {weatherInput}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setWeatherInput("")}
                                  className="ml-1 flex items-center justify-center w-4 h-4"
                                >
                                  <img
                                    src={X}
                                    alt="삭제"
                                    className="w-3 h-3"
                                  />
                                </button>
                              </div>
                            )}

                            {timeInput && (
                              <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                <img
                                  src={Clock}
                                  alt="시간"
                                  className="w-[18px] h-[18px]"
                                />
                                <span className="text-[#555555] text-[15px]">
                                  {timeInput}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setTimeInput("")}
                                  className="ml-1 flex items-center justify-center w-4 h-4"
                                >
                                  <img
                                    src={X}
                                    alt="삭제"
                                    className="w-3 h-3"
                                  />
                                </button>
                              </div>
                            )}

                            {healthInput && (
                              <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                <img
                                  src={Heart}
                                  alt="데이터"
                                  className="w-[18px] h-[18px]"
                                />
                                <span className="text-[#555555] text-[15px]">
                                  {healthInput}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setHealthInput("")}
                                  className="ml-1 flex items-center justify-center w-4 h-4"
                                >
                                  <img
                                    src={X}
                                    alt="삭제"
                                    className="w-3 h-3"
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
                              setTextInput(
                                applyTextLimit(e.target.value),
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                setShowTextInput(false);
                                setIsTextInputFocused(false);
                                textInputRef.current?.blur();
                              }
                            }}
                            onFocus={() => setIsTextInputFocused(true)}
                            onBlur={() => {
                              setIsTextInputFocused(false);
                              setShowTextInput(false);
                            }}
                            placeholder="텍스트를 입력하세요"
                            className="w-full text-[#555555] text-[15px] bg-white/80 backdrop-blur-sm px-5 py-2 rounded-[50px] outline-none placeholder:text-[#aeaeae] border border-[#ffffff]"
                          />
                        ) : textInput ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowTextInput(true);
                              setIsTextInputFocused(true);
                              setTimeout(
                                () => textInputRef.current?.focus(),
                                80,
                              );
                            }}
                            className="w-full text-left text-[#555555] text-[15px] bg-white/80 backdrop-blur-sm px-5 py-2 rounded-[50px]"
                          >
                            {textInput}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* 카메라 에러 (업로드 모드 아닐 때만) */}
                  {cameraError && !isUploadMode && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-[16px] z-20">
                      <div className="text-center px-6">
                        <Camera
                          size={48}
                          className="text-gray-400 mx-auto mb-4"
                        />
                        <p className="text-white mb-2">
                          {cameraError}
                        </p>
                        <p className="text-[#aeaeae] text-sm">
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
        <header className="fixed top-0 left-0 right-0 z-40 px-5 xs:px-6 sm:px-8 py-4 flex items-center justify-center w-full bg-[#f7f7f7]/80 backdrop-blur-xs relative max-w-[500px] mx-auto min-h-[80px]">
          {isFilterMode ? (
            <>
              <button
                onClick={() => {
                  setSelectedFilter(previousFilter);
                  setIsFilterMode(false);
                }}
                className="absolute left-4 p-1"
              >
                <img
                  src={ChevronLeft}
                  alt="뒤로가기"
                  className="w-6 h-6"
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
                <img src={X} alt="닫기" className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  textInputRef.current?.blur();
                  setIsDetailEditMode(false);
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
              <img
                src={ChevronLeft}
                alt="뒤로가기"
                className="w-6 h-6"
              />
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

        {/* 하단 컨트롤 (카메라/필터 버튼) */}
        <div
          className="absolute left-0 right-0 z-10 px-5 xs:px-6 sm:px-8 bg-[#f7f7f7] max-w-[500px] mx-auto"
          style={{
            bottom: getControlsBottom(),
          }}
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
                      swiper.realIndex % ORIGINAL_FILTERS.length;
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
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wide select-none transition-all duration-200 ${isActive
                            ? "bg-white text-gray-900 shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] scale-100"
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
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto px-4">
              {!showTextInput && (
                <>
                  <div className="flex items-center justify-center mt-4 gap-4">
                    <button onClick={handleTextInputToggle}>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8] transition-colors hover:bg-[#D0F0ED]">
                        <img
                          src={Type}
                          alt="텍스트"
                          className="w-[22px] h-[22px]"
                        />
                      </div>
                    </button>

                    <button onClick={handleLocationInput}>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8] transition-colors hover:bg-[#D0F0ED]">
                        <img
                          src={MapPin}
                          alt="위치"
                          className="w-[22px] h-[22px]"
                        />
                      </div>
                    </button>

                    <button onClick={handleWeatherInput}>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8] transition-colors hover:bg-[#D0F0ED]">
                        <img
                          src={Cloud}
                          alt="날씨"
                          className="w-[22px] h-[22px]"
                        />
                      </div>
                    </button>

                    <button onClick={handleTimeInput}>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8] transition-colors hover:bg-[#D0F0ED]">
                        <img
                          src={Clock}
                          alt="시간"
                          className="w-[22px] h-[22px]"
                        />
                      </div>
                    </button>

                    <button onClick={handleHealthInput}>
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8] transition-colors hover:bg-[#D0F0ED]">
                        <img
                          src={Heart}
                          alt="데이터"
                          className="w-[22px] h-[22px]"
                        />
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={handleCapture}
                    className="w-[70px] h-[70px] rounded-full border-4 border-gray-100 bg-[#2ECACA] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
                  >
                    <img
                      src={Upload}
                      alt="업로드"
                      className="w-[35px] h-[35px]"
                    />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between max-w-md mx-auto px-6 mt-3">
              <button
                onClick={
                  isUploadMode
                    ? handleEdit
                    : () => fileInputRef.current?.click()
                }
                className="w-[50px] h-[50px] flex items-center justify-center rounded-full border boder-[#e8e8e8] bg-[#f0f0f0] text-gray-500 transition-colors hover:bg-gray-200"
              >
                {isUploadMode ? (
                  <img
                    src={Edit}
                    alt="꾸미기"
                    className="w-[24px] h-[24px]"
                  />
                ) : (
                  <img
                    src={ImageIcon}
                    alt="꾸미기"
                    className="w-[30px] h-[30px]"
                  />
                )}
              </button>

              <button
                onClick={handleCapture}
                className="w-[70px] h-[70px] rounded-full border-4 border-gray-100 bg-[#2ECACA] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
              >
                {isUploadMode ? (
                  <img
                    src={Upload}
                    alt="업로드"
                    className="w-[35px] h-[35px]"
                  />
                ) : (
                  <div className="w-[70px] h-[70px] rounded-full" />
                )}
              </button>

              <button
                onClick={
                  isUploadMode ? handleFilter : handleCameraSwitch
                }
                className="w-[50px] h-[50px] flex items-center justify-center rounded-full border boder- bg-[#f0f0f0] text-gray-500 transition-colors hover:bg-gray-200"
              >
                {isUploadMode ? (
                  <img
                    src={Sparkles}
                    alt="효과"
                    className="w-[32px] h-[32px]"
                  />
                ) : (
                  <img
                    src={RefreshCw}
                    alt="카메라전환"
                    className="w-[27px] h-[27px]"
                  />
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
              className="relative w-full max-w-[500px] bg-white rounded-t-2xl p-6 shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]"
            >
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#202020]">
                    오늘 운동 기록
                  </h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 text-white text-sm ">
                    <button
                      onClick={() =>
                        handleHealthRecordSelect("👟 8,542보")
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2 rounded-full whitespace-nowrap"
                    >
                      <span className="text-[15px] font-medium">
                        👟 걸음수
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect("🔥 450kcal")
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2 rounded-full whitespace-nowrap"
                    >
                      <span className="text-[15px] font-medium">
                        🔥 소모칼로리
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleHealthRecordSelect("🪜 12층")
                      }
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2 rounded-full whitespace-nowrap"
                    >
                      <span className="text-[15px] font-medium">
                        🪜 오른층수
                      </span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#202020]">
                    오늘 감정 기록
                  </h3>
                  <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {[
                      "😄",
                      "😊",
                      "🙂",
                      "😐",
                      "🙁",
                      "🥲",
                      "😭",
                      "😤",
                    ].map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleHealthRecordSelect(`${emoji}`)
                        }
                        className="px-4 py-2 flex items-center justify-center bg-[#555555] rounded-[30px] text-[14px] shrink-0 hover:bg-[#444444] transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#202020]">
                    진행중인 챌린지
                  </h3>
                  <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-1 text-white text-sm ">
                    {[
                      "다시 15만보 걷기",
                      "주 1회 함께 걷기",
                      "건강한 습관 만들기",
                      "가족 건강 상위 10%",
                    ].map((challenge, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleHealthRecordSelect(`${challenge}`)
                        }
                        className="px-5 py-2 flex items-center justify-center bg-[#555555] rounded-[30px] text-[14px] shrink-0 hover:bg-[#444444] transition-colors"
                      >
                        {challenge}
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
            <AlertDialogTitle>이미지 선택 필요</AlertDialogTitle>
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

      {/* AI 추천 캡션 바 */}
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
