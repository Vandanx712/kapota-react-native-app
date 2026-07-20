import axios from "axios";
import { create } from "zustand";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  deletePost as deletePostApi,
  getMyPosts,
  updatePostSettings,
} from "../api/postApi";
import type { PostSummary, UserPost } from "../types/settings.types";
import { mergeUniqueById } from "../utils/settings.utils";

interface SettingsState {
  myPosts: UserPost[];
  postLoading: boolean;
  isMorePostsLoading: boolean;
  updatingPostId: string;
  postCursor: string | null;
  hasMorePosts: boolean;
  postSummary: PostSummary;

  loadMyPosts: (options?: {
    reset?: boolean;
    cursor?: string | null;
  }) => Promise<void>;
  updatePostSetting: (
    postId: string,
    field: "hideLike" | "disableShare" | "isArchived",
    checked: boolean,
  ) => Promise<void>;
  removePost: (post: UserPost) => Promise<void>;
  resetPosts: () => void;
}

const emptySummary: PostSummary = {
  total: 0,
  archived: 0,
  hiddenLikes: 0,
  shareDisabled: 0,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  myPosts: [],
  postLoading: false,
  isMorePostsLoading: false,
  updatingPostId: "",
  postCursor: null,
  hasMorePosts: false,
  postSummary: emptySummary,

  resetPosts: () => {
    set({
      myPosts: [],
      postCursor: null,
      hasMorePosts: false,
      postSummary: emptySummary,
    });
  },

  loadMyPosts: async ({ reset = false, cursor = null } = {}) => {
    try {
      if (reset) {
        set({ postLoading: true });
      } else {
        set({ isMorePostsLoading: true });
      }

      const response = await getMyPosts({ cursor, limit: 12 });
      const nextPosts: UserPost[] = response.posts ?? [];

      set((state) => ({
        myPosts: reset
          ? nextPosts
          : mergeUniqueById(state.myPosts, nextPosts),
        postCursor: response.nextCursor ?? null,
        hasMorePosts: Boolean(response.hasMore),
        postSummary: response.summary ?? emptySummary,
      }));
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to load posts";
      showErrorToast(message ?? "Failed to load posts");
    } finally {
      set({ postLoading: false, isMorePostsLoading: false });
    }
  },

  updatePostSetting: async (postId, field, checked) => {
    const { myPosts, postSummary } = get();
    const previousPosts = [...myPosts];
    const previousSummary = { ...postSummary };
    const previousPost = myPosts.find((post) => post._id === postId);

    const updatedPosts = myPosts.map((post) =>
      post._id === postId ? { ...post, [field]: checked } : post,
    );

    set({ myPosts: updatedPosts });

    if (previousPost && previousPost[field] !== checked) {
      set({
        postSummary: {
          ...postSummary,
          archived:
            field === "isArchived"
              ? postSummary.archived + (checked ? 1 : -1)
              : postSummary.archived,
          hiddenLikes:
            field === "hideLike"
              ? postSummary.hiddenLikes + (checked ? 1 : -1)
              : postSummary.hiddenLikes,
          shareDisabled:
            field === "disableShare"
              ? postSummary.shareDisabled + (checked ? 1 : -1)
              : postSummary.shareDisabled,
        },
      });
    }

    set({ updatingPostId: postId });

    const changedPost = updatedPosts.find((post) => post._id === postId);

    try {
      const response = await updatePostSettings({
        postId,
        hideLikes: changedPost?.hideLike ?? false,
        disableShare: changedPost?.disableShare ?? false,
        isArchived: changedPost?.isArchived ?? false,
      });
      showSuccessToast(response.message ?? "Post updated");
    } catch (error) {
      set({ myPosts: previousPosts, postSummary: previousSummary });
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to update post";
      showErrorToast(message ?? "Failed to update post");
    } finally {
      set({ updatingPostId: "" });
    }
  },

  removePost: async (post) => {
    try {
      set({ updatingPostId: post._id });
      const response = await deletePostApi(post._id);

      set((state) => ({
        myPosts: state.myPosts.filter((item) => item._id !== post._id),
        postSummary: {
          total: Math.max(state.postSummary.total - 1, 0),
          archived: Math.max(
            state.postSummary.archived - (post.isArchived ? 1 : 0),
            0,
          ),
          hiddenLikes: Math.max(
            state.postSummary.hiddenLikes - (post.hideLike ? 1 : 0),
            0,
          ),
          shareDisabled: Math.max(
            state.postSummary.shareDisabled - (post.disableShare ? 1 : 0),
            0,
          ),
        },
      }));

      showSuccessToast(response.message ?? "Post deleted");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Failed to delete post";
      showErrorToast(message ?? "Failed to delete post");
    } finally {
      set({ updatingPostId: "" });
    }
  },
}));
