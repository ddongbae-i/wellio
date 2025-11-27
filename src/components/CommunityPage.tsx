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
import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
} from "react";
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

// 드롭다운 컴포넌트
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
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

  const [expandedPostId, setExpandedPostId] = useState<
    number | null
  >(null);
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
  const [isKeyboardVisible, setIsKeyboardVisible] =
    useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
        prev.filter(
          (e) => !newEmojis.some((ne) => ne.id === e.id),
        ),
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
      const hasMyComment = addedComments[post.id]?.some(
        (comment) => comment.userName === currentUser.userName,
      );

      const hasMyAddedReaction = addedReactions[post.id]?.some(
        (reaction) =>
          reaction.users.some(
            (user) => user.userName === currentUser.userName,
          ),
      );

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

      if (selectedFamilyMember) {
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

    return myReactedPosts.filter((post) => {
      const hasAddedReaction = addedReactions[post.id]?.some(
        (reaction) =>
          reaction.emoji === reactionFilter &&
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          ),
      );

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

  const getMyUsedEmojis = () => {
    const usedEmojis = new Set<string>();

    posts.forEach((post) => {
      post.reactions?.forEach((reaction) => {
        if (
          reaction.users.some(
            (u) => u.userName === currentUser.userName,
          )
        ) {
          usedEmojis.add(reaction.emoji);
        }
      });

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

  const handleCloseLightbox = () => {
    setLastExpandedId(expandedPostId);
    setExpandedPostId(null);
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedFamilyMember) {
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

  useEffect(() => {
    if (filteredPosts.length > 0 && !currentPostId) {
      setCurrentPostId(filteredPosts[0].id);
    }
  }, [filteredPosts, currentPostId]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport)
      return;

    const handleResize = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;

      const diff = window.innerHeight - viewport.height; // 🔹키보드가 차지한 높이(대략)
      const isKeyboard = diff > 80; // 너무 민감하지 않게 임계값

      setIsKeyboardVisible(isKeyboard);
      setKeyboardHeight(isKeyboard ? diff : 0);
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
      {/* Header (80px) */}
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

      {/* Content Area */}
      <div
        className="w-full overflow-hidden"
        style={{
          height:
            isGridView || isReactionView
              ? "calc(100vh - 80px)"
              : "calc(100vh - 80px - 80px)",
        }}
      >
        {isReactionView ? (
          <div className="pb-20">
            <div className="px-4 py-4 flex gap-3 overflow-x-auto scrollbar-hide bg-white sticky top-0 z-20 justify-center">
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
          // ===== 리스트 뷰 (스냅) =====
          <div className="w-full px-5 xs:px-6 sm:px-8 snap-y snap-mandatory overflow-y-auto h-full scrollbar-hide">
            {filteredPosts.map((post) => {
              const isDeleting = postToDelete === post.id;
              const isFocusedCard =
                isKeyboardVisible && currentPostId === post.id;

              // 키보드 높이에서 약간(24px)만 빼서 여유
              const shift = Math.max(0, keyboardHeight - 24);

              const cardTransform =
                isFocusedCard && isKeyboardVisible
                  ? `translateY(-${shift}px)`
                  : "translateY(0)";

              const imageAndInputMaxWidth: CSSProperties = {
                maxWidth:
                  "min(100%, calc((100vh - 264px) * 335 / 400))",
              };
              return (
                <div
                  key={post.id}
                  className={`snap-start snap-always h-full w-full flex justify-center ${
                    isKeyboardVisible
                      ? "items-start pt-5"
                      : "items-center"
                  }`}
                >
                  {/* 카드 전체 : 이미지 + 이모지/댓글창 (가로폭 동일) */}
                  <div
                    className="w-full flex flex-col items-center"
                    style={{
                      transform: cardTransform,
                      transition: "transform 0.25s ease-out",
                    }}
                  >
                    {" "}
                    {/* 1) 이미지 카드 - 비율 유지 aspect-[335/400] */}
                    <div
                      className="relative w-full aspect-[335/400] overflow-visible flex-shrink-0"
                      style={imageAndInputMaxWidth}
                    >
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

                        {/* ====== 디테일 모드 (탭해서 들어간 상태) ====== */}
                        {selectedPostForReaction ===
                          post.id && (
                          <div
                            className="absolute inset-0 bg-black/70 z-10 flex flex-col cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPostForReaction(null);
                            }}
                          >
                            {/* 리액션 묶음 */}
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
                                    <div className="flex -space-x-2.5">
                                      {reaction.users
                                        .slice(0, 3)
                                        .map(
                                          (user, userIdx) => (
                                            <ImageWithFallback
                                              key={`${reaction.emoji}-${user.userName}-${userIdx}`}
                                              src={
                                                user.userAvatar
                                              }
                                              alt={
                                                user.userName
                                              }
                                              className={`w-7 h-7 rounded-full object-cover border-2 border-white transition-all duration-300 ${
                                                userIdx === 0
                                                  ? "ml-0"
                                                  : ""
                                              }`}
                                              style={{
                                                zIndex:
                                                  reaction.users
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
                                          style={{ zIndex: 0 }}
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

                            {/* 하단 프로필 캡슐 */}
                            {(post.textOverlay ||
                              post.userName) && (
                              <div className="absolute bottom-4 left-4 flex items-center gap-3 z-20 max-w-[90%]">
                                <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full pl-1 pr-5 py-3 gap-3 shadow-sm border border-white/20">
                                  <ImageWithFallback
                                    src={post.userAvatar}
                                    alt={post.userName}
                                    className="w-12 h-12 rounded-full object-cover border-3 border-white -my-4 -ml-2 shadow-sm"
                                  />
                                  <p className="text-[15px] text-gray-900 font-bold leading-none max-w-[130px] truncate flex-shrink">
                                    {post.textOverlay ||
                                      post.userName}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* 댓글 버블들 */}
                            {getAllComments(
                              post.id,
                              post.comments,
                            ).length > 0 && (
                              <div className="absolute bottom-20 right-0 flex flex-col gap-5 items-end max-w-[70%] max-h-[50vh] overflow-y-auto z-20 p-4 scrollbar-hide">
                                {getAllComments(
                                  post.id,
                                  post.comments,
                                ).map((comment, idx) => (
                                  <div
                                    key={`comment-${post.id}-${idx}-${comment.userName}-${comment.timestamp}`}
                                    className="inline-flex flex-row-reverse items-center bg-white/90 backdrop-blur-sm rounded-full pl-5 pr-1 py-3 gap-3 shadow-sm border border-white/20"
                                  >
                                    <ImageWithFallback
                                      src={comment.userAvatar}
                                      alt={comment.userName}
                                      className="w-9 h-9 rounded-full object-cover border-2 border-white -my-4 -mr-0.5 shadow-sm"
                                    />
                                    <p className="text-[15px] text-gray-900 font-medium leading-none max-w-[180px] truncate flex-shrink">
                                      {comment.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* ====== 기본 카드 상태 ====== */}
                        {selectedPostForReaction !==
                          post.id && (
                          <>
                            {/* 상단 태그들 */}
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

                            {/* 뱃지만 있을 때 */}
                            {post.badge &&
                              !post.location &&
                              !post.weather &&
                              !post.time &&
                              !post.health && (
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 text-sm font-medium">
                                  <span>{post.badge}</span>
                                </div>
                              )}

                            {/* 하단 프로필+댓글 카운트 */}
                            <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10 max-w-[90%]">
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
                                <span className="text-[15px] text-gray-900 font-bold leading-none max-w-[130px] truncate block flex-shrink">
                                  {post.textOverlay ||
                                    post.userName}
                                </span>
                              </div>

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
                          </>
                        )}
                      </motion.div>
                    </div>
                    {/* 2) 이모지 + 댓글 입력창  */}
                    {/*   → 이미지와 같은 가로폭, 위에서 정확히 16px 떨어짐 (mt-4) */}
                    <div
                      className="mt-4 h-[48px] w-full"
                      style={imageAndInputMaxWidth}
                    >
                      <div className="z-40 pointer-events-none w-full h-full">
                        <div className="relative w-full h-full pointer-events-auto">
                          <div className="flex items-center gap-2 w-full h-full">
                            <button
                              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors overflow-hidden relative"
                              onClick={() => {
                                setCurrentPostId(post.id);
                                setShowEmojiPicker((prev) =>
                                  currentPostId === post.id
                                    ? !prev
                                    : true,
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
                                    exit={{
                                      opacity: 0,
                                      y: 10,
                                    }}
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
                                        currentPostId ===
                                        post.id
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
                    {/* === 여기까지가 카드 하나 (이미지 + 댓글창) === */}
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

      {/* 이미지 라이트박스 */}
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
              className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl"
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

      {/* 하단 네비 (커뮤니티 탭 전용) */}
      {!isGridView && !isReactionView && !isKeyboardVisible && (
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