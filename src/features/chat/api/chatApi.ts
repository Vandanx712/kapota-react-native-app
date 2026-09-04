import { api } from "@/lib/api";
import type {
  ChatMessage,
  ChatUser,
  Conversation,
} from "../types/chat.types";
import type { SendMessageInput } from "../types/store.types";

type QueryParams = Record<string, boolean | number | string | null | undefined>;

type PaginatedResponse<T> = {
  filtered?: T[];
  hasMore?: boolean;
  messages?: T[];
  nextCursor?: string | null;
  users?: T[];
};

export type ConversationResponse = {
  conversation?: Conversation;
  filtered?: Conversation[];
  message?: string;
  newConversation?: Conversation;
};

const buildParams = (params: QueryParams = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    ),
  );

export const getConversations = async (): Promise<ConversationResponse> => {
  const response = await api.get<ConversationResponse>("/conversation/");
  return response.data;
};

export const getSurroundUsers = async (
  params: QueryParams = {},
): Promise<PaginatedResponse<ChatUser>> => {
  const response = await api.get<PaginatedResponse<ChatUser>>(
    "/conversation/getusers",
    { params: buildParams(params) },
  );
  return response.data;
};

export const getAllUsers = async (
  params: QueryParams = {},
): Promise<PaginatedResponse<ChatUser>> => {
  const response = await api.get<PaginatedResponse<ChatUser>>(
    "/user/getusers",
    { params: buildParams(params) },
  );
  return response.data;
};

export const createConversation = async (
  userId: string,
): Promise<ConversationResponse> => {
  const response = await api.post<ConversationResponse>(
    `/conversation/${userId}`,
  );
  return response.data;
};

export const createGroup = async (data: FormData | Record<string, unknown>) => {
  const response = await api.post("/conversation/group/create", data);
  return response.data;
};

export const getOtherUsers = async (
  conversationId: string,
  params: QueryParams = {},
) => {
  const response = await api.get(
    `/conversation/otherusers/${conversationId}`,
    { params: buildParams(params) },
  );
  return response.data;
};

export const updateGroupDetail = async (
  data: FormData | Record<string, unknown>,
) => {
  const response = await api.put("/conversation/update/group", data);
  return response.data;
};

export const updateMembers = async (data: Record<string, unknown>) => {
  const response = await api.put("/conversation/update/member", data);
  return response.data;
};

export const updateConBgimage = async (
  data: FormData | Record<string, unknown>,
) => {
  const response = await api.put("/conversation/settheme", data);
  return response.data;
};

export const contactDetail = async (
  userId: string,
  params: QueryParams = {},
) => {
  const response = await api.get(`/user/${userId}`, {
    params: buildParams(params),
  });
  return response.data;
};

export const deleteConversation = async (conversationId: string) => {
  const response = await api.delete(
    `/conversation/delete/${conversationId}`,
  );
  return response.data;
};

export const exitGroup = async (conversationId: string) => {
  const response = await api.put(
    `/conversation/exitgroup/${conversationId}`,
  );
  return response.data;
};

export const getMessages = async (
  conversationId: string,
  params: QueryParams = {},
): Promise<PaginatedResponse<ChatMessage>> => {
  const response = await api.get<PaginatedResponse<ChatMessage>>(
    `/message/${conversationId}`,
    { params: buildParams(params) },
  );
  return response.data;
};

export const getMessageImages = async (
  conversationId: string,
  params: QueryParams = {},
) => {
  const response = await api.get(`/message/media/${conversationId}`, {
    params: buildParams(params),
  });
  return response.data;
};

export const sendMessage = async (
  conversationId: string,
  data: SendMessageInput | FormData,
): Promise<{ newMessage: ChatMessage }> => {
  const response = await api.post<{ newMessage: ChatMessage }>(
    `/message/${conversationId}`,
    data,
  );
  return response.data;
};

export const updateMessage = async (
  messageId: string,
  data: Record<string, unknown>,
) => {
  const response = await api.put(`/message/update/${messageId}`, data);
  return response.data;
};

export const deleteMessage = async (
  messageId: string,
  data: Record<string, unknown>,
) => {
  const response = await api.put(`/message/delete/${messageId}`, data);
  return response.data;
};

export const clearChat = async (conversationId: string) => {
  const response = await api.put(`/message/clear/${conversationId}`);
  return response.data;
};

export const searchMessages = async (
  conversationId: string,
  params: QueryParams = {},
): Promise<PaginatedResponse<ChatMessage>> => {
  const response = await api.get<PaginatedResponse<ChatMessage>>(
    `/message/search/${conversationId}`,
    { params: buildParams(params) },
  );
  return response.data;
};
