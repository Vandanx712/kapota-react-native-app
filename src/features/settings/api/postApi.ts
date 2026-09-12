import { api } from "@/lib/api";

type GetMyPostsParams = {
  cursor?: string | null;
  limit?: number;
};

export interface CreatePostPayload {
  caption?: string;
  disableShare?: boolean;
  hideLikes?: boolean;
  image?: string;
  isArchived?: boolean;
  location?: {
    coordinates: [number, number];
    name: string;
    type: "Point";
  } | null;
  mediaId?: string;
}

export const getMyPosts = async (params: GetMyPostsParams = {}) => {
  const response = await api.get("/post/myposts", { params });
  return response.data;
};

export const getPostFeed = async (params: { cursor?: string | null; limit?: number } = {}) => {
  const response = await api.get("/post/feed", { params });
  return response.data;
};

export const createPostApi = async (data: CreatePostPayload) => {
  const response = await api.post("/post", data);
  return response.data;
};

export const toggleLikePostApi = async (postId: string) => {
  const response = await api.put(`/post/${postId}`);
  return response.data;
};

export const getPostDetailApi = async (postId: string) => {
  const response = await api.get(`/post/detail/${postId}`);
  return response.data;
};

export const updatePostSettings = async (data: {
  postId: string;
  hideLikes: boolean;
  disableShare: boolean;
  isArchived: boolean;
}) => {
  const response = await api.put("/post", data);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await api.delete(`/post/${postId}`);
  return response.data;
};

export const getSuggestion = async (coords?: { lat: number; lng: number }) => {
  const response = await api.get("/service/get/places", {
    params: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
  });
  return response.data;
};

export const searchLocation = async (query: string) => {
  const response = await api.get(`/service/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const getPlaceDetail = async (id: string) => {
  const response = await api.get(`/service/detail/${id}`);
  return response.data;
};


