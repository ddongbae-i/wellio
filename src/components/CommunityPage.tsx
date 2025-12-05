"use client";

import { Heart, Plus, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import "swiper/css";
import Bell from "../assets/images/icon_alarm.svg";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import ChevronDown from "../assets/images/icon_chevron_down_20.svg";
import Search from "../assets/images/icon_search.svg";
import LayoutGrid from "../assets/images/Icon_View.svg";
import Calendar from "../assets/images/icon_com_calendar.svg";
import { patientMap, type PatientId } from "./userProfiles";
import Reaction from "../assets/images/icon_reaction.svg";
import SearchColor from "../assets/images/icon_search_color.svg";
import MapPin from "../assets/images/icon_com_map.svg";
import Cloud from "../assets/images/icon_com_sun.svg";
import Clock from "../assets/images/icon_com_time.svg";
import Data from "../assets/images/icon_com_data.svg";
import X from "../assets/images/icon_com_x.svg";

interface CommunityPageProps {
  onBack: () => void;
  onUploadClick: () => void;
  onNotificationClick?: () => void;
  onDeletePost?: (postId: number) => void;
  initialPostId?: number; // 캘린더에서 클릭한 포스트 ID
  posts: Array<{
    id: number;
    image: string;
    badge?: {
      text: string;
      icon?: string; // SVG 이미지 경로
    };
    userAvatar: string;
    caption: string;
    userName: string;
    textOverlay?: string;
    location?: string;
    weather?: string;
    time?: string;
    health?: string;
    comments?: Array<{
      userName: string;
      userAvatar: string;
      text: string;
      timestamp: string;
    }>;
    reactions?: Array<{
      emoji: string;
      users: Array<{
        userName: string;
        userAvatar: string;
      }>;
    }>;
  }>;
  currentUserId: PatientId;
  currentUserAvatar?: string;
  currentPage?: string;
  onPageChange?: (page: any) => void;

  // 홈과 동일한 알림 읽음 상태 전달
  hasUnreadNotification?: boolean;
}

interface SearchSuggestionBarProps {
  isKeyboardVisible: boolean;
  onSelect: (keyword: string) => void;
  keyboardOffset: number;
}

const searchSuggestions = [
  "오운완",
  "오챌완",
  "15만보 걷기",
  "응원",
  "혈당",
  "혈압",
];

// === 드롭다운 메뉴용 가족 구성원 ===
const familyMembers = [
  { id: "all", name: "우리가족" },
  { id: "me", name: "김웰리" },
  { id: "mom", name: "엄마" },
  { id: "dad", name: "아빠" },
];

const SearchSuggestionBar: React.FC<SearchSuggestionBarProps> = ({
  isKeyboardVisible,
  onSelect,
  keyboardOffset,
}) => {
  // 🔹 모바일 탭/스와이프 구분용
  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const MOVE_THRESHOLD = 10;   // px
  const TIME_THRESHOLD = 250;  // ms

  // 🔹 데스크탑용 드래그 스크롤
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const draggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 마우스 좌클릭일 때만 (터치는 기본 스크롤 사용)
    if (e.pointerType !== "mouse" || e.button !== 0) return;

    isDraggingRef.current = true;
    draggedRef.current = false;
    dragStartXRef.current = e.clientX;
    startScrollLeftRef.current = scrollRef.current?.scrollLeft ?? 0;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (!scrollRef.current) return;

    const dx = e.clientX - dragStartXRef.current;

    if (Math.abs(dx) > 3) {
      draggedRef.current = true;
    }

    scrollRef.current.scrollLeft = startScrollLeftRef.current - dx;
    e.preventDefault(); // 텍스트 선택 대신 스크롤
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    // 클릭 막기 플래그는 onClick에서 한 번 보고 바로 초기화
  };

  return (
    <AnimatePresence>
      <motion.div
        key="search-suggestion-bar"
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="fixed left-1/2 -translate-x-1/2 z-[100] w-full max-w-[500px] bg-white rounded-t-[16px] shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)]"
        style={{
          bottom: isKeyboardVisible ? `${keyboardOffset}px` : 0,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="px-5 pt-5 pb-6">
          <div className="flex gap-3 items-center mb-3">
            <p className="text-[15px] font-semibold text-[#2b2b2b] ">
              추천 검색어
            </p>
            <span className="text-[12px] font-light text-[#777777]">
              사진에 붙인 태그로만 검색이 가능해요
            </span></div>


          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: "touch" }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {searchSuggestions.map((keyword, index) => (
              <button
                key={index}
                // 🖱 데스크탑 클릭 (드래그 후 클릭은 막기)
                onClick={(e) => {
                  if (draggedRef.current) {
                    // 드래그로 스크롤하다가 손 뗀 경우 → 클릭 무시
                    draggedRef.current = false;
                    e.preventDefault();
                    return;
                  }
                  onSelect(keyword);
                }}
                // 📱 모바일 터치: 탭만 선택, 스와이프는 스크롤
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
                    onSelect(keyword);
                  }

                  touchStartRef.current = null;
                }}
                className="flex-shrink-0 px-5 py-2 text-[14px] font-normal border rounded-full whitespace-nowrap bg-white text-[#555555] border-[#d9d9d9] active:bg-gray-100 transition-colors"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};



// === 드롭다운 컴포넌트 ===
const FamilyDropdown = ({
  showFamilyDropdown,
  setShowFamilyDropdown,
  selectedFamilyMember,
  setSelectedFamilyMember,
  currentUserName,
}: {
  showFamilyDropdown: boolean;
  setShowFamilyDropdown: (show: boolean) => void;
  selectedFamilyMember: string | null;
  setSelectedFamilyMember: (member: string | null) => void;
  currentUserName: string;
}) => (
  <AnimatePresence>
    {showFamilyDropdown && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-fit bg-white rounded-2xl shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] z-50 overflow-hidden border border-gray-100"
      >
        <div className="p-2 min-w-[140px]">
          {familyMembers.map((member) => {
            const memberName =
              member.id === "me" ? currentUserName : member.name;
            const isSelected =
              (member.id === "all" && !selectedFamilyMember) ||
              selectedFamilyMember === memberName;

            return (
              <button
                key={member.id}
                onClick={() => {
                  if (member.id === "all") {
                    setSelectedFamilyMember(null);
                  } else {
                    setSelectedFamilyMember(memberName);
                  }
                  setShowFamilyDropdown(false);
                }}
                className={`w-full flex items-center px-6 py-3 rounded-[12px] transition-colors text-[15px] font-medium whitespace-nowrap justify-start
                  ${isSelected
                    ? "text-[#2b2b2b] bg-white"
                    : "text-[#2b2b2b] hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`${isSelected
                    ? "text-[#2b2b2b] font-medium"
                    : "text-[#aeaeae] font-normal"
                    } leading-[1.3]`}
                >
                  {memberName}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export function CommunityPage({
  onBack,
  onUploadClick,
  onNotificationClick,
  onDeletePost,
  initialPostId,
  posts,
  currentUserId,
  currentPage,
  onPageChange,
  hasUnreadNotification: hasUnreadNotificationFromParent,
}: CommunityPageProps) {
  const isIOS =
    typeof window !== "undefined" &&
    /iP(hone|od|ad)/.test(window.navigator.userAgent);

  const [localPosts, setLocalPosts] = useState(() => posts);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const [selectedFamilyMember, setSelectedFamilyMember] =
    useState<string | null>(null);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [isReactionView, setIsReactionView] = useState(false);

  const [reactionFilter, setReactionFilter] = useState("ALL");

  const [selectedPostForReaction, setSelectedPostForReaction] =
    useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<number | null>(null);
  const [emojiAnimation, setEmojiAnimation] = useState<{
    emoji: string;
    active: boolean;
  } | null>(null);

  // 라이트박스 상태
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [lastExpandedId, setLastExpandedId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);

  const [isScrolling, setIsScrolling] = useState(false);
  const blurByClickRef = useRef(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // 키보드 & 뷰포트 높이
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [screenHeight, setScreenHeight] = useState<number | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // === 유저 프로필 (없으면 김웰리로 기본값) ===
  const currentUserProfile =
    patientMap[currentUserId as PatientId] ?? patientMap["kim-welly"];

  const fallbackAvatar =
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80";

  const currentUserName = currentUserProfile.name;
  const currentUserAvatar = currentUserProfile.avatar || fallbackAvatar;

  const currentUser = {
    userName: currentUserName,
    userAvatar: currentUserAvatar,
  };

  // === 이름 → 아바타 매핑 (프로필/댓글/리액션 통일) ===
  const userAvatarFromProfile: Record<string, string> = Object.fromEntries(
    Object.values(patientMap).map((p) => [p.name, p.avatar]),
  );

  const getAvatarForUserName = (name: string, fallback?: string) =>
    userAvatarFromProfile[name] || fallback || fallbackAvatar;

  const [addedComments, setAddedComments] = useState<{
    [postId: number]: Array<{
      userName: string;
      userAvatar: string;
      text: string;
      timestamp: string;
    }>;
  }>({});

  const [addedReactions, setAddedReactions] = useState<{
    [postId: number]: Array<{
      emoji: string;
      users: Array<{
        userName: string;
        userAvatar: string;
      }>;
    }>;
  }>({});

  const emojis = ["❤️", "🔥", "👍", "🎉"];

  // 이모지 떠오르는 애니메이션
  const [floatingEmojis, setFloatingEmojis] = useState<
    Array<{
      id: number;
      emoji: string;
      x: number;
      size: number;
      wobble: number;
      delay: number;
    }>
  >([]);


  // ✅ 특정 게시글의 댓글을 읽었는지 기록
  const [readCommentPosts, setReadCommentPosts] = useState<
    Record<number, boolean>
  >({});

  // ✅ iPhone 텍스트 입력 시 자동 줌 방지
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      );
    }
  }, []);

  function getMaxCommentLength(value: string) {
    const hasKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value);
    return hasKorean ? 28 : 33;
  }

  const triggerReactionAnimation = (emoji: string) => {
    if (emoji === "🎉") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      return;
    }

    const count = Math.floor(Math.random() * 9) + 4;
    const newEmojis = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      emoji: emoji,
      x: (Math.random() - 0.5) * 480,
      size: Math.random() * 90 + 30,
      wobble: (Math.random() - 0.5) * 60,
      delay: Math.random() * 2,
    }));
    setFloatingEmojis((prev) => [...prev, ...newEmojis]);

    setTimeout(() => {
      setFloatingEmojis((prev) =>
        prev.filter((e) => !newEmojis.some((ne) => ne.id === e.id)),
      );
    }, 5000);
  };

  const handleAddComment = (postId: number) => {
    if (!newComment.trim()) return;

    const now = new Date();
    const timeString = `${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newCommentObj = {
      userName: currentUser.userName,
      userAvatar: currentUser.userAvatar,
      text: newComment,
      timestamp: timeString,
    };

    setAddedComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj],
    }));

    setNewComment("");
    setSelectedPostForReaction(postId);
  };

  const handleEmojiReaction = (emoji: string, postId: number) => {
    setEmojiAnimation({ emoji, active: true });

    setAddedReactions((prev) => {
      const existingReactions = prev[postId] || [];

      // 1) 먼저 이 게시글에서 "나"가 눌렀던 모든 이모지에서 제거
      const reactionsWithoutMe = existingReactions
        .map((reaction) => ({
          ...reaction,
          users: reaction.users.filter(
            (u) => u.userName !== currentUser.userName,
          ),
        }))
        // 유저가 하나도 안 남은 이모지는 삭제
        .filter((reaction) => reaction.users.length > 0);

      // 2) 이제 새로 누른 이모지에만 "나" 추가
      const targetIndex = reactionsWithoutMe.findIndex(
        (r) => r.emoji === emoji,
      );

      if (targetIndex >= 0) {
        const updated = [...reactionsWithoutMe];
        updated[targetIndex] = {
          ...updated[targetIndex],
          users: [...updated[targetIndex].users, currentUser],
        };
        return {
          ...prev,
          [postId]: updated,
        };
      } else {
        return {
          ...prev,
          [postId]: [
            ...reactionsWithoutMe,
            {
              emoji,
              users: [currentUser],
            },
          ],
        };
      }
    });

    setTimeout(() => {
      setEmojiAnimation(null);
    }, 2000);
  };

  const getAllComments = (postId: number, originalComments?: Array<any>) => {
    const original = originalComments || [];
    const added = addedComments[postId] || [];
    return [...original, ...added];
  };

  const getAllReactions = (postId: number, originalReactions?: Array<any>) => {
    const original = originalReactions || [];
    const added = addedReactions[postId] || [];

    const merged: { [emoji: string]: Array<any> } = {};

    [...original, ...added].forEach((reaction) => {
      if (merged[reaction.emoji]) {
        const existingUsers = merged[reaction.emoji];
        const newUsers = reaction.users.filter(
          (newUser: any) =>
            !existingUsers.some(
              (existingUser: any) =>
                existingUser.userName === newUser.userName,
            ),
        );
        merged[reaction.emoji] = [...existingUsers, ...newUsers];
      } else {
        merged[reaction.emoji] = [...reaction.users];
      }
    });

    return Object.entries(merged).map(([emoji, users]) => ({
      emoji,
      users,
    }));
  };


  // ✅ 최종: 부모에서 넘겨주면 그 값 우선, 아니면 댓글 기준으로 계산
  const hasUnreadNotification = !!hasUnreadNotificationFromParent;

  const getFilteredReactionPosts = () => {
    const myReactedPosts = posts.filter((post) => {
      if (!post.image) return false;

      const hasMyComment = addedComments[post.id]?.some(
        (comment) => comment.userName === currentUser.userName,
      );

      const hasMyAddedReaction = addedReactions[post.id]?.some((reaction) =>
        reaction.users.some((user) => user.userName === currentUser.userName),
      );

      const hasMyOriginalReaction = post.reactions?.some((reaction) =>
        reaction.users.some((user) => user.userName === currentUser.userName),
      );

      const hasMyReaction =
        hasMyComment || hasMyAddedReaction || hasMyOriginalReaction;

      if (selectedFamilyMember) {
        const isMe = selectedFamilyMember === currentUserName;
        if (isMe) {
          return hasMyReaction && post.userName === currentUserName;
        } else {
          const nameMapping: { [key: string]: string } = {
            엄마: "박승희",
            아빠: "김동석",
          };
          const actualName =
            nameMapping[selectedFamilyMember] || selectedFamilyMember;
          return hasMyReaction && post.userName === actualName;
        }
      }

      return hasMyReaction;
    });

    if (reactionFilter === "ALL") {
      return myReactedPosts;
    }

    return myReactedPosts.filter((post) => {
      const hasAddedReaction = addedReactions[post.id]?.some(
        (reaction) =>
          reaction.emoji === reactionFilter &&
          reaction.users.some((u) => u.userName === currentUser.userName),
      );

      const hasOriginalReaction = post.reactions?.some(
        (reaction) =>
          reaction.emoji === reactionFilter &&
          reaction.users.some((u) => u.userName === currentUser.userName),
      );

      return hasAddedReaction || hasOriginalReaction;
    });
  };

  const handleConfirmDelete = () => {
    if (!postToDelete) return;

    // ✅ 1) 화면에서 즉시 제거
    setLocalPosts((prev) => prev.filter((post) => post.id !== postToDelete));

    // ✅ 2) 부모에도 삭제 알림 (있을 경우)
    onDeletePost?.(postToDelete);

    // ✅ 3) 상태 정리
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  const handleCloseLightbox = () => {
    setLastExpandedId(expandedPostId);
    setExpandedPostId(null);
  };

  const filteredPosts = localPosts.filter((post) => {
    if (selectedFamilyMember) {
      const isMe = selectedFamilyMember === currentUserName;
      if (isMe) {
        if (post.userName !== currentUser.userName) {
          return false;
        }
      } else {
        const nameMapping: { [key: string]: string } = {
          엄마: "박승희",
          아빠: "김동석",
        };
        const actualName =
          nameMapping[selectedFamilyMember] || selectedFamilyMember;
        if (post.userName !== actualName) {
          return false;
        }
      }
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const caption = post.caption?.toLowerCase() || "";
    const textOverlay = post.textOverlay?.toLowerCase() || "";
    const health = post.health?.toLowerCase() || "";
    const userName = post.userName?.toLowerCase() || "";

    return (
      caption.includes(query) ||
      textOverlay.includes(query) ||
      health.includes(query) ||
      userName.includes(query)
    );
  });

  const expandedPost = localPosts.find((p) => p.id === expandedPostId);

  // 초기 currentPostId
  useEffect(() => {
    if (filteredPosts.length > 0 && !currentPostId) {
      setCurrentPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, currentPostId]);

  // 캘린더에서 넘어왔을 때 해당 포스트로 스크롤
  useEffect(() => {
    if (!initialPostId) return;
    if (isGridView || isReactionView) return;

    scrollToPost(initialPostId);
  }, [initialPostId, isGridView, isReactionView]);

  // 모바일 키보드 감지
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialHeight = window.innerHeight;
    setScreenHeight(initialHeight);

    const viewport = window.visualViewport;

    const handleResize = () => {
      if (!viewport) return;

      const currentHeight = viewport.height;
      const heightDiff = initialHeight - currentHeight;

      // 키보드가 올라왔는지 판단 (80px 이상 줄어들면 키보드로 간주)
      const keyboardShown = heightDiff > 80;
      setIsKeyboardVisible(keyboardShown);

      // 키보드 높이 계산
      if (keyboardShown) {
        setKeyboardOffset(heightDiff);
      } else {
        setKeyboardOffset(0);
      }
    };

    handleResize();

    if (viewport) {
      viewport.addEventListener("resize", handleResize);
      viewport.addEventListener("scroll", handleResize);
    }

    return () => {
      if (!viewport) return;
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  // 처음 화면 높이 (없으면 800 fallback)
  const baseHeight = screenHeight ?? 800;

  const HEADER_HEIGHT = 110; // 헤더 + 위 여유
  const GNB_HEIGHT = 80;

  // 콘텐츠 영역 높이 (키보드 떠도 처음 높이 기준은 유지)
  const contentHeight =
    isGridView || isReactionView
      ? baseHeight - HEADER_HEIGHT // 그리드/리액션: GNB 없음
      : isKeyboardVisible
        ? baseHeight - HEADER_HEIGHT // 키보드 있을 때도 레이아웃은 그대로, GNB만 숨김
        : baseHeight - HEADER_HEIGHT - GNB_HEIGHT; // 기본: 헤더 + GNB 제외

  // 카드 한 묶음 높이: 항상 일정(키보드 여부 상관 X)
  const cardHeight = baseHeight - 160;

  const scrollToPost = (postId: number) => {
    // 피드가 렌더된 다음에 스크롤해야 해서 살짝 딜레이
    setTimeout(() => {
      const container = scrollContainerRef.current;
      const target = postRefs.current[postId];

      if (container && target) {
        container.scrollTo({
          top: target.offsetTop,
          behavior: "auto", // 바로 점프
        });
      }
    }, 50);
  };

  return (
    <>
      <div
        className="relative bg-[#f7f7f7] flex flex-col max-w-[500px] mx-auto h-screen overflow-hidden"
        onPointerDownCapture={() => {
          blurByClickRef.current = true;
          setTimeout(() => {
            blurByClickRef.current = false;
          }, 0);
        }}
        onClick={() => {
          if (isSearchActive) {
            setIsSearchActive(false);
            setSearchQuery("");
            setIsSearchFocused(false);
          }
        }}
      >
        {/* 헤더 */}
        <header className="sticky top-0 z-30 px-5 xs:px-6 sm:px-8 flex flex-col justify-center w-full max-w-[500px] bg-[#f7f7f7]/80 backdrop-blur-xs relative min-h-[80px]">
          {isSearchActive ? (
            <div
              className="flex items-center gap-3"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button
                onClick={onBack}
                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
              >
                <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
              </button>
              <div
                className={`bg-white rounded-[12px] px-4 py-2 h-10 flex items-center gap-2 transition-all border-[1.6px] flex-1 min-w-0 ${isSearchFocused ? "border-[#2ECACA]" : "border-[#2ECACA]"
                  }`}
              >
                <img
                  src={SearchColor}
                  alt="검색"
                  className="w-6 h-6 flex-shrink-0"
                />
                <input
                  type="text"
                  placeholder="어떤 사진을 찾으시나요?"
                  className="flex-1 bg-transparent outline-none text-[#202020] placeholder:text-[#aeaeae] placeholder:font-normal min-w-0 text-[15px]"
                  style={{ fontSize: "16px" }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  autoFocus
                />
              </div>
              <button
                className="text-[#777777] text-[15px] font-normal flex-shrink-0 whitespace-nowrap px-1"
                onClick={() => {
                  setIsSearchActive(false);
                  setSearchQuery("");
                  setIsSearchFocused(false);
                }}
              >
                취소
              </button>
            </div>
          ) : isReactionView ? (
            <div className="w-full flex items-center justify-center relative">
              <button
                onClick={() => setIsReactionView(false)}
                className="absolute left-0 w-6 h-6 flex items-center justify-center"
              >
                <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
              </button>
              <span className="text-[19px] font-semibold text-[#202020]">
                리액션 모아보기
              </span>
            </div>
          ) : isGridView ? (
            <div className="w-full flex items-center justify-center relative">
              <button
                onClick={() => setIsGridView(false)}
                className="absolute left-0 w-6 h-6 flex items-center justify-center"
              >
                <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
              </button>

              {/* Grid View - 드롭다운 Anchor */}
              <div className="relative z-50">
                <button
                  className="flex items-center gap-1"
                  onClick={() =>
                    setShowFamilyDropdown(!showFamilyDropdown)
                  }
                >
                  <span className="text-[19px] font-semibold text-[#202020]">
                    {selectedFamilyMember
                      ? familyMembers.find(
                        (m) =>
                          (m.id === "me" ? currentUserName : m.name) ===
                          selectedFamilyMember,
                      )?.name || "모아보기"
                      : "모아보기"}
                  </span>
                  <img
                    src={ChevronDown}
                    alt="뒤로가기"
                    className="w-6 h-6 ml-1"
                  />
                </button>
                <FamilyDropdown
                  showFamilyDropdown={showFamilyDropdown}
                  setShowFamilyDropdown={setShowFamilyDropdown}
                  selectedFamilyMember={selectedFamilyMember}
                  setSelectedFamilyMember={setSelectedFamilyMember}
                  currentUserName={currentUserName}
                />
              </div>

              <button
                onClick={() => setIsReactionView(true)}
                className="absolute right-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F5F5]/80 backdrop-blur-md text-gray-500 hover:text-gray-800 transition-colors"
              >
                <img src={Reaction} alt="뒤로가기" className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center relative">
              <button
                onClick={onBack}
                className="absolute left-0 w-6 h-6 flex items-center justify-center"
              >
                <img src={ChevronLeft} alt="뒤로가기" className="w-6 h-6" />
              </button>

              {/* Default View - 드롭다운 Anchor */}
              <div className="relative z-50">
                <button
                  className="flex items-center gap-1"
                  onClick={() =>
                    setShowFamilyDropdown(!showFamilyDropdown)
                  }
                >
                  <span className="text-[19px] font-semibold text-[#202020]">
                    {selectedFamilyMember
                      ? familyMembers.find(
                        (m) =>
                          (m.id === "me" ? currentUserName : m.name) ===
                          selectedFamilyMember,
                      )?.name || "우리가족"
                      : "우리가족"}
                  </span>
                  <img
                    src={ChevronDown}
                    alt="드롭다운"
                    className="w-6 h-6 ml-1"
                  />
                </button>
                <FamilyDropdown
                  showFamilyDropdown={showFamilyDropdown}
                  setShowFamilyDropdown={setShowFamilyDropdown}
                  selectedFamilyMember={selectedFamilyMember}
                  setSelectedFamilyMember={setSelectedFamilyMember}
                  currentUserName={currentUserName}
                />
              </div>

              <div className="absolute right-0 flex items-center gap-4">
                <button
                  className="w-6 h-6 flex items-center justify-center"
                  onClick={() => {
                    setIsSearchActive(true);
                    setIsSearchFocused(true);
                  }}
                >
                  <img src={Search} alt="검색" className="w-6 h-6" />
                </button>

                {/* 알림 + 빨간 점 */}
                <button
                  onClick={onNotificationClick}
                  className="relative w-6 h-6 flex items-center justify-center"
                >
                  <img src={Bell} alt="알림" className="w-6 h-6" />
                  {hasUnreadNotification && (
                    <span className="absolute top-[2px] right-[1px] w-[7px] h-[7px] rounded-full bg-[#FF0000]" />
                  )}
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div
          className="w-full overflow-hidden"
          style={{
            height: contentHeight,
          }}
        >
          {isReactionView ? (
            <div className="pb-20">
              {/* 리액션 필터 바 */}
              <div className="px-5 py-4 flex gap-3 overflow-x-auto scrollbar-hide sticky top-0 z-20 justify-center">
                <button
                  onClick={() => setReactionFilter("ALL")}
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-normal transition-all border-[1px] ${reactionFilter === "ALL"
                    ? "bg-[#BCEEEE] text-[#202020] border-[#BCEEEE] border-[2px]"
                    : "bg-[#F0F0F0] text-[#2b2b2b] border-[#e8e8e8] border-[1px]"
                    }`}
                >
                  ALL
                </button>

                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setReactionFilter(emoji)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-[22px] font-normal transition-all border-[1px] ${reactionFilter === emoji
                      ? "bg-[#BCEEEE] text-[#202020] border-[#BCEEEE] border-[2px]"
                      : "bg-[#F0F0F0] text-[#2b2b2b] border-[#e8e8e8] border-[1px]"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <div className="px-4">
                {getFilteredReactionPosts().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Heart size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-500">
                      {reactionFilter === "ALL"
                        ? "아직 리액션한 게시물이 없습니다"
                        : `${reactionFilter} 반응을 남긴 게시물이 없습니다`}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      댓글이나 이모지를 남겨보세요!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {getFilteredReactionPosts().map((post) => (
                      <motion.div
                        key={post.id}
                        layoutId={`post-${post.id}`}
                        className="aspect-square relative overflow-hidden rounded-[12px] cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          zIndex:
                            expandedPostId === post.id ||
                              lastExpandedId === post.id
                              ? 50
                              : 0,
                        }}
                        onLayoutAnimationComplete={() => {
                          if (lastExpandedId === post.id) {
                            setLastExpandedId(null);
                          }
                        }}
                        onClick={() => {
                          // 리액션 뷰 끄고
                          setIsReactionView(false);
                          // 그리드 뷰도 강제로 끔 → 바로 피드로
                          setIsGridView(false);

                          // 피드가 뜬 뒤에 해당 포스트로 점프
                          scrollToPost(post.id);
                        }}
                      >
                        <ImageWithFallback
                          src={post.image}
                          alt="Community post"
                          className="w-full h-full object-cover bg-gray-100 pointer-events-none"
                        />
                        {reactionFilter !== "ALL" && (
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]">
                            {reactionFilter}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : isGridView ? (
            <div className="px-5 xs:px-6 sm:px-8 py-4 pb-10 h-full overflow-y-auto">
              <div className="grid grid-cols-3 gap-1">
                {filteredPosts
                  .filter((post) => post.image)
                  .map((post) => (
                    <motion.div
                      key={post.id}
                      layoutId={`post-${post.id}`}
                      className="aspect-square relative overflow-hidden rounded-[12px] cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        zIndex:
                          expandedPostId === post.id ||
                            lastExpandedId === post.id
                            ? 50
                            : 0,
                      }}
                      onLayoutAnimationComplete={() => {
                        if (lastExpandedId === post.id) {
                          setLastExpandedId(null);
                        }
                      }}
                      onClick={() => {
                        // 모아보기 끄고 피드로
                        setIsGridView(false);

                        // 피드 렌더 후 해당 카드 위치로 점프
                        scrollToPost(post.id);
                      }}
                    >
                      <ImageWithFallback
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
              </div>
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className={`w-full px-5 xs:px-6 sm:px-8 overflow-y-auto h-full scrollbar-hide snap-y snap-mandatory snap-always ${isKeyboardVisible ? "pb-5" : "justify-center"
                }`}
            >
              {filteredPosts.map((post) => {
                const isDeleting = postToDelete === post.id;
                return (
                  <div
                    ref={(el) => {
                      postRefs.current[post.id] = el;
                    }}
                    className={`flex flex-col items-center w-full gap-4 py-5 xs:py-6 sm:py-8 snap-start snap-always ${isKeyboardVisible
                      ? "justify-start pt-[110px]"
                      : "justify-center "
                      }`}
                    key={post.id}
                    style={{
                      height: cardHeight,
                      minHeight: cardHeight,
                    }}
                  >
                    <div>
                      <div className="relative w-full mx-auto overflow-visible flex-shrink-0 aspect-[335/400]">
                        {post.userName === currentUser.userName &&
                          isDragging && (
                            <div className="absolute inset-y-0 -right-8 w-24 flex items-center justify-start z-0 pr-4">
                              <Trash2
                                size={32}
                                className="text-[#555555]"
                              />
                            </div>
                          )}
                        <motion.div
                          className="relative h-full w-full rounded-2xl overflow-hidden shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] touch-none"
                          drag={
                            !isScrolling && post.userName === currentUser.userName
                              ? "x"
                              : false
                          }
                          dragConstraints={{
                            left: -120,
                            right: 0,
                          }}
                          dragElastic={0.1}
                          dragMomentum={false}
                          dragSnapToOrigin={!isDeleting}
                          animate={{ x: isDeleting ? -200 : 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                          whileDrag={{ scale: 0.98 }}
                          onDragStart={(event, info) => {
                            setDragStartX(info.point.x);
                            setIsDragging(true);
                          }}
                          onDragEnd={(event, info) => {
                            if (info.offset.x < -100) {
                              setPostToDelete(post.id);
                              setShowDeleteModal(true);
                            }
                            setDragStartX(null);
                            setIsDragging(false);
                          }}
                          onClick={() => {
                            if (!dragStartX) {
                              setSelectedPostForReaction(post.id);
                              // ✅ 이 게시글은 댓글을 한 번 본 것으로 처리
                              setReadCommentPosts((prev) => ({
                                ...prev,
                                [post.id]: true,
                              }));
                            }
                          }}
                        >
                          <ImageWithFallback
                            src={post.image}
                            alt="Community post"
                            className="w-full h-full object-cover bg-gray-100 pointer-events-none"
                          />
                          {selectedPostForReaction === post.id && (
                            <div
                              className="absolute inset-0 bg-black/70 z-10 flex flex-col cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPostForReaction(null);
                              }}
                            >
                              {/* 리액션 묶음 표시 */}
                              {getAllReactions(
                                post.id,
                                post.reactions,
                              ).length > 0 && (
                                  <div className="absolute top-4 right-5 flex flex-wrap gap-1 justify-end max-w-[90%] z-20">
                                    {getAllReactions(
                                      post.id,
                                      post.reactions,
                                    ).map((reaction) => (
                                      <div
                                        key={reaction.emoji}
                                        className="rounded-full pl-2 flex items-center gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerReactionAnimation(
                                            reaction.emoji,
                                          );
                                        }}
                                      >
                                        <span className="text-base">
                                          {reaction.emoji}
                                        </span>

                                        <div className="flex -space-x-3">
                                          {reaction.users
                                            .slice(0, 3)
                                            .map((user, userIdx) => (
                                              <ImageWithFallback
                                                key={`${reaction.emoji}-${user.userName}-${userIdx}`}
                                                src={getAvatarForUserName(
                                                  user.userName,
                                                  user.userAvatar,
                                                )}
                                                alt={user.userName}
                                                className={`w-6 h-6 rounded-full object-cover border border-[#f0f0f0] transition-all duration-300 ${userIdx === 0
                                                  ? "ml-0"
                                                  : ""
                                                  }`}
                                                style={{
                                                  zIndex:
                                                    reaction.users.length -
                                                    userIdx,
                                                }}
                                              />
                                            ))}

                                          {reaction.users.length > 3 && (
                                            <div
                                              className="w-7 h-7 rounded-full bg-gray-500/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold border-2 border-white relative"
                                              style={{
                                                zIndex: 0,
                                              }}
                                            >
                                              +{reaction.users.length - 3}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                              {/* Pressed 상태의 프로필 캡슐 */}
                              {(post.textOverlay || post.userName) && (
                                <div className="absolute bottom-5 left-5 flex items-center gap-3 z-20 max-w-[90%]">
                                  <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-4 py-2 gap-2">
                                    <ImageWithFallback
                                      src={getAvatarForUserName(
                                        post.userName,
                                        post.userAvatar,
                                      )}
                                      alt={post.userName}
                                      className="w-10 h-10 rounded-full object-cover border border-[#f0f0f0] -my-4 -ml-2"
                                    />
                                    <p className="text-[15px] text-[#202020] font-medium leading-[1.3] max-w-[85%] truncate flex-shrink">
                                      {post.textOverlay && post.textOverlay.trim()}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {getAllComments(
                                post.id,
                                post.comments,
                              ).length > 0 && (
                                  <div className="absolute bottom-[60px] right-0 flex flex-col gap-5 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20 p-4 scrollbar-hide">
                                    {getAllComments(
                                      post.id,
                                      post.comments,
                                    ).map((comment, idx) => (
                                      <div
                                        key={`comment-${post.id}-${idx}-${comment.userName}-${comment.timestamp}`}
                                        className="inline-flex flex-row-reverse items-center bg-[#f0f0f0]/70 backdrop-blur-sm rounded-full pl-4 pr-[1px] py-2"
                                      >
                                        <ImageWithFallback
                                          src={getAvatarForUserName(
                                            comment.userName,
                                            comment.userAvatar,
                                          )}
                                          alt={comment.userName}
                                          className="w-[35px] h-[35px] border border-[#f0f0f0] rounded-full object-cover -my-4 -mr-5"
                                        />
                                        <p className="text-[15px] text-[#202020] font-medium leading-[1.4] max-w-[85%] truncate flex-shrink mr-1">
                                          {comment.text}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          )}

                          {selectedPostForReaction !== post.id && (
                            <>
                              <div className="absolute top-4 left-4 flex flex-row flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                                {/* badge를 맨 앞에 추가 */}
                                {post.badge && (
                                  <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                    {post.badge.icon && (
                                      <img
                                        src={post.badge.icon}
                                        alt=""
                                        className="w-[18px] h-[18px] object-contain"
                                      />
                                    )}
                                    <span className="text-[#555555] text-[15px]">
                                      {post.badge.text}
                                    </span>
                                  </div>
                                )}

                                {post.location && (
                                  <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <img
                                      src={MapPin}
                                      alt="위치"
                                      className="w-[18px] h-[18px]"
                                    />
                                    <span className="text-[#555555] text-[15px]">
                                      {post.location}
                                    </span>
                                  </div>
                                )}
                                {post.weather && (
                                  <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <img
                                      src={Cloud}
                                      alt="날씨"
                                      className="w-[18px] h-[18px]"
                                    />
                                    <span className="text-[#555555] text-[15px]">
                                      {post.weather}
                                    </span>
                                  </div>
                                )}
                                {post.time && (
                                  <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <img
                                      src={Clock}
                                      alt="시간"
                                      className="w-[18px] h-[18px]"
                                    />
                                    <span className="text-[#555555] text-[15px]">
                                      {post.time}
                                    </span>
                                  </div>
                                )}
                                {post.health && (
                                  <div className="flex items-center gap-2 bg-[#f0f0f0]/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <img
                                      src={Data}
                                      alt="데이터"
                                      className="w-[18px] h-[18px]"
                                    />
                                    <span className="text-[#555555] text-[15px]">
                                      {post.health}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {post.badge &&
                                !post.location &&
                                !post.weather &&
                                !post.time &&
                                !post.health && (
                                  <div className="absolute top-5 left-5 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-[15px] font-medium">
                                    {post.badge.icon && (
                                      <img
                                        src={post.badge.icon}
                                        alt=""
                                        className="w-4 h-4 object-contain"
                                      />
                                    )}
                                    <span>{post.badge.text}</span>
                                  </div>
                                )}

                              {/* 하단 프로필 캡슐 및 댓글 카운트 */}
                              <div className="absolute bottom-5 left-5 flex items-center gap-2 z-10 max-w-[90%]">
                                <div className="inline-flex items-center bg-[#f0f0f0]/70 backdrop-blur-sm rounded-full pl-1 pr-4 py-2 gap-2">
                                  <ImageWithFallback
                                    src={getAvatarForUserName(
                                      post.userName,
                                      post.userAvatar,
                                    )}
                                    alt={post.userName}
                                    className="w-10 h-10 rounded-full object-cover border border-[#f0f0f0] -my-4 -ml-2 "
                                  />
                                  <span className="text-[15px] text-[#202020] font-medium leading-[1.3] max-w-[85%] truncate flex-shrink">
                                    {(post.textOverlay && post.textOverlay.trim()) || post.userName}
                                  </span>
                                </div>

                                <div className="bg-[#f0f0f0]/70 backdrop-blur-sm rounded-full px-[9.5px] py-[7px] font-medium flex items-center justify-center shrink-0 relative text-[15px]">
                                  +
                                  {getAllComments(
                                    post.id,
                                    post.comments,
                                  ).length}
                                  {getAllComments(post.id, post.comments).length > 0 &&
                                    !readCommentPosts[post.id] && (
                                      <span className="absolute top-[1px] right-[1px] w-[8px] h-[8px] bg-[#FF3333] rounded-full"></span>
                                    )}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>

                        {/* 댓글 입력창 */}
                        <div className="z-40 pointer-events-none">
                          <div className="relative w-full h-[48px] pointer-events-auto px-1">
                            <div className="flex items-center gap-2 w-full mx-auto h-full mt-4">
                              <button
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors overflow-hidden relative"
                                onClick={() => {
                                  setCurrentPostId(post.id);
                                  setShowEmojiPicker(!showEmojiPicker);
                                }}
                              >
                                <AnimatePresence
                                  mode="wait"
                                  initial={false}
                                >
                                  {showEmojiPicker &&
                                    currentPostId === post.id ? (
                                    // X 아이콘
                                    <motion.div
                                      key="close-icon"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ duration: 0.18 }}
                                      className="absolute inset-0 flex items-center justify-center rounded-full bg-[#f0f0f0] border border-[#e8e8e8]"
                                    >
                                      <img
                                        src={X}
                                        alt="삭제"
                                        className="w-6 h-6"
                                      />
                                    </motion.div>
                                  ) : (
                                    // 스마일 이미지
                                    <motion.div
                                      key="smile-icon"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      transition={{ duration: 0.18 }}
                                      className="absolute inset-0 flex items-center justify-center rounded-full"
                                    >
                                      <img
                                        src={Reaction}
                                        alt="emoji"
                                        className="w-[29px] h-[29px] object-contain"
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </button>
                              <div className="flex-1 h-full relative flex items-center">
                                <AnimatePresence
                                  mode="wait"
                                  initial={false}
                                >
                                  {showEmojiPicker &&
                                    currentPostId === post.id ? (
                                    <motion.div
                                      key="emoji-list"
                                      initial={{
                                        opacity: 0,
                                        x: -20,
                                        scaleX: 0.6,
                                        originX: 0,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                        scaleX: 1,
                                        originX: 0,
                                      }}
                                      exit={{
                                        opacity: 0,
                                        x: 20,
                                        scaleX: 0.6,
                                        originX: 0,
                                      }}
                                      transition={{ duration: 0.25 }}
                                      className="absolute inset-y-0 left-0 right-0 flex items-center justify-start gap-2 pl-1 overflow-x-auto no-scrollbar"
                                    >
                                      {emojis.map((emoji) => (
                                        <button
                                          key={emoji}
                                          onClick={() => {
                                            handleEmojiReaction(
                                              emoji,
                                              post.id,
                                            );
                                            triggerReactionAnimation(
                                              emoji,
                                            );
                                          }}
                                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-[#f0f0f0] rounded-full transition-colors border border-[#e8e8e8] text-[20px]"
                                        >
                                          {emoji}
                                        </button>
                                      ))}
                                    </motion.div>
                                  ) : (
                                    <motion.form
                                      key="comment-input"
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      transition={{ duration: 0.25 }}
                                      className="absolute inset-y-1 inset-x-0 flex items-center bg-[#f0f0f0] border border-[#777777] backdrop-blur-md rounded-[16px] px-4"
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        if (
                                          currentPostId === post.id &&
                                          newComment.trim()
                                        ) {
                                          handleAddComment(post.id);
                                        }
                                      }}
                                    >
                                      <input
                                        type="text"
                                        placeholder="댓글을 작성해주세요"
                                        className="w-full bg-transparent outline-none text-[#2b2b2b] placeholder:text-[#aeaeae]"
                                        style={{ fontSize: "16px" }}
                                        enterKeyHint="send"
                                        value={
                                          currentPostId === post.id
                                            ? newComment
                                            : ""
                                        }
                                        onChange={(e) => {
                                          if (currentPostId !== post.id)
                                            return;

                                          const value = e.target.value;
                                          const maxLen =
                                            getMaxCommentLength(value);
                                          const trimmed =
                                            value.length <= maxLen
                                              ? value
                                              : value.slice(0, maxLen);
                                          setNewComment(trimmed);
                                        }}
                                        onFocus={(e) => {
                                          setCurrentPostId(post.id);
                                          e.preventDefault();
                                          if (
                                            scrollContainerRef.current
                                          ) {
                                            const currentScroll =
                                              scrollContainerRef.current
                                                .scrollTop;
                                            setTimeout(() => {
                                              if (
                                                scrollContainerRef.current
                                              ) {
                                                scrollContainerRef.current.scrollTop =
                                                  currentScroll;
                                              }
                                            }, 0);
                                          }
                                        }}
                                        onBlur={() => {
                                          // 밖 클릭인지 / 완료인지 구분
                                          const blurredByClick =
                                            blurByClickRef.current;

                                          // 1) 밖 탭해서 포커스 빠진 경우 → 등록 X
                                          if (blurredByClick) {
                                            return;
                                          }

                                          // 2) 키보드 '완료'로 포커스 빠진 경우 → 등록
                                          if (
                                            currentPostId === post.id &&
                                            newComment.trim()
                                          ) {
                                            handleAddComment(post.id);
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          const nativeEvent =
                                            e.nativeEvent as KeyboardEvent & {
                                              isComposing?: boolean;
                                            };
                                          if (nativeEvent.isComposing) return;

                                          if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                          ) {
                                            e.preventDefault();
                                            if (
                                              currentPostId === post.id &&
                                              newComment.trim()
                                            ) {
                                              handleAddComment(post.id);
                                            }
                                          }
                                        }}
                                      />
                                    </motion.form>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 삭제 모달 */}
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
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white rounded-2xl shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] z-50 overflow-hidden"
              >
                <div className="px-[32px] pt-[22px] pb-[26px] ">
                  <h3 className="text-[19px] font-semibold mb-1 text-[#202020]">
                    게시글을 삭제하시겠습니까?
                  </h3>
                  <p className="text-sm text-[#777777] mb-3 font-normal">
                    삭제한 게시글은 복구할 수 없습니다.
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

        {/* 이미지 확대 라이트박스 */}
        <AnimatePresence>
          {expandedPostId && expandedPost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={handleCloseLightbox}
            >
              <motion.div
                layoutId={`post-${expandedPostId}`}
                className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]"
                onClick={(e) => e.stopPropagation()}
              >
                <ImageWithFallback
                  src={expandedPost.image}
                  alt={expandedPost.caption}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 하단 GNB – 키보드 올라올 때는 숨김 */}
        {!isGridView &&
          !isReactionView &&
          !isKeyboardVisible &&
          !isSearchActive && (   // ✅ 검색 중에는 GNB 숨김
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto bg-white">
              <div className="relative px-4 pt-2 pb-4 shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)] rounded-t-[16px] h-[80px]">
                <div className="flex items-center justify-around">
                  <button
                    onClick={() => setIsGridView(true)}
                    className="flex flex-col items-center gap-1 text-[#aeaeae]"
                  >
                    <img src={LayoutGrid} alt="모아보기" className="w-6 h-6" />
                    <span className="text-[12px] font-normal">모아보기</span>
                  </button>
                  <div className="w-16" />
                  <button
                    className="flex flex-col items-center gap-1 text-[#aeaeae]"
                    onClick={() => onPageChange?.("calendar")}
                  >
                    <img src={Calendar} alt="캘린더" className="w-6 h-6" />
                    <span className="text-[12px] font-normal">캘린더</span>
                  </button>
                </div>
                <button
                  className="absolute left-1/2 -translate-x-1/2 -top-[16px] w-14 h-14 bg-[#36D2C5] rounded-full flex items-center justify-center shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)] hover:bg-[#00C2B3] transition-colors"
                  onClick={onUploadClick}
                >
                  <Plus size={28} className="text-white" />
                </button>
              </div>
            </div>
          )}

        {/* 이모지 떠오르는 애니메이션 */}
        <AnimatePresence>
          {floatingEmojis.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                y: 0,
                x: item.x,
                opacity: 0,
                scale: 0.3,
                rotate: 0,
              }}
              animate={{
                y: -window.innerHeight - 100,
                x: [
                  item.x,
                  item.x + item.wobble,
                  item.x - item.wobble / 2,
                  item.x + item.wobble / 3,
                  item.x,
                ],
                opacity: [0, 1, 1, 0.8, 0],
                scale: [0.3, 1, 1.05, 1, 0.9],
                rotate: [0, 10, -10, 5, 0],
              }}
              transition={{
                duration: 5,
                delay: item.delay,
                ease: "easeOut",
                times: [0, 0.1, 0.5, 0.8, 1],
              }}
              className="fixed pointer-events-none z-[100]"
              style={{
                fontSize: `${item.size}px`,
                left: "50%",
                bottom: 80,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isSearchActive && (
        <SearchSuggestionBar
          isKeyboardVisible={isKeyboardVisible}
          keyboardOffset={keyboardOffset}
          onSelect={(keyword) => setSearchQuery(keyword)}
        />
      )}
    </>
  );
}
