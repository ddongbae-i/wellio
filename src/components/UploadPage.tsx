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
  Check,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
// ui 폴더 경로는 프로젝트 구조에 맞게 유지
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
    filter: "brightness(1.0) contrast(1.2) saturate(1.25) hue-rotate(-5deg)",
  },
  {
    name: "Still",
    filter: "brightness(1.0) contrast(1.0) saturate(0.5) grayscale(0.3)",
  },
  {
    name: "Fade",
    filter: "brightness(1.1) contrast(0.85) saturate(0.9) sepia(0.05)",
  },
  {
    name: "Paris",
    filter:
      "brightness(1.15) contrast(0.95) saturate(1.0) sepia(0.08) blur(0.3px)",
  },
  {
    name: "Lapis",
    filter: "brightness(1.0) contrast(1.08) saturate(1.1) hue-rotate(10deg)",
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
  }) => void;
}

export function UploadPage({ onBack, onUpload }: UploadPageProps) {
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [showGalleryPermission, setShowGalleryPermission] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [hasCameraDevice, setHasCameraDevice] = useState<boolean | null>(null);
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
    {
      text: "오랫동안 ❤️",
      color: "bg-[#FFF8F8] text-[#F96D6D] border-[#F96D6D]/30",
    },
    {
      text: "오운완 💪",
      color: "bg-[#FFF9ED] text-[#FFC107] border-[#FFC107]/30",
    },
    {
      text: "우리 가족 건강의 발걸음 👣",
      color: "bg-[#E5F9F8] text-[#36D2C5] border-[#36D2C5]/30",
    },
    {
      text: "오늘은 맑음 ☀️",
      color: "bg-blue-50 text-blue-600 border-blue-600/30",
    },
    {
      text: "갓 수확한 채소 🥬",
      color: "bg-purple-50 text-purple-600 border-purple-600/30",
    },
  ];

  // 추천 캡션 클릭 핸들러
  const handleCaptionClick = useCallback(
    (caption: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // 키보드 내려감 방지
      const newText = textInput.trim()
        ? `${textInput.trim()} ${caption}`
        : caption;
      setTextInput(newText);
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    },
    [textInput]
  );

  const loopFilters = useMemo(() => {
    return [...ORIGINAL_FILTERS, ...ORIGINAL_FILTERS, ...ORIGINAL_FILTERS];
  }, []);

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

  // 💡 [수정됨] 키보드 높이 감지 로직 단순화 (강제 적용)
  useEffect(() => {
    if (initialViewportHeight.current === 0) {
      initialViewportHeight.current = window.innerHeight;
    }

    const handleResize = () => {
      if (!window.visualViewport) return;

      const currentVisualHeight = window.visualViewport.height;
      const initialHeight = initialViewportHeight.current;
      
      // 높이 차이 계산
      const diff = initialHeight - currentVisualHeight;

      // 키보드가 올라왔다고 판단되면 무조건 diff만큼 올립니다.
      // (기존의 isLayoutResized 체크를 제거하여 '부족한 현상' 방지)
   if (diff > 80) {
  setKeyboardHeight(diff);
  document.body.style.height = currentVisualHeight + "px";
} else {
  setKeyboardHeight(0);
  document.body.style.height = "";
}
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  // 카메라 스트림 시작
  useEffect(() => {
    if (!permissionsGranted) return;

    const startCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
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
              ? { facingMode: isFrontCamera ? "user" : "environment" }
              : true,
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error: any) {
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
  }, [permissionsGranted, isFrontCamera]);

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

  // Canvas를 사용하여 필터가 적용된 이미지를 생성하는 함수
  const applyFilterToImage = (imageSrc: string, filterString: string): Promise<string> => {
    return new Promise((resolve, reject) => {
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
        
        // Canvas에 필터 적용
        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0);
        
        // Base64로 변환
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      
      img.onerror = () => {
        reject(new Error("Image load failed"));
      };
      
      img.src = imageSrc;
    });
  };

  const handleCapture = async () => {
    if (isUploadMode) {
      if (!selectedImage) {
        setShowNoImageAlert(true);
        return;
      }
      
      // 필터가 적용된 이미지 생성
      let finalImage = selectedImage;
      const currentFilter = ORIGINAL_FILTERS.find((f) => f.name === selectedFilter);
      
      if (currentFilter && currentFilter.filter !== "none") {
        try {
          finalImage = await applyFilterToImage(selectedImage, currentFilter.filter);
        } catch (error) {
          console.error("필터 적용 실패:", error);
          // 필터 적용 실패 시 원본 이미지 사용
        }
      }
      
      onUpload({
        image: finalImage,
        caption: textInput,
        textOverlay: textInput,
        location: locationInput,
        weather: weatherInput,
        time: timeInput,
        health: healthInput,
      });
      toast.success("업로드 되었습니다!");
      return;
    }

    if (hasCameraDevice && videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setSelectedImage(reader.result as string);
              setIsUploadMode(true);
              if (stream) {
                stream.getTracks().forEach((track) => track.stop());
                setStream(null);
              }
            };
            reader.readAsDataURL(blob);
          }
        }, "image/jpeg");
      }
    } else {
      toast.error("카메라를 사용할 수 없습니다.");
    }
  };

  const handleCameraSwitch = () => setIsFrontCamera((prev) => !prev);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsUploadMode(true);
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => setIsDetailEditMode(true);
  const handleCloseDetailEdit = () => setIsDetailEditMode(false);

  const handleTextInput = () => {
    if (showTextInput) {
      setShowTextInput(false);
    } else {
      setShowTextInput(true);
      // 100ms 딜레이 후 포커스 -> 키보드 호출
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  // 더미 핸들러들
  const handleLocationInput = () => setLocationInput("서울시 강남구");
  const handleWeatherInput = () => setWeatherInput("맑음 • 22°C");
  const handleTimeInput = () => {
    const now = new Date();
    setTimeInput(`${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`);
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

  // --------------------------------------------------------------------------
  // [수정] AI 캡션 툴바: 위치 계산 강화
  // --------------------------------------------------------------------------
  const TOOLBAR_HEIGHT = 60;

  const AICaptionToolbar = (
    <motion.div
      key="ai-caption-toolbar"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed left-0 right-0 z-[100] bg-white border-t border-gray-100 flex items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{
        height: `${TOOLBAR_HEIGHT}px`,
        // [핵심] 키보드 높이가 0이더라도, 기본적으로 바닥에 붙어있지 않도록
        // keyboardHeight를 그대로 사용하되, 혹시 모를 안전 영역(Safe Area) 고려
        bottom: `calc(${keyboardHeight}px + env(safe-area-inset-bottom))`,
        paddingBottom: "env(safe-area-inset-bottom)", // 아이폰 홈 바 대응
        boxSizing: "content-box", // 패딩이 높이에 포함되지 않게 설정
      }}
    >
      {/* 좌측: 캡션들 */}
      <div className="flex-1 overflow-x-auto flex items-center px-4 space-x-2 scrollbar-hide h-full">
        {aiCaptions.map((caption, index) => (
          <button
            key={index}
            onMouseDown={handleCaptionClick(caption.text)}
            className={`flex-shrink-0 px-3 py-1.5 text-[13px] font-medium border rounded-full transition-transform active:scale-95 whitespace-nowrap ${caption.color}`}
          >
            {caption.text}
          </button>
        ))}
        <div className="w-2 flex-shrink-0" />
      </div>

      {/* 우측: 완료 버튼 */}
      <div className="flex-shrink-0 pl-2 pr-4 h-full flex items-center border-l border-gray-100 bg-white/95 backdrop-blur-sm">
        <button
          onClick={() => {
            setShowTextInput(false);
            textInputRef.current?.blur();
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors"
        >
          <Check size={16} strokeWidth={3} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
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
            <AlertDialogAction onClick={handleGalleryPermissionAllow}>
              허용
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative w-full h-screen bg-white overflow-hidden">
        <div className="absolute left-0 right-0 top-0 bottom-0 pt-20 pb-[120px] flex justify-center items-center overflow-hidden">
          <div className="w-full h-full flex justify-center items-center px-4">
            <div className="relative h-[85%] w-full bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {selectedImage && (
                <div className="absolute inset-0 bg-white">
                  <ImageWithFallback
                    src={selectedImage}
                    alt="Selected Image"
                    className="w-full h-full object-cover"
                    style={{
                      filter:
                        ORIGINAL_FILTERS.find((f) => f.name === selectedFilter)
                          ?.filter || "none",
                    }}
                  />

                  {showTextInput && (
                    <div className="absolute inset-0 bg-black/50" />
                  )}

                  {(locationInput ||
                    weatherInput ||
                    timeInput ||
                    healthInput) && (
                    <div className="absolute top-4 left-4 flex flex-row flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                      {locationInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <MapPin size={16} className="text-white" />
                          <span className="text-white text-sm">
                            {locationInput}
                          </span>
                        </div>
                      )}
                      {weatherInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Cloud size={16} className="text-white" />
                          <span className="text-white text-sm">
                            {weatherInput}
                          </span>
                        </div>
                      )}
                      {timeInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Clock size={16} className="text-white" />
                          <span className="text-white text-sm">
                            {timeInput}
                          </span>
                        </div>
                      )}
                      {healthInput && (
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                          <Heart size={16} className="text-white" />
                          <span className="text-white text-sm">
                            {healthInput}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* [수정] 입력창 위치 조정 
                      - keyboardHeight가 0이어도(레이아웃 리사이즈 상황),
                        TOOLBAR_HEIGHT 만큼은 무조건 띄웁니다.
                  */}
                  <div
                    className="absolute left-4 right-4 transition-all duration-200 ease-out"
                    style={{
                      bottom:
                        showTextInput && isDetailEditMode
                          ? keyboardHeight > 0
                            ? keyboardHeight + TOOLBAR_HEIGHT + 20
                            : TOOLBAR_HEIGHT + 20 // 키보드가 레이아웃을 밀어도 툴바 위로 올라감
                          : 80,
                    }}
                  >
                    {showTextInput ? (
                      <>
                        <input
                          ref={textInputRef}
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setShowTextInput(false);
                              textInputRef.current?.blur();
                            }
                          }}
                          placeholder="텍스트를 입력하세요"
                          className="w-full text-black text-lg bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md outline-none focus:ring-2 focus:ring-[#36D2C5] placeholder:text-gray-500/70"
                        />
                      </>
                    ) : textInput ? (
                      <div className="w-full text-black text-lg bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-md">
                        {textInput}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {cameraError && !selectedImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
                  <div className="text-center px-6">
                    <Camera size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-white mb-2">{cameraError}</p>
                    <p className="text-gray-400 text-sm">
                      갤러리 버튼을 눌러 사진을 업로드할 수 있습니다.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
                <ArrowLeft size={24} className="text-[#1A1A1A]" />
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
                onClick={handleCloseDetailEdit}
                className="absolute left-4 p-1"
              >
                <X size={24} className="text-[#1A1A1A]" />
              </button>
              <button
                onClick={handleCapture}
                className="absolute right-4 px-4 py-2 text-[#36D2C5] font-semibold"
              >
                완료
              </button>
            </>
          ) : (
            <button onClick={onBack} className="absolute left-4 p-1">
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

        <div className="absolute bottom-0 left-0 right-0 z-10 pt-4 pb-10 bg-white max-w-[500px] mx-auto">
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
                    setSelectedFilter(ORIGINAL_FILTERS[realIndex].name);
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
              {showTextInput && !isMobile ? (
                <div className="w-full h-[64px]" />
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleTextInput}
                    className="flex flex-col items-center gap-2"
                  >
                                      <span className="text-xs text-gray-600">텍스트</span>
                  </button>

                  <button
                    onClick={handleLocationInput}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFF4E5] text-[#FF9800] transition-colors hover:bg-[#FFE8CC]">
                      <MapPin size={24} />
                    </div>
                    <span className="text-xs text-gray-600">위치</span>
                  </button>

                  <button
                    onClick={handleWeatherInput}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#E8F8F7] text-[#36D2C5] transition-colors hover:bg-[#D0F0ED]">
                      <Cloud size={24} />
                    </div>
                    <span className="text-xs text-gray-600">날씨</span>
                  </button>

                  <button
                    onClick={handleTimeInput}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#F3E5F5] text-[#9C27B0] transition-colors hover:bg-[#E1BEE7]">
                      <Clock size={24} />
                    </div>
                    <span className="text-xs text-gray-600">시간</span>
                  </button>

                  <button
                    onClick={handleHealthInput}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#FFEBEE] text-[#F44336] transition-colors hover:bg-[#FFCDD2]">
                      <Heart size={24} />
                    </div>
                    <span className="text-xs text-gray-600">건강</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-gray-100 bg-[#36D2C5] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
              >
                <Upload size={28} className="text-white" />
              </button>
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
                  <Edit size={32} className="" />
                ) : (
                  <ImageIcon size={32} className="" />
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
                onClick={isUploadMode ? handleFilter : handleCameraSwitch}
                className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors"
              >
                {isUploadMode ? (
                  <Sparkles size={32} className="" />
                ) : (
                  <RefreshCw size={32} className="" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

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
              {/* 건강 모달 컨텐츠 생략 (기존과 동일) */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">오늘 운동 기록</h3>
                   <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    <button
                      onClick={() => handleHealthRecordSelect("걸음수 8,542보")}
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <Footprints size={16} className="text-gray-300" />
                      <span className="text-[15px] font-medium">걸음수</span>
                    </button>
                    <button
                      onClick={() => handleHealthRecordSelect("소모칼로리 450kcal")}
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <Flame size={16} className="text-orange-400" fill="currentColor" />
                      <span className="text-[15px] font-medium">소모칼로리</span>
                    </button>
                    <button
                      onClick={() => handleHealthRecordSelect("오른층수 12층")}
                      className="flex items-center gap-1.5 bg-[#555555] text-white px-4 py-2.5 rounded-full whitespace-nowrap"
                    >
                      <TrendingUp size={16} className="text-yellow-500" />
                      <span className="text-[15px] font-medium">오른층수</span>
                    </button>
                  </div>
                </div>
                 {/* ... 나머지 모달 내용들 */}
                  <div className="space-y-3">
                  <h3 className="text-[17px] font-bold text-[#1A1A1A]">
                    오늘 감정 기록
                  </h3>
                  <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {["😄", "😊", "😐", "😔", "😫", "😢", "😭"].map(
                      (emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() =>
                            handleHealthRecordSelect(`오늘의 기분 ${emoji}`)
                          }
                          className="w-11 h-11 flex items-center justify-center bg-[#555555] rounded-full text-2xl shrink-0 hover:bg-[#444444] transition-colors"
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AlertDialog open={showNoImageAlert}>
        <AlertDialogContent className="max-w-[340px]">
          <AlertDialogHeader>
            <AlertDialogTitle>이미지 선택 필요</AlertDialogTitle>
            <AlertDialogDescription>
              사진을 선택하거나 촬영한 후 업로드할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowNoImageAlert(false)}>
              닫기
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* [중요] AI 캡션 툴바 위치: 
        showTextInput이 true일 때만 표시 (= 텍스트창 활성화 시)
      */}
      <AnimatePresence>
        {selectedImage && showTextInput && AICaptionToolbar}
      </AnimatePresence>
    </>
  );
}