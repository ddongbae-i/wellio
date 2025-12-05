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

  const isIOS =
    typeof window !== "undefined" &&
    /iP(hone|od|ad)/.test(window.navigator.userAgent);

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
  const aiCaptionTapRef = useRef(false);

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
    (caption: string) => {
      const combined = textInput.trim()
        ? `${textInput.trim()} ${caption}`
        : caption;

      const newText = applyTextLimit(combined);
      setTextInput(newText);

      // 포커스 유지 / 되살리기
      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });
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

  useEffect(() => {
    // 페이지가 보일 때마다 모든 state 초기화
    return () => {
      // ✅ 컴포넌트 언마운트 시 카메라 스트림 정리
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // 컴포넌트 언마운트 시에도 정리
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
    };
  }, []);
  // 카메라 스트림 시작
  useEffect(() => {
    if (!permissionsGranted || isUploadMode) return;

    // startCamera 내부 수정

    const startCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        // 1. 장치 리스트를 가져오긴 하지만, 개수 체크(length > 1) 로직은 제거합니다.
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");

        // 카메라가 아예 없는 경우에만 에러 처리
        if (videoDevices.length === 0 && devices.length > 0) {
          // devices.length > 0 체크는 초기 로딩 시 빈 배열일 수 있어 방어적으로 넣음
          // 하지만 모바일 환경에서는 보통 무시하고 진행해도 facingMode가 동작합니다.
        }

        let videoConstraints: MediaTrackConstraints | boolean;

        // 2. 조건문 없이 바로 OS별 제약 조건을 설정합니다.
        if (isIOS) {
          // iOS: exact를 써야 후면이 확실히 잡힙니다.
          videoConstraints = {
            facingMode: isFrontCamera
              ? { exact: "user" }
              : { exact: "environment" } // isFrontCamera가 false면 여기(후면) 실행
          };
        } else {
          // Android/PC: ideal을 사용 (PC 웹캠 등 고려)
          videoConstraints = {
            facingMode: isFrontCamera ? "user" : "environment"
          };
        }

        const constraints: MediaStreamConstraints = {
          video: videoConstraints,
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);

        setStream(newStream);
        setCameraError(null);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error("카메라 접근 실패:", error);
        // iOS에서 exact: environment 요청 시 후면 카메라를 못 찾으면 OverconstrainedError가 날 수 있음
        // 이 경우 폴백으로 기본 카메라를 켭니다.
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) videoRef.current.srcObject = fallbackStream;
        } catch (fallbackError) {
          setCameraError("카메라를 시작할 수 없습니다.");
        }
      }
    };

    startCamera();

    return () => {
      // ✅ 카메라 정리
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("🛑 카메라 트랙 정지:", track.label);
        });
      }
    };
  }, [permissionsGranted, isFrontCamera, isUploadMode]); // ✅ isIOS 제거!

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


  const applyFilterToImage = (
    imageSrc: string,
    filterString: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      // 필터가 없으면 원본 반환
      if (!filterString || filterString === "none") {
        resolve(imageSrc);
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          // 원본 이미지 크기 그대로 사용
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (!ctx) {
            resolve(imageSrc);
            return;
          }

          // 🎨 핵심: 필터 적용
          ctx.filter = filterString;

          // 이미지 그리기
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // 필터 해제
          ctx.filter = "none";

          // 결과 반환 (JPEG 품질 0.95)
          const result = canvas.toDataURL("image/jpeg", 0.95);
          resolve(result);
        } catch (error) {
          console.error("필터 적용 실패:", error);
          resolve(imageSrc); // 실패 시 원본 반환
        }
      };

      img.onerror = () => {
        console.error("이미지 로드 실패");
        resolve(imageSrc);
      };

      img.src = imageSrc;
    });
  };
  const handleCapture = async () => {
    // [CASE 1] 업로드 모드일 때: 최종 업로드 처리
    if (isUploadMode) {
      if (!selectedImage) {
        setShowNoImageAlert(true);
        return;
      }

      // 1. 기본적으로 선택된 이미지를 사용
      let finalImage = selectedImage;

      // 2. 선택된 필터 정보 가져오기
      const currentFilter = ORIGINAL_FILTERS.find(
        (f) => f.name === selectedFilter,
      );

      // 3. 필터가 'Normal'이 아니라면 필터 적용 함수 실행
      if (currentFilter && currentFilter.filter !== "none") {
        try {
          // ✅ 여기서 필터가 적용된 새 이미지 문자열(Base64)을 받아옵니다.
          const filteredImage = await applyFilterToImage(
            selectedImage,
            currentFilter.filter,
          );

          // 변환된 이미지가 유효하면 교체
          if (filteredImage && filteredImage.length > 100) {
            finalImage = filteredImage;
            console.log("✨ 필터 적용 완료:", currentFilter.name);
          }
        } catch (error) {
          console.error("필터 적용 에러, 원본으로 업로드합니다:", error);
        }
      }

      const today = new Date();
      const createdAt = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

      // 4. 최종 이미지(finalImage)를 업로드
      onUpload({
        image: finalImage, // 👈 여기가 필터 먹인 이미지여야 함
        caption: textInput,
        textOverlay: textInput,
        location: locationInput,
        weather: weatherInput,
        time: timeInput,
        health: healthInput,
        createdAt,
      });

      // 초기화 로직
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
      onBack();
      return;
    }

    // [CASE 2] 카메라 촬영 모드 (이전 답변의 수정된 코드 유지)
    if (videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // 좌우 반전 처리 (셀카 모드일 때 거울모드처럼 보이게 하려면 필요)
      // ctx.scale(isFrontCamera ? -1 : 1, 1);

      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
          const capturedImage = reader.result as string;
          setSelectedImage(capturedImage);
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
        setSelectedImage(originalImage);
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
    setLocationInput("소래산");
  const handleWeatherInput = () =>
    setWeatherInput("12°C");
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
  const handleHealthRecordSelect = (record: string, icon?: string | null) => {
    setHealthInput(record);
    setHealthIcon(icon ?? null);
    setShowHealthModal(false);
  };
  const handleFilter = () => {
    setIsFilterMode(true);
    setPreviousFilter(selectedFilter);
  };

  // 텍스트 인풋/캡슐 bottom 위치 (카드 안에서 12px)
  const getTextBottom = () => 12;

  // ✅ 캡션 바: 항상 "현재 뷰포트"의 바닥 (키보드 위) 에 고정


  // ... 상단 import 부분에 FreeMode가 있는지 확인해주세요.
  // import { FreeMode } from "swiper/modules"; 

  // ✅ 캡션 바 컴포넌트 수정
  const AICaptionToolbar: React.FC = () => {
    // 🔹 모바일 탭/스와이프 구분용
    const touchStartRef = useRef<{
      x: number;
      y: number;
      time: number;
    } | null>(null);

    const MOVE_THRESHOLD = 10;
    const TIME_THRESHOLD = 250;

    // 🔹 데스크탑용 드래그 스크롤
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const startScrollLeftRef = useRef(0);
    const draggedRef = useRef(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      // ✅ 버튼 클릭은 제외
      if ((e.target as HTMLElement).tagName === 'BUTTON') return;
      if (e.pointerType !== "mouse" || e.button !== 0) return;

      isDraggingRef.current = true;
      draggedRef.current = false;
      dragStartXRef.current = e.clientX;
      startScrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0;

      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || !scrollRef.current) return;

      const dx = e.clientX - dragStartXRef.current;

      if (Math.abs(dx) > 3) {
        draggedRef.current = true;
      }

      scrollRef.current.scrollLeft = startScrollLeftRef.current - dx;
      e.preventDefault();
    };

    const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      isDraggingRef.current = false;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    };

    return (
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
          bottom: isKeyboardVisible ? 40 : 0,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="px-5 pt-5 pb-6">
          <p className="text-[15px] font-semibold text-[#2b2b2b] mb-3">
            AI 추천 캡션
          </p>

          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing"
            style={{
              WebkitOverflowScrolling: "touch",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {aiCaptions.map((caption, index) => (
              <button
                key={index}
                className="ai-caption-button flex-shrink-0 px-5 py-2 text-[14px] font-normal border rounded-full whitespace-nowrap bg-white text-[#555555] border-[#d9d9d9] active:bg-gray-100 transition-colors"
                onClick={(e) => {
                  if (draggedRef.current) {
                    draggedRef.current = false;
                    e.preventDefault();
                    return;
                  }
                  handleCaptionClick(caption.text);
                  requestAnimationFrame(() => {
                    textInputRef.current?.focus();
                  });
                }}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  touchStartRef.current = {
                    x: t.clientX,
                    y: t.clientY,
                    time: Date.now(),
                  };
                }}
                onTouchEnd={(e) => {
                  const start = touchStartRef.current;
                  if (!start) return;

                  const t = e.changedTouches[0];
                  const dx = Math.abs(t.clientX - start.x);
                  const dy = Math.abs(t.clientY - start.y);
                  const dt = Date.now() - start.time;

                  const isTap =
                    dx < MOVE_THRESHOLD &&
                    dy < MOVE_THRESHOLD &&
                    dt < TIME_THRESHOLD;

                  if (isTap) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCaptionClick(caption.text);
                    requestAnimationFrame(() => {
                      textInputRef.current?.focus();
                    });
                  }

                  touchStartRef.current = null;
                }}
                onPointerDown={(e) => {
                  // ✅ 포커스 유지
                  e.preventDefault();
                }}
              >
                {caption.text}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {/* 커스텀 알럿들 */}
      <CustomAlert
        open={showCameraPermission}
        onClose={handlePermissionDeny}
        onConfirm={handleCameraPermissionAllow}
        title="카메라 권한 허용"
        description="사진을 촬영하려면 카메라 접근 권한이 필요합니다."
        cancelText="거부"
        confirmText="허용"
      />

      <CustomAlert
        open={showGalleryPermission}
        onClose={handlePermissionDeny}
        onConfirm={handleGalleryPermissionAllow}
        title="갤러리 권한 허용"
        description="사진을 업로드하려면 갤러리 접근 권한이 필요합니다."
        cancelText="거부"
        confirmText="허용"
      />

      <CustomAlert
        open={showNoImageAlert}
        onClose={() => setShowNoImageAlert(false)}
        title="이미지 선택 필요"
        description="사진을 선택하거나 촬영한 후 업로드할 수 있습니다."
        cancelText="닫기"
      />

      <CustomAlert
        open={showLeaveDetailAlert}
        onClose={() => setShowLeaveDetailAlert(false)}
        onConfirm={() => {
          setShowLeaveDetailAlert(false);
          handleCloseDetailEdit();
        }}
        title="꾸미기를 그만두시겠습니까?"
        description="지금까지 꾸민내용 모두 사라집니다."
        cancelText="계속하기"
        confirmText="그만하기"
      />

      <CustomAlert
        open={showLeaveUploadAlert}
        onClose={() => setShowLeaveUploadAlert(false)}
        onConfirm={() => {
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
          setHealthIcon(null);
        }}
        title="작성을 취소할까요?"
        description="지금까지 작성한 내용이 모두 사라집니다."
        cancelText="아니오"
        confirmText="예"
      />

      {/* 메인 래퍼 */}
      <div className="relative w-full min-h-screen bg-[#f7f7f7] overflow-x-hidden">
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
                                {healthIcon && (
                                  <img
                                    src={healthIcon}
                                    alt=""
                                    className="w-[18px] h-[18px]"
                                  />
                                )}
                                <span className="text-[#555555] text-[15px]">
                                  {healthInput}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHealthInput("");
                                    setHealthIcon(null);
                                  }}
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
                            onBlur={(e) => {
                              // ✅ AI 캡션 버튼 클릭인지 확인
                              const relatedTarget = e.relatedTarget as HTMLElement;
                              const clickedAICaption = relatedTarget?.closest('.ai-caption-button');

                              if (clickedAICaption) {
                                // AI 캡션 버튼 클릭 시에는 포커스 유지
                                return;
                              }

                              setIsTextInputFocused(false);
                              setShowTextInput(false);
                            }}
                            placeholder="텍스트를 입력하세요"
                            className="w-full text-[#555555] text-[15px] bg-white/80 backdrop-blur-sm px-5 py-2 rounded-[50px] outline-none placeholder:text-[#aeaeae] border border-[#ffffff]"
                            style={{ fontSize: '16px' }}
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
                className="absolute left-5 xs:left-6 sm:left-8 p-1"
              >
                <img
                  src={ChevronLeft}
                  alt="뒤로가기"
                  className="w-6 h-6"
                />
              </button>
              <button
                onClick={() => setIsFilterMode(false)}
                className="absolute right-5 xs:right-6 sm:right-8 px-4 py-2 text-[#555555] font-medium text-[17px]"
              >
                완료
              </button>
            </>
          ) : isDetailEditMode ? (
            <>
              <button
                onClick={handleCloseDetailEdit}
                className="absolute left-5 xs:left-6 sm:left-8"
              >
                <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setShowTextInput(false);
                  textInputRef.current?.blur();
                  setIsDetailEditMode(false);
                }}
                className="absolute right-5 xs:right-6 sm:right-8 px-4 py-2 text-[#555555] font-medium text-[17px]"
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
              className="absolute left-5 xs:left-6 sm:left-8"
            >
              <img
                src={ChevronLeft}
                alt="뒤로가기"
                className="w-6 h-6"
              />
            </button>
          )}

          <h1 className="text-[19px] font-semibold text-[#202020] text-center">
            업로드
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
            <div className="w-full relative flex items-center justify-center mt-3">
              {/* 가운데 선택 가이드 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
                <div className="w-[68px] h-[68px] rounded-full border-[3px] border-[#36D2C5]" />
              </div>

              <div className="w-full h-full z-20 pointer-events-auto">
                <Swiper
                  spaceBetween={14}
                  slidesPerView="auto"
                  className="w-full h-28"
                  grabCursor={true}
                  resistanceRatio={0}
                  touchStartPreventDefault={false}
                  touchMoveStopPropagation={false}
                  style={{
                    touchAction: "manipulation",
                    WebkitUserSelect: "none",
                    cursor: "grab",
                  }}
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
                          type="button"
                          onClick={() => setSelectedFilter(filter.name)}
                          className={`flex items-center justify-center select-none transition-all duration-200 ${isActive ? "scale-105" : "scale-95"
                            }`}
                        >
                          <div
                            className={`
              relative
              w-16 h-16 rounded-full overflow-hidden
              flex items-center justify-center
              shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]
              transition-all duration-200
              ${isActive
                                ? "bg-white border-[4px] border-[#2ECACA]"
                                : "bg-[#EEEEEE]"
                              }
            `}
                          >
                            {!isActive && selectedImage && (
                              <ImageWithFallback
                                src={selectedImage}
                                alt={filter.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                  filter: filter.filter,
                                  opacity: 0.3,
                                }}
                              />
                            )}

                            <span className="relative z-10 text-[10px] font-medium tracking-wide text-[#555555]">
                              {filter.name.toUpperCase()}
                            </span>
                          </div>
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
                    className="w-[70px] h-[70px] rounded-full bg-[#2ECACA] hover:bg-[#00C2B3] transition-colors flex items-center justify-center"
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
                className={`w-[70px] h-[70px] rounded-full transition-colors flex items-center justify-center ${isUploadMode
                  ? "bg-[#2ECACA] hover:bg-[#00C2B3]"
                  : "border-[3px] border-[#2ECACA] bg-white"
                  }`}
              >
                {isUploadMode ? (
                  <img src={Upload} alt="업로드" className="w-[35px] h-[35px]" />
                ) : (
                  <div className="w-[60px] h-[60px] rounded-full bg-white" />
                )}
              </button>

              <button
                onClick={
                  isUploadMode ? handleFilter : handleCameraSwitch
                }
                className="w-[50px] h-[50px] flex items-center justify-center rounded-full border boder-[#e8e8e8] bg-[#f0f0f0] text-gray-500 transition-colors hover:bg-gray-200"
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

      {/* 건강 기록 모달 - ✅ 스와이퍼 추가 */}
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
              className="relative w-full max-w-[500px] bg-white rounded-t-[16px] pt-[30px] pb-[40px] shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]"
            >

              <div className="space-y-6">
                {/* 오늘 운동 기록 - 스와이퍼 */}
                <div className="space-y-3">
                  <h3 className="text-[17px] font-medium text-[#202020] px-5 xs:px-6 sm:px-8">
                    오늘 운동 기록
                  </h3>
                  <div className="pl-5 xs:pl-6 sm:pl-8">
                    <Swiper
                      modules={[FreeMode, Mousewheel]}
                      slidesPerView="auto"
                      spaceBetween={12}
                      freeMode={true}
                      grabCursor={true}
                      mousewheel={true}
                      className="w-full !overflow-visible"
                    >
                      {[
                        { label: "👟 걸음수", value: "👟 8,542보" },
                        { label: "🔥 소모칼로리", value: "🔥 450kcal" },
                        { label: "🪜 오른층수", value: "🪜 12층" },
                      ].map((item, idx) => (
                        <SwiperSlide key={idx} style={{ width: "auto" }}>
                          <button
                            onClick={() => handleHealthRecordSelect(item.value)}
                            className="flex items-center gap-2 bg-[#555555] text-white px-4 py-2 rounded-full whitespace-nowrap"
                          >
                            <span className="text-[15px] font-medium">
                              {item.label}
                            </span>
                          </button>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>

                  {/* 오늘 감정 기록 - 스와이퍼 */}
                  <div className="space-y-3">
                    <h3 className="text-[17px] font-medium text-[#202020] px-5 xs:px-6 sm:px-8">
                      오늘 감정 기록
                    </h3>
                    <div className="pl-5 xs:pl-6 sm:pl-8">
                      <Swiper
                        modules={[FreeMode, Mousewheel]}
                        slidesPerView="auto"
                        spaceBetween={12}
                        freeMode={true}
                        grabCursor={true}
                        mousewheel={true}
                        className="w-full"
                        touchStartPreventDefault={false}
                      >
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
                          <SwiperSlide key={idx} style={{ width: "auto" }}>
                            <button
                              onClick={() =>
                                handleHealthRecordSelect(`${emoji}`)
                              }
                              className="px-4 py-2 flex items-center justify-center bg-[#555555] rounded-[30px] text-[14px] shrink-0 hover:bg-[#444444] transition-colors "
                            >
                              {emoji}
                            </button>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>

                  {/* 진행중인 챌린지 - 스와이퍼 */}
                  <div className="space-y-3">
                    <h3 className="text-[17px] font-medium text-[#202020] px-5 xs:px-6 sm:px-8">
                      진행중인 챌린지
                    </h3>
                    <div className="pl-5 xs:pl-6 sm:pl-8">
                      <Swiper
                        modules={[FreeMode, Mousewheel]}
                        slidesPerView="auto"
                        spaceBetween={12}
                        freeMode={true}
                        grabCursor={true}
                        mousewheel={true}
                        className="w-full "
                        touchStartPreventDefault={false}
                      >
                        {[
                          { text: "월 15만보 걷기", icon: WalkIcon },
                          { text: "주 1회 함께 걷기", icon: TogetherIcon },
                          { text: "건강한 습관 만들기", icon: HabitIcon },
                          { text: "가족 건강 상위 10%", icon: TrophyIcon },
                        ].map((item, idx) => (
                          <SwiperSlide key={idx} style={{ width: "auto" }}>
                            <button
                              onClick={() => handleHealthRecordSelect(item.text, item.icon)}
                              className="px-4 py-2 flex items-center gap-2 bg-[#555555] rounded-[30px] text-[14px] shrink-0 hover:bg-[#444444] transition-colors text-white"
                            >
                              <img
                                src={item.icon}
                                alt=""
                                className="w-4 h-4 object-contain"
                              />
                              <span>{item.text}</span>
                            </button>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div >
        )
        }
      </AnimatePresence >

      {/* AI 추천 캡션 바 */}
      <AnimatePresence>
        {
          selectedImage &&
          isDetailEditMode &&
          showTextInput &&
          isTextInputFocused && <AICaptionToolbar />
        }
      </AnimatePresence >
    </>
  );
}