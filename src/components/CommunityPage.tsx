"use client";

import {
  Plus,
  MapPin,
  Cloud,
  Clock,
  Heart,
  X,
  Smile,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import "swiper/css";
import Bell from "../assets/images/icon_alarm.svg";
import ChevronLeft from "../assets/images/icon_chevron_left_24.svg";
import ChevronDown from "../assets/images/icon_chevron_down_20.svg";
import Search from "../assets/images/icon_search.svg";
import LayoutGrid from "../assets/images/Icon_View.svg";
import Calendar from "../assets/images/icon_com_calendar.svg";
import { patientMap, type PatientId } from "./userProfiles";

interface CommunityPageProps {
  onBack: () => void;
  onUploadClick: () => void;
  onNotificationClick?: () => void;
  onDeletePost?: (postId: number) => void;
  initialPostId?: number; // 캘린더에서 클릭한 포스트 ID
  posts: Array<{
    id: number;
    image: string;
    badge?: string;
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
}

// === 드롭다운 메뉴용 가족 구성원 ===
const familyMembers = [
  { id: "all", name: "우리가족" },
  { id: "me", name: "김웰리" },
  { id: "mom", name: "엄마" },
  { id: "dad", name: "아빠" },
];

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
                  className={`${isSelected ? "text-[#2b2b2b] font-medium" : "text-[#aeaeae]"
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
}: CommunityPageProps) {
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const postRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // 키보드 & 뷰포트 높이
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [screenHeight, setScreenHeight] = useState<number | null>(null);

  // === 유저 프로필 (없으면 김웰리로 기본값) ===
  const currentUserProfile =
    patientMap[currentUserId as PatientId] ?? patientMap["kim-welly"];

  const fallbackAvatar =
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80";

  const currentUserName = currentUserProfile.name;
  const currentUserAvatar =
    currentUserProfile.avatar || fallbackAvatar;

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
      const existingReactionIndex = existingReactions.findIndex(
        (r) => r.emoji === emoji,
      );

      if (existingReactionIndex >= 0) {
        const updatedReactions = [...existingReactions];
        const userExists = updatedReactions[existingReactionIndex].users.some(
          (u) => u.userName === currentUser.userName,
        );

        if (!userExists) {
          updatedReactions[existingReactionIndex] = {
            ...updatedReactions[existingReactionIndex],
            users: [...updatedReactions[existingReactionIndex].users, currentUser],
          };
        }

        return {
          ...prev,
          [postId]: updatedReactions,
        };
      } else {
        return {
          ...prev,
          [postId]: [
            ...existingReactions,
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
    if (postToDelete && onDeletePost) {
      onDeletePost(postToDelete);
    }
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

  const filteredPosts = posts.filter((post) => {
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

  const expandedPost = posts.find((p) => p.id === expandedPostId);

  // 초기 currentPostId
  useEffect(() => {
    if (filteredPosts.length > 0 && !currentPostId) {
      setCurrentPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, currentPostId]);

  // 캘린더에서 넘어왔을 때 해당 포스트로 스크롤
  useEffect(() => {
    if (
      initialPostId &&
      postRefs.current[initialPostId] &&
      scrollContainerRef.current &&
      !isGridView &&
      !isReactionView
    ) {
      const postElement = postRefs.current[initialPostId];
      const container = scrollContainerRef.current;

      setTimeout(() => {
        if (postElement && container) {
          const postTop = postElement.offsetTop;
          container.scrollTo({
            top: postTop,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [initialPostId, isGridView, isReactionView]);

  // 모바일 키보드 감지 (레이아웃 높이는 처음 값 기준으로 고정)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initial = window.innerHeight;   // 앱 처음 켰을 때 높이
    setScreenHeight(initial);

    const viewport = window.visualViewport;

    const handleResize = () => {
      if (!viewport) return;
      // viewport 높이가 처음 높이의 75%보다 작아지면 키보드가 떴다고 판단
      const isKeyboard = viewport.height < initial * 0.75;
      setIsKeyboardVisible(isKeyboard);
    };

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

  useEffect(() => {
    if (!isKeyboardVisible || currentPostId == null) return;

    const container = scrollContainerRef.current;
    const el = postRefs.current[currentPostId];
    if (!container || !el) return;

    // 이 값이 "얼마나 위로 올릴지"를 정하는 값
    // 숫자 줄이면 -> 카드가 화면에서 더 아래에 위치
    // 숫자 늘리면 -> 카드가 헤더 가까이 더 올라감
    const HEADER_OFFSET = 60; // 120~160 사이에서 취향대로 조절해봐

    const targetTop = Math.max(el.offsetTop - HEADER_OFFSET, 0);

    container.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  }, [isKeyboardVisible, currentPostId]);

  // 처음 화면 높이 (없으면 800 fallback)
  const baseHeight = screenHeight ?? 800;

  const HEADER_HEIGHT = 110; // 헤더 + 위 여유
  const GNB_HEIGHT = 80;

  // 콘텐츠 영역 높이 (키보드 떠도 처음 높이 기준은 유지)
  const contentHeight =
    isGridView || isReactionView
      ? baseHeight - HEADER_HEIGHT          // 그리드/리액션: GNB 없음
      : isKeyboardVisible
        ? baseHeight - HEADER_HEIGHT        // 키보드 있을 때도 레이아웃은 그대로, GNB만 숨김
        : baseHeight - HEADER_HEIGHT - GNB_HEIGHT; // 기본: 헤더 + GNB 제외

  // 카드 한 묶음 높이: 항상 일정(키보드 여부 상관 X)
  // 160이 너무 크거나 작으면 숫자만 살짝 조절해서 본인 폰에 맞춰봐
  const cardHeight = baseHeight - 160;


  return (
    <div className="relative bg-[#f7f7f7] flex flex-col max-w-[500px] mx-auto h-screen overflow-hidden">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 px-5 xs:px-6 sm:px-8 flex flex-col justify-center w-full  bg-[#f7f7f7]/80 backdrop-blur-xs min-h-[80px]">
        {isSearchActive ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <img
                src={ChevronLeft}
                alt="뒤로가기"
                className="w-6 h-6"
              />
            </button>
            <div
              className={`bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2 transition-all border-2 flex-1 ${isSearchFocused
                ? "border-[#36D9D9]"
                : "border-transparent"
                }`}
            >
              <img
                src={Search}
                alt="검색"
                className="w-6 h-6"
              />
              <input
                type="text"
                placeholder="게시글, 키워드를 검색해보세요"
                className="flex-1 bg-transparent outline-none text-[#1A1A1A] placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                autoFocus
              />
            </div>
            <button
              className="text-[#1A1A1A] text-sm font-medium flex-shrink-0"
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
              <img
                src={ChevronLeft}
                alt="뒤로가기"
                className="w-6 h-6"
              />
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
              <img
                src={ChevronLeft}
                alt="뒤로가기"
                className="w-6 h-6"
              />
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
                        (m.id === "me"
                          ? currentUserName
                          : m.name) === selectedFamilyMember,
                    )?.name || "모아보기"
                    : "모아보기"}
                </span>
                <img
                  src={ChevronDown}
                  alt="뒤로가기"
                  className="w-6 h-6"
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
              <Smile size={24} />
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-center relative">
            <button
              onClick={onBack}
              className="absolute left-0 w-6 h-6 flex items-center justify-center"
            >
              <img
                src={ChevronLeft}
                alt="뒤로가기"
                className="w-6 h-6"
              />
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
                        (m.id === "me"
                          ? currentUserName
                          : m.name) === selectedFamilyMember,
                    )?.name || "우리가족"
                    : "우리가족"}
                </span>
                <img
                  src={ChevronDown}
                  alt="드롭다운"
                  className="w-6 h-6"
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
                <img
                  src={Search}
                  alt="검색"
                  className="w-6 h-6"
                />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={onNotificationClick}
              >
                <img src={Bell} alt="알림" className="w-6 h-6" />
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
            <div className="px-5 py-4 flex gap-3 overflow-x-auto scrollbar-hide bg-white sticky top-0 z-20 justify-center">
              <button
                onClick={() => setReactionFilter("ALL")}
                className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${reactionFilter === "ALL"
                  ? "bg-[#F0F0F0] text-[#1A1A1A] border-[#36D2C5]"
                  : "bg-[#F0F0F0] text-[#999999] border-transparent"
                  }`}
              >
                ALL
              </button>

              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setReactionFilter(emoji)}
                  className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl transition-all border-2 ${reactionFilter === emoji
                    ? "bg-[#FFF8F8] border-[#36D2C5]"
                    : "bg-[#F0F0F0] border-transparent"
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="px-4">
              {getFilteredReactionPosts().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Heart
                    size={48}
                    className="text-gray-300 mb-4"
                  />
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
                      className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
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
                      onClick={() => setExpandedPostId(post.id)}
                    >
                      <ImageWithFallback
                        src={post.image}
                        alt="Community post"
                        className="w-full h-full object-contain bg-gray-100 pointer-events-none"
                      // object-cover → object-contain으로 변경
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
          <div className="px-4 py-4 pb-20">
            <div className="grid grid-cols-3 gap-1">
              {filteredPosts
                .filter((post) => post.image)
                .map((post) => (
                  <motion.div
                    key={post.id}
                    layoutId={`post-${post.id}`}
                    className="aspect-square relative overflow-hidden rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
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
                    onClick={() => setExpandedPostId(post.id)}
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
            className={`w-full px-5 xs:px-6 sm:px-8 overflow-y-auto h-full scrollbar-hide ${!isKeyboardVisible ? "snap-y snap-mandatory" : "pb-40"
              }`}
          >
            {filteredPosts.map((post) => {
              const isDeleting = postToDelete === post.id;
              return (
                <div
                  ref={(el) => {
                    postRefs.current[post.id] = el;
                  }}
                  className={`flex flex-col items-center w-full gap-4 py-5 xs:py-6 sm:py-8
    ${!isKeyboardVisible
                      ? "justify-center snap-start snap-always"
                      : "justify-start pt-4"
                    }
  `}
                  key={post.id}
                  style={{
                    height: cardHeight,
                    minHeight: cardHeight,   // ✅ 키보드 떠도 항상 같은 카드 높이 유지
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
                          !isScrolling &&
                            post.userName === currentUser.userName
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
                        onClick={(e) => {
                          if (!dragStartX)
                            setSelectedPostForReaction(post.id);
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
                                <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end max-w-[60%] z-20">
                                  {getAllReactions(
                                    post.id,
                                    post.reactions,
                                  ).map((reaction) => (
                                    <div
                                      key={reaction.emoji}
                                      className="rounded-full pl-2 pr-3 py-1.5 flex items-center gap-2"
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
                                          .map(
                                            (
                                              user,
                                              userIdx,
                                            ) => (
                                              <ImageWithFallback
                                                key={`${reaction.emoji}-${user.userName}-${userIdx}`}
                                                src={getAvatarForUserName(
                                                  user.userName,
                                                  user.userAvatar,
                                                )}
                                                alt={
                                                  user.userName
                                                }
                                                className={`w-6 h-6 rounded-full object-cover border border-[#f0f0f0] transition-all duration-300 ${userIdx === 0
                                                  ? "ml-0"
                                                  : ""
                                                  }`}
                                                style={{
                                                  zIndex:
                                                    reaction
                                                      .users
                                                      .length -
                                                    userIdx,
                                                }}
                                              />
                                            ),
                                          )}

                                        {reaction.users.length >
                                          3 && (
                                            <div
                                              className="w-7 h-7 rounded-full bg-gray-500/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold border-2 border-white relative"
                                              style={{
                                                zIndex: 0,
                                              }}
                                            >
                                              +
                                              {reaction.users
                                                .length - 3}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Pressed 상태의 프로필 캡슐 */}
                            {(post.textOverlay ||
                              post.userName) && (
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
                                      {post.textOverlay ||
                                        post.userName}
                                    </p>
                                  </div>
                                </div>
                              )}

                            {getAllComments(
                              post.id,
                              post.comments,
                            ).length > 0 && (
                                <div className="absolute bottom-20 right-0 flex flex-col gap-5 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20 p-4 scrollbar-hide">
                                  {getAllComments(
                                    post.id,
                                    post.comments,
                                  ).map(
                                    (comment, idx) => (
                                      <div
                                        key={`comment-${post.id}-${idx}-${comment.userName}-${comment.timestamp}`}
                                        className="inline-flex flex-row-reverse items-center bg-white/75 backdrop-blur-sm rounded-full pl-4 pr-2 py-2"
                                      >
                                        <ImageWithFallback
                                          src={getAvatarForUserName(
                                            comment.userName,
                                            comment.userAvatar,
                                          )}
                                          alt={
                                            comment.userName
                                          }
                                          className="w-10 h-10 rounded-full object-cover -my-4 -mr-2 shadow-[0_2px_2.5px_0_rgba(201,208,216,0.20)]"
                                        />
                                        <p className="text-[15px] text-[#202020] font-medium leading-[1.3] max-w-[85%] truncate flex-shrink mr-1">
                                          {comment.text}
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        )}

                        {selectedPostForReaction !== post.id && (
                          <>
                            <div className="absolute top-4 left-4 flex flex-row flex-wrap gap-2 max-w-[calc(100%-2rem)]">
                              {post.location && (
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                  <MapPin
                                    size={16}
                                    className="text-white"
                                  />
                                  <span className="text-white text-sm">
                                    {post.location}
                                  </span>
                                </div>
                              )}
                              {post.weather && (
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                  <Cloud
                                    size={16}
                                    className="text-white"
                                  />
                                  <span className="text-white text-sm">
                                    {post.weather}
                                  </span>
                                </div>
                              )}
                              {post.time && (
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                  <Clock
                                    size={16}
                                    className="text-white"
                                  />
                                  <span className="text-white text-sm">
                                    {post.time}
                                  </span>
                                </div>
                              )}
                              {post.health && (
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-full">
                                  <Heart
                                    size={16}
                                    className="text-white"
                                  />
                                  <span className="text-white text-sm">
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
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-sm font-medium">
                                  <span>{post.badge}</span>
                                </div>
                              )}

                            {/* 하단 프로필 캡슐 및 댓글 카운트 */}
                            <div className="absolute bottom-5 left-5 flex items-center gap-2 z-10 max-w-[90%]">
                              <div className="inline-flex items-center bg-white/70 backdrop-blur-sm rounded-full pl-1 pr-4 py-2 gap-2">
                                <ImageWithFallback
                                  src={getAvatarForUserName(
                                    post.userName,
                                    post.userAvatar,
                                  )}
                                  alt={post.userName}
                                  className="w-10 h-10 rounded-full object-cover border border-[#f0f0f0] -my-4 -ml-2 "
                                />
                                <span className="text-[15px] text-[#202020] font-medium leading-[1.3] max-w-[85%] truncate flex-shrink">
                                  {post.textOverlay ||
                                    post.userName}
                                </span>
                              </div>

                              <div className="bg-white/70 backdrop-blur-sm rounded-full px-2.5 py-2 font-medium flex items-center justify-center shrink-0 relative text-[15px]">
                                +
                                {
                                  getAllComments(
                                    post.id,
                                    post.comments,
                                  ).length
                                }
                                {getAllComments(
                                  post.id,
                                  post.comments,
                                ).length > 0 && (
                                    <span className="absolute top-[1px] right-[1px] w-[10px] h-[10px] bg-[#FF3333] rounded-full"></span>
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
                                setShowEmojiPicker(
                                  !showEmojiPicker,
                                );
                              }}
                            >
                              <AnimatePresence
                                mode="wait"
                                initial={false}
                              >
                                {showEmojiPicker &&
                                  currentPostId === post.id ? (
                                  <motion.div
                                    key="close-icon"
                                    initial={{
                                      opacity: 0,
                                      y: 10,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: -10,
                                    }}
                                    transition={{
                                      duration: 0.2,
                                    }}
                                    className="absolute inset-0 flex items-center justify-center rounded-full"
                                  >
                                    <X size={20} />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="smile-icon"
                                    initial={{
                                      opacity: 0,
                                      y: -10,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 10,
                                    }}
                                    transition={{
                                      duration: 0.2,
                                    }}
                                    className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]/80 backdrop-blur-md text-gray-500 hover:text-gray-800 rounded-full"
                                  >
                                    <Smile size={24} />
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
                                      y: 10,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: -10,
                                    }}
                                    transition={{
                                      duration: 0.2,
                                    }}
                                    className="absolute inset-0 flex items-center gap-2 overflow-x-auto no-scrollbar"
                                  >
                                    {emojis.map(
                                      (emoji) => (
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
                                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-2xl bg-[#F5F5F5]/80 backdrop-blur-md rounded-full transition-colors"
                                        >
                                          {emoji}
                                        </button>
                                      ),
                                    )}
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="comment-input"
                                    initial={{
                                      opacity: 0,
                                      y: -10,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 10,
                                    }}
                                    transition={{
                                      duration: 0.2,
                                    }}
                                    className="absolute inset-y-1 inset-x-0 flex items-center bg-[#f0f0f0] border border-[#777777] backdrop-blur-md rounded-[16px] px-4"
                                  >
                                    <input
                                      type="text"
                                      placeholder="댓글을 작성해주세요"
                                      className="w-full bg-transparent outline-none text-[#2b2b2b] placeholder:text-[#aeaeae]"
                                      value={
                                        currentPostId ===
                                          post.id
                                          ? newComment
                                          : ""
                                      }
                                      onChange={(e) => {
                                        if (
                                          currentPostId !==
                                          post.id
                                        )
                                          return;

                                        const value =
                                          e.target.value;
                                        const maxLen =
                                          getMaxCommentLength(
                                            value,
                                          );
                                        const trimmed =
                                          value.length <=
                                            maxLen
                                            ? value
                                            : value.slice(
                                              0,
                                              maxLen,
                                            );
                                        setNewComment(
                                          trimmed,
                                        );
                                      }}
                                      onFocus={() =>
                                        setCurrentPostId(
                                          post.id,
                                        )
                                      }
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === "Enter" &&
                                          !e.shiftKey
                                        ) {
                                          e.preventDefault();
                                          if (
                                            currentPostId ===
                                            post.id
                                          ) {
                                            handleAddComment(
                                              post.id,
                                            );
                                          }
                                        }
                                      }}
                                    />
                                  </motion.div>
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
      {!isGridView && !isReactionView && !isKeyboardVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto bg-white">
          <div className="relative px-4 pt-2 pb-4 shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)] rounded-t-[16px] h-[80px]">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setIsGridView(true)}
                className="flex flex-col items-center gap-1 text-[#aeaeae]"
              >

                <img src={LayoutGrid} alt="모아보기" className="w-6 h-6" />
                <span className="text-[12px] font-normal">
                  모아보기
                </span>
              </button>
              <div className="w-16" />
              <button
                className="flex flex-col items-center gap-1 [#aeaeae]"
                onClick={() => onPageChange?.("calendar")}
              >
                <img src={Calendar} alt="캘린더" className="w-6 h-6" />
                <span className="text-[12px]">캘린더</span>
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
  );
}
