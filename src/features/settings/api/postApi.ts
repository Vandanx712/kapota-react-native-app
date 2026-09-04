import { api } from "@/lib/api";

type GetMyPostsParams = {
  cursor?: string | null;
  limit?: number;
};

export const getMyPosts = async (params: GetMyPostsParams = {}) => {
  const response = await api.get("/post/my", { params });
  return response.data;
};

export const updatePostSettings = async (data: {
  postId: string;
  hideLikes: boolean;
  disableShare: boolean;
  isArchived: boolean;
}) => {
  const response = await api.put("/post/settings", data);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/post/${postId}`);
  return response.data;
};
