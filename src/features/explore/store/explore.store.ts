import { create } from "zustand";
import { getPostFeed, toggleLikePostApi } from "@/features/settings/api/postApi";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { showErrorToast } from "@/utils/toast";

export interface PostItem {
  _id: string;
  caption?: string;
  createdAt: string;
  disableShare?: boolean;
  hideLike?: boolean;
  image?: {
    key?: string;
    url: string;
  };
  isArchived?: boolean;
  isLiked?: boolean;
  likesCount?: number;
  location?: {
    coordinates?: [number, number];
    name?: string;
    type?: string;
  };
  user: {
    _id: string;
    fullname: string;
    profilePic?: {
      url: string;
    } | null;
  };
}

interface ExploreState {
  posts: PostItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  cursor: string | null;

  fetchFeed: (reset?: boolean) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  syncSocketLike: (data: {
    postId: string;
    userId: string;
    liked: boolean;
    likesCount: number;
  }) => void;
  joinPost: (postId: string) => void;
  leavePost: (postId: string) => void;
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  hasMore: true,
  cursor: null,

  fetchFeed: async (reset = false) => {
    const { cursor, hasMore, isLoading, isRefreshing } = get();
    if (!reset && (!hasMore || isLoading || isRefreshing)) return;

    if (reset) {
      set({ isRefreshing: true, cursor: null });
    } else {
      set({ isLoading: true });
    }

    try {
      const activeCursor = reset ? null : cursor;
      const response = await getPostFeed({ cursor: activeCursor, limit: 10 });
      const incomingPosts: PostItem[] = response.posts || [];

      set((state) => {
        const existingMap = new Map(reset ? [] : state.posts.map((p) => [p._id, p]));
        incomingPosts.forEach((p) => existingMap.set(p._id, p));

        return {
          posts: [...existingMap.values()],
          cursor: response.nextCursor ?? null,
          hasMore: Boolean(response.hasMore),
        };
      });
    } catch {
      showErrorToast("Unable to load community posts");
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  likePost: async (postId: string) => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) return;

    // Optimistic toggle
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post._id !== postId) return post;
        const nextLiked = !post.isLiked;
        const currentCount = post.likesCount || 0;
        return {
          ...post,
          isLiked: nextLiked,
          likesCount: Math.max(0, currentCount + (nextLiked ? 1 : -1)),
        };
      }),
    }));

    try {
      const res = await toggleLikePostApi(postId);
      if (typeof res?.likesCount === "number") {
        set((state) => ({
          posts: state.posts.map((p) =>
            p._id === postId
              ? { ...p, isLiked: res.liked, likesCount: res.likesCount }
              : p,
          ),
        }));
      }
    } catch {
      // Revert on failure
      set((state) => ({
        posts: state.posts.map((post) => {
          if (post._id !== postId) return post;
          const nextLiked = !post.isLiked;
          return {
            ...post,
            isLiked: nextLiked,
            likesCount: Math.max(0, (post.likesCount || 0) + (nextLiked ? 1 : -1)),
          };
        }),
      }));
      showErrorToast("Could not update like");
    }
  },

  syncSocketLike: (data) => {
    const authUser = useAuthStore.getState().authUser;
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post._id !== data.postId && post._id !== (data as any).id) return post;
        const isCurrent = authUser?._id && String(data.userId) === String(authUser._id);
        return {
          ...post,
          isLiked: isCurrent ? data.liked : post.isLiked,
          likesCount: data.likesCount,
        };
      }),
    }));
  },

  joinPost: (postId: string) => {
    const socket = useAuthStore.getState().socket;
    socket?.emit("joinPost", postId);
  },

  leavePost: (postId: string) => {
    const socket = useAuthStore.getState().socket;
    socket?.emit("leavePost", postId);
  },
}));
