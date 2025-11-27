"use client";

import {
  ChevronLeft,
  ChevronDown,
  Search,
  Bell,
  LayoutGrid,
  Calendar,
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
import { Swiper, SwiperSlide } from "swiper/react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import "swiper/css";
import { BottomNav } from "./BottomNav";

interface CommunityPageProps {
  onBack: () => void;
  onUploadClick: () => void;
  onNotificationClick?: () => void;
  onDeletePost?: (postId: number) => void;
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
  currentUserName: string;
  currentUserAvatar?: string;
  currentPage?: string;
  onPageChange?: (page: any) => void;
}

// 가족 구성원 목데이터
const familyMembers = [
  { id: "all", name: "전체보기", avatar: "" },
  {
    id: "admin",
    name: "관리자",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
  {
    id: "mom",
    name: "엄마",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
  },
  {
    id: "dad",
    name: "아빠",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
];

// === [NEW] 드롭다운 컴포넌트 분리 (재사용성 및 가독성 향상) ===
const FamilyDropdown = ({
  showFamilyDropdown,
  setShowFamilyDropdown,
  familyMembers,
  selectedFamilyMember,
  setSelectedFamilyMember,
  currentUserName,
}: {
  showFamilyDropdown: boolean;
  setShowFamilyDropdown: (show: boolean) => void;
  familyMembers: typeof familyMembers;
  selectedFamilyMember: string | null;
  setSelectedFamilyMember: (member: string | null) => void;
  currentUserName: string;
}) => (
  <AnimatePresence>
    {showFamilyDropdown && (
      <motion.div
        initial={{ opacity: 0, y: -10 }} // 애니메이션: 위에서 아래로 슬라이드
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        // [수정] absolute 위치, 버튼 아래에 붙고, 그림자/둥근 모서리 유지
        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-fit bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100"
      >
        <div className="p-2 min-w-[140px]">
          {familyMembers.map((member) => {
            const isGrayedOut =
              member.id === "kim" || member.id === "park";
            const memberName =
              member.id === "me"
                ? currentUserName
                : member.name;
            const isSelected =
              (member.id === "all" && !selectedFamilyMember) ||
              selectedFamilyMember === memberName;

            return (
              <button
                key={member.id}
                onClick={() => {
                  if (isGrayedOut) return;

                  if (member.id === "all") {
                    setSelectedFamilyMember(null);
                  } else {
                    setSelectedFamilyMember(memberName);
                  }
                  setShowFamilyDropdown(false);
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors text-lg font-medium whitespace-nowrap justify-start
                  ${
                    isGrayedOut
                      ? "text-gray-400 cursor-default"
                      : isSelected
                        ? "text-[#1A1A1A] bg-gray-100"
                        : "text-[#1A1A1A] hover:bg-gray-50"
                  }`}
                disabled={isGrayedOut}
              >
                <span
                  className={`${
                    isGrayedOut
                      ? "text-gray-400"
                      : "text-[#1A1A1A]"
                  } leading-none`}
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
// ========================================================

export function CommunityPage({
  onBack,
  onUploadClick,
  onNotificationClick,
  onDeletePost,
  posts,
  currentUserName,
  currentUserAvatar,
  currentPage,
  onPageChange,
}: CommunityPageProps) {
  const [selectedGroup, setSelectedGroup] =
    useState("우리가족");
  const [selectedFamilyMember, setSelectedFamilyMember] =
    useState<string | null>(null);
  const [showFamilyDropdown, setShowFamilyDropdown] =
    useState(false);
  const [isGridView, setIsGridView] = useState(false);
  const [isReactionView, setIsReactionView] = useState(false);

  const [reactionFilter, setReactionFilter] = useState("ALL");

  const [selectedPostForReaction, setSelectedPostForReaction] =
    useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentPostId, setCurrentPostId] = useState<
    number | null
  >(null);
  const [emojiAnimation, setEmojiAnimation] = useState<{
    emoji: string;
    active: boolean;
  } | null>(null);

  // 이미지 확대 보기(라이트박스) 상태
  const [expandedPostId, setExpandedPostId] = useState<
    number | null
  >(null);
  // [추가] 애니메이션이 끝날 때까지 z-index를 유지하기 위한 상태
  const [lastExpandedId, setLastExpandedId] = useState<
    number | null
  >(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [dragStartX, setDragStartX] = useState<number | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<
    number | null
  >(null);

  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 키보드 감지를 위한 state 추가
  const [isKeyboardVisible, setIsKeyboardVisible] =
    useState(false);

  const currentUser = {
    userName: currentUserName,
    userAvatar:
      currentUserAvatar ||
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  };

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

  const emojis = ["❤️", "😊", "👍", "🎉"];

  // 이모지 애니메이션 상태
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

  // === [NEW] 애니메이션 실행 로직 분리 ===
  const triggerReactionAnimation = (emoji: string) => {
    // 폭죽 이모지일 때는 confetti만 발생하고 이모지는 안 떠오름
    if (emoji === "🎉") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      return; // 폭죽은 이모지 떠오르는 애니메이션 없음
    }

    // 다른 이모지들은 떠오르는 애니메이션 생성
    const count = Math.floor(Math.random() * 9) + 4; // 4~12개 (기존 로직과 동일)
    const newEmojis = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      emoji: emoji,
      x: (Math.random() - 0.5) * 480, // -240px ~ 240px (피드 영역 전체)
      size: Math.random() * 90 + 30, // 30~120px (다양한 크기)
      wobble: (Math.random() - 0.5) * 60, // -30px ~ 30px 좌우 흔들림
      delay: Math.random() * 2, // 0~2초 딜레이
    }));
    setFloatingEmojis((prev) => [...prev, ...newEmojis]);

    // 5초 후 제거
    setTimeout(() => {
      setFloatingEmojis((prev) =>
        prev.filter(
          (e) => !newEmojis.some((ne) => ne.id === e.id),
        ),
      );
    }, 5000);
  };
  // ======================================

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

    // 댓글 작성 후 해당 게시물의 세부 화면으로 이동
    setSelectedPostForReaction(postId);
  };

  const handleEmojiReaction = (
    emoji: string,
    postId: number,
  ) => {
    setEmojiAnimation({ emoji, active: true });

    setAddedReactions((prev) => {
      const existingReactions = prev[postId] || [];
      const existingReactionIndex = existingReactions.findIndex(
        (r) => r.emoji === emoji,
      );

      if (existingReactionIndex >= 0) {
        const updatedReactions = [...existingReactions];
        const userExists = updatedReactions[
          existingReactionIndex
        ].users.some(
          (u) => u.userName === currentUser.userName,
        );

        if (!userExists) {
          updatedReactions[existingReactionIndex] = {
            ...updatedReactions[existingReactionIndex],
            users: [
              ...updatedReactions[existingReactionIndex].users,
              currentUser,
            ],
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

  const generateRandomPosition = () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  });

  const getAllComments = (
    postId: number,
    originalComments?: Array<any>,
  ) => {
    const original = originalComments || [];
    const added = addedComments[postId] || [];
    return [...original, ...added];
  };

  const getAllReactions = (
    postId: number,
    originalReactions?: Array<any>,
  ) => {
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
        merged[reaction.emoji] = [
          ...existingUsers,
          ...newUsers,
        ];
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
      // 1. 내가 작성한 댓글 확인
      const hasMyComment = addedComments[post.id]?.some(
        (comment) => comment.userName === currentUser.userName,
      );

      // 2. 내가 새로 추가한 리액션 확인 (addedReactions)
      const hasMyAddedReaction = addedReactions[post.id]?.some(
        (reaction) =>
          reaction.users.some(
            (user) => user.userName === currentUser.userName,
          ),
      );

      // 3. 목 데이터의 원래 리액션 확인 (post.reactions)
      const hasMyOriginalReaction = post.reactions?.some(
        (reaction) =>
          reaction.users.some(
            (user) => user.userName === currentUser.userName,
          ),
      );

      const hasMyReaction =
        hasMyComment ||
        hasMyAddedReaction ||
        hasMyOriginalReaction;

      // 4. 특정 인물이 선택된 경우 교집합 필터링
      if (selectedFamilyMember) {
        // [수정된 부분: '나'를 currentUserName으로 처리]
        const isMe = selectedFamilyMember === currentUserName;
        if (isMe) {
          return (
            hasMyReaction && post.userName === currentUserName
          );
        } else {
          return (
            hasMyReaction &&
            post.userName === selectedFamilyMember
          );
        }
      }

      return hasMyReaction;
    });

    if (reactionFilter === "ALL") {
      return myReactedPosts;
    }

    // 특정 이모지로 필터링
    return myReactedPosts.filter((post) => {
      // 새로 추가한 리액션에서 해당 이모지 확인
      const hasAddedReaction = addedReactions[post.id]?.some(
        (reaction) =>
          reaction.emoji === reactionFilter &&
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          ),
      );

      // 원래 있던 리액션에서 해당 이모지 확인
      const hasOriginalReaction = post.reactions?.some(
        (reaction) =>
          reaction.emoji === reactionFilter &&
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          ),
      );

      return hasAddedReaction || hasOriginalReaction;
    });
  };

  // 내가 사용한 리액션 이모지 목록 추출
  const getMyUsedEmojis = () => {
    const usedEmojis = new Set<string>();

    posts.forEach((post) => {
      // 원래 있던 리액션에서 내가 남긴 이모지 찾기
      post.reactions?.forEach((reaction) => {
        if (
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          )
        ) {
          usedEmojis.add(reaction.emoji);
        }
      });

      // 새로 추가한 리액션에서 내가 남긴 이모지 찾기
      addedReactions[post.id]?.forEach((reaction) => {
        if (
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          )
        ) {
          usedEmojis.add(reaction.emoji);
        }
      });
    });

    return Array.from(usedEmojis);
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

  // [추가] 라이트박스 닫기 핸들러
  const handleCloseLightbox = () => {
    setLastExpandedId(expandedPostId); // 닫히는 포스트 ID 저장
    setExpandedPostId(null);
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedFamilyMember) {
      // [수정된 부분: '나'를 currentUserName으로 처리]
      const isMe = selectedFamilyMember === currentUserName;
      if (isMe) {
        if (post.userName !== currentUserName) {
          return false;
        }
      } else if (post.userName !== selectedFamilyMember) {
        return false;
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

  const expandedPost = posts.find(
    (p) => p.id === expandedPostId,
  );

  // 초기 로드 시 첫 번째 피드의 ID를 currentPostId로 설정
  useEffect(() => {
    if (filteredPosts.length > 0 && !currentPostId) {
      setCurrentPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, currentPostId]);

  // 모바일 키보드 감지 useEffect
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport)
      return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      // viewport 높이가 window 높이보다 작으면 키보드가 올라온 것
      const isKeyboard =
        viewport.height < window.innerHeight * 0.75;
      setIsKeyboardVisible(isKeyboard);
    };

    window.visualViewport.addEventListener(
      "resize",
      handleResize,
    );
    window.visualViewport.addEventListener(
      "scroll",
      handleResize,
    );

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleResize,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleResize,
        );
      }
    };
  }, []);

  return (
    <div className="relative bg-white flex flex-col max-w-[500px] mx-auto h-screen overflow-hidden">
      {/* Header (110px) */}
      <header className="sticky top-0 z-30 px-4 flex flex-col justify-center w-full bg-white min-h-[80px]">
        {isSearchActive ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
            >
              <ChevronLeft
                size={24}
                className="text-[#1A1A1A]"
              />
            </button>
            <div
              className={`bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2 transition-all border-2 flex-1 ${
                isSearchFocused
                  ? "border-[#36D9D9]"
                  : "border-transparent"
              }`}
            >
              <Search size={20} className="text-gray-400" />
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
              <ChevronLeft
                size={24}
                className="text-[#1A1A1A]"
              />
            </button>
            <span className="text-lg font-bold text-[#1A1A1A]">
              리액션 모아보기
            </span>
          </div>
        ) : isGridView ? (
          <div className="w-full flex items-center justify-center relative">
            <button
              onClick={() => setIsGridView(false)}
              className="absolute left-0 w-6 h-6 flex items-center justify-center"
            >
              <ChevronLeft
                size={24}
                className="text-[#1A1A1A]"
              />
            </button>

            {/* [수정] Grid View - 드롭다운 Anchor */}
            <div className="relative z-50">
              <button
                className="flex items-center gap-1"
                onClick={() =>
                  setShowFamilyDropdown(!showFamilyDropdown)
                }
              >
                <span className="text-lg font-bold text-[#1A1A1A]">
                  {selectedFamilyMember
                    ? familyMembers.find(
                        (m) =>
                          (m.id === "me"
                            ? currentUserName
                            : m.name) === selectedFamilyMember,
                      )?.name || "모아보기"
                    : "모아보기"}
                </span>
                <ChevronDown
                  size={20}
                  className="text-gray-600"
                />
              </button>
              {/* [추가] 드롭다운 컴포넌트 */}
              <FamilyDropdown
                showFamilyDropdown={showFamilyDropdown}
                setShowFamilyDropdown={setShowFamilyDropdown}
                familyMembers={familyMembers}
                selectedFamilyMember={selectedFamilyMember}
                setSelectedFamilyMember={
                  setSelectedFamilyMember
                }
                currentUserName={currentUserName}
              />
            </div>
            {/* ---------------------------------- */}

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
              <ChevronLeft
                size={24}
                className="text-[#1A1A1A]"
              />
            </button>

            {/* [수정] Default View - 드롭다운 Anchor */}
            <div className="relative z-50">
              <button
                className="flex items-center gap-1"
                onClick={() =>
                  setShowFamilyDropdown(!showFamilyDropdown)
                }
              >
                <span className="text-lg font-bold text-[#1A1A1A]">
                  {selectedFamilyMember
                    ? familyMembers.find(
                        (m) =>
                          (m.id === "me"
                            ? currentUserName
                            : m.name) === selectedFamilyMember,
                      )?.name || "우리가족"
                    : "우리가족"}
                </span>
                <ChevronDown
                  size={20}
                  className="text-gray-600"
                />
              </button>
              {/* [추가] 드롭다운 컴포넌트 */}
              <FamilyDropdown
                showFamilyDropdown={showFamilyDropdown}
                setShowFamilyDropdown={setShowFamilyDropdown}
                familyMembers={familyMembers}
                selectedFamilyMember={selectedFamilyMember}
                setSelectedFamilyMember={
                  setSelectedFamilyMember
                }
                currentUserName={currentUserName}
              />
            </div>
            {/* ---------------------------------- */}

            <div className="absolute right-0 flex items-center gap-4">
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={() => {
                  setIsSearchActive(true);
                  setIsSearchFocused(true);
                }}
              >
                <Search size={20} className="text-[#1A1A1A]" />
              </button>
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={onNotificationClick}
              >
                <Bell size={20} className="text-[#1A1A1A]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Content Area - Header(110px)와 BottomNav(80px)를 제외한 높이 계산 */}
      <div
        className="w-full overflow-hidden"
        style={{
          height:
            isGridView || isReactionView
              ? "calc(100vh - 110px)"
              : "calc(100vh - 110px - 80px)",
        }}
      >
        {isReactionView ? (
          <div className="pb-20">
            {/* 리액션 필터 바 (가로 스크롤) */}
            <div className="px-4 py-4 flex gap-3 overflow-x-auto scrollbar-hide bg-white sticky top-0 z-20 justify-center">
              {/* ALL 버튼 */}
              <button
                onClick={() => setReactionFilter("ALL")}
                className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-sm font-bold transition-all border-2 ${
                  reactionFilter === "ALL"
                    ? "bg-[#F0F0F0] text-[#1A1A1A] border-[#36D2C5]"
                    : "bg-[#F0F0F0] text-[#999999] border-transparent"
                }`}
              >
                ALL
              </button>

              {/* 이모지 버튼들 - 4개 이모지 항상 표시 */}
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setReactionFilter(emoji)}
                  className={`flex-shrink-0 w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl transition-all border-2 ${
                    reactionFilter === emoji
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
                      // [추가] z-index 유지 (확대 또는 축소 중일 때)
                      style={{
                        zIndex:
                          expandedPostId === post.id ||
                          lastExpandedId === post.id
                            ? 50
                            : 0,
                      }}
                      onLayoutAnimationComplete={() => {
                        // 애니메이션 완료 시 lastExpandedId 초기화
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
                      {reactionFilter !== "ALL" && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
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
              {filteredPosts.map((post) => (
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
          <div className="w-full px-5 xs:px-6 sm:px-8 snap-y snap-mandatory overflow-y-auto h-full scrollbar-hide">
            {filteredPosts.map((post, index) => {
              const isDeleting = postToDelete === post.id;
              return (
                <div
                  // [수정] 사진+댓글창 그룹을 한 화면에 정확히 표시
                  className={`snap-start snap-always flex flex-col items-center w-full gap-4 py-5 xs:py-6 sm:py-8 justify-start
                  ${
                    isKeyboardVisible
                      ? "pt-12 overflow-y-auto"
                      : ""
                  }`}
                  key={post.id}
                  style={{
                    height: "calc(100vh - 190px)", // 헤더(110px) + nav(80px)
                    minHeight: "calc(100vh - 190px)",
                  }}
                >
                  <div className="relative w-full mx-auto overflow-visible flex-shrink-0 aspect-[335/400] max-h-[calc(100vh-280px)]">
                    {post.userName === currentUser.userName &&
                      isDragging && (
                        <div className="absolute inset-y-0 -right-16 w-24 flex items-center justify-end z-0 pr-4">
                          <Trash2
                            size={32}
                            className="text-red-500"
                          />
                        </div>
                      )}
                    <motion.div
                      className="relative h-full w-full rounded-2xl overflow-hidden shadow-lg touch-none"
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
                          {/* === [수정된 부분: 리액션 묶음 표시 - 배경 투명] === */}
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
                                  // 배경 투명
                                  className="rounded-full pl-2 pr-3 py-1.5 flex items-center gap-2"
                                  // === [NEW] 클릭 시 애니메이션 재실행 ===
                                  onClick={(e) => {
                                    e.stopPropagation(); // 오버레이 닫힘 방지
                                    triggerReactionAnimation(
                                      reaction.emoji,
                                    ); // 애니메이션 실행
                                  }}
                                  // ======================================
                                >
                                  <span className="text-base">
                                    {reaction.emoji}
                                  </span>

                                  {/* 사용자 프로필 겹쳐서 표시 */}
                                  <div className="flex -space-x-2.5">
                                    {/* 최대 3명의 사용자만 표시 (겹치는 효과를 위해) */}
                                    {reaction.users
                                      .slice(0, 3)
                                      .map((user, userIdx) => (
                                        <ImageWithFallback
                                          key={`${reaction.emoji}-${user.userName}-${userIdx}`}
                                          src={user.userAvatar}
                                          alt={user.userName}
                                          // 프로필 이미지 스타일: 크기, 겹침 효과를 위한 -space-x-2.5 와 대비되는 왼쪽 마진 0
                                          className={`w-7 h-7 rounded-full object-cover border-2 border-white transition-all duration-300 ${
                                            userIdx === 0
                                              ? "ml-0"
                                              : ""
                                          }`}
                                          style={{
                                            // 겹치는 정도를 조정
                                            zIndex:
                                              reaction.users
                                                .length -
                                              userIdx,
                                          }}
                                        />
                                      ))}

                                    {/* 3명 초과 시 카운트 표시 */}
                                    {reaction.users.length >
                                      3 && (
                                      <div
                                        className="w-7 h-7 rounded-full bg-gray-500/80 backdrop-blur-sm flex items-center justify-center text-white text-xs font-semibold border-2 border-white relative"
                                        style={{ zIndex: 0 }}
                                      >
                                        +
                                        {reaction.users.length -
                                          3}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* ================================================= */}

                          {/* [수정: Pressed 상태의 캡슐 위치 및 스타일 통일] */}
                          {(post.textOverlay ||
                            post.userName) && (
                            <div className="absolute bottom-4 left-4 flex items-center gap-3 z-20 max-w-[90%]">
                              {/* 1. 프로필 + 텍스트 캡슐 - shrink-0 제거 */}
                              <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-5 py-3 gap-3 shadow-sm border border-white/20">
                                <ImageWithFallback
                                  src={post.userAvatar}
                                  alt={post.userName}
                                  // 이미지: w-12 h-12 (48px), -my-4, -ml-2
                                  className="w-12 h-12 rounded-full object-cover border-3 border-white -my-4 -ml-2 shadow-sm"
                                />
                                {/* [수정] max-w-[150px] -> max-w-[130px] */}
                                <p className="text-[15px] text-gray-900 font-bold leading-none max-w-[130px] truncate flex-shrink">
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
                            <div
                              // [수정] right-4 -> right-0 변경. p-4가 있으므로 시각적으로는 16px 떨어짐.
                              className="absolute bottom-20 right-0 flex flex-col gap-5 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20 p-4 scrollbar-hide"
                            >
                              {getAllComments(
                                post.id,
                                post.comments,
                              ).map((comment, idx) => (
                                <div
                                  key={`comment-${post.id}-${idx}-${comment.userName}-${comment.timestamp}`}
                                  // [수정] 댓글 캡슐: 우측 정렬이므로 flex-row-reverse 및 padding 반전 (pl-5 pr-1)
                                  className="inline-flex flex-row-reverse items-center bg-white/90 backdrop-blur-sm rounded-full pl-5 pr-1 py-3 gap-3 shadow-sm border border-white/20"
                                >
                                  <ImageWithFallback
                                    src={comment.userAvatar}
                                    alt={comment.userName}
                                    // [수정] 이미지: w-11 h-11, -my-4, -mr-2(오른쪽돌출)
                                    className="w-9 h-9 rounded-full object-cover border-2 border-white -my-4 -mr-0.5 shadow-sm"
                                  />
                                  {/* [수정] max-w-[180px], truncate 유지, flex-shrink 추가 */}
                                  <p className="text-[15px] text-gray-900 font-medium leading-none max-w-[180px] truncate flex-shrink">
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

                          {/* === [수정된 부분: 하단 프로필 캡슐 및 댓글 카운트 (Outside State)] === */}
                          <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10 max-w-[90%]">
                            {/* 1. 프로필 + 텍스트 캡슐 - shrink-0 제거 */}
                            <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-5 py-3 gap-3 shadow-sm border border-white/20">
                              <ImageWithFallback
                                src={
                                  post.userName ===
                                  currentUserName
                                    ? currentUserAvatar
                                    : post.userAvatar
                                }
                                alt={post.userName}
                                className="w-12 h-12 rounded-full object-cover border-3 border-white -my-4 -ml-2 shadow-sm"
                              />
                              {/* [수정] max-w-[150px] -> max-w-[130px] */}
                              <span className="text-[15px] text-gray-900 font-bold leading-none max-w-[130px] truncate block flex-shrink">
                                {post.textOverlay ||
                                  post.userName}
                              </span>
                            </div>

                            {/* 2. 댓글 카운트 말풍선 */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-2 font-bold flex items-center justify-center shadow-sm border border-white/20 shrink-0 relative text-[16px]">
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
                                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                          {/* ================================================= */}
                        </>
                      )}
                    </motion.div>

                    {/* 댓글 입력창 - 이미지 카드 바로 아래 16px 간격 */}
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
                                  className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]/80 backdrop-blur-md text-gray-800 rounded-full"
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
                                  exit={{ opacity: 0, y: 10 }}
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
                                  {emojis.map((emoji) => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        handleEmojiReaction(
                                          emoji,
                                          post.id,
                                        );
                                        // === [NEW] 분리된 애니메이션 함수 호출 ===
                                        triggerReactionAnimation(
                                          emoji,
                                        );
                                        // ======================================
                                      }}
                                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-2xl bg-[#F5F5F5]/80 backdrop-blur-md rounded-full transition-colors"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
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
                                  exit={{ opacity: 0, y: 10 }}
                                  transition={{
                                    duration: 0.2,
                                  }}
                                  className="absolute inset-y-1 inset-x-0 flex items-center bg-[#F5F5F5]/80 backdrop-blur-md rounded-full px-4"
                                >
                                  <input
                                    type="text"
                                    placeholder="댓글을 작성해주세요"
                                    className="w-full bg-transparent outline-none text-[#1A1A1A] placeholder:text-gray-400"
                                    value={
                                      currentPostId === post.id
                                        ? newComment
                                        : ""
                                    }
                                    onChange={(e) => {
                                      if (
                                        currentPostId ===
                                        post.id
                                      ) {
                                        setNewComment(
                                          e.target.value,
                                        );
                                      }
                                    }}
                                    onFocus={() =>
                                      setCurrentPostId(post.id)
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
              );
            })}
          </div>
        )}
      </div>

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
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[320px] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg mb-2">
                  글을 삭제하시겠습니까?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  삭제한 글은 복구할 수 없습니다.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 이미지 확대 보기 모달 (Lightbox) */}
      <AnimatePresence>
        {expandedPostId && expandedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            // [수정] 닫기 핸들러 사용
            onClick={handleCloseLightbox}
          >
            <motion.div
              layoutId={`post-${expandedPostId}`}
              className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ImageWithFallback
                src={expandedPost.image}
                alt={expandedPost.caption}
                className="w-full h-full object-cover"
              />
              {/* 닫기 버튼 제거됨 */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 커뮤니티 전용 하단 네비게이션 (80px) */}
      {!isGridView && !isReactionView && (
        <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[500px] mx-auto bg-white">
          <div className="relative px-4 pt-2 pb-4 shadow-[0_-2px_5px_0_rgba(0,0,0,0.10)] rounded-t-[16px] h-[80px]">
            <div className="flex items-center justify-around">
              <button
                onClick={() => setIsGridView(true)}
                className="flex flex-col items-center gap-1 text-gray-800"
              >
                <LayoutGrid size={24} />
                <span className="text-xs font-semibold">
                  모아보기
                </span>
              </button>
              <div className="w-16" />
              <button
                className="flex flex-col items-center gap-1 text-gray-400"
                onClick={() => onPageChange?.("calendar")}
              >
                <Calendar size={24} />
                <span className="text-xs">캘린더</span>
              </button>
            </div>
            <button
              className="absolute left-1/2 -translate-x-1/2 -top-[16px] w-14 h-14 bg-[#36D2C5] rounded-full flex items-center justify-center shadow-lg hover:bg-[#00C2B3] transition-colors"
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