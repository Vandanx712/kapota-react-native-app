import { isAxiosError } from "axios";
import { create } from "zustand";

import { appStorage } from "@/services/storage/appStorage";
import { getAuthSocketSession } from "@/services/socket/authSocketSession";
import { mediaStorageService } from "@/services/storage/mediaStorageService";
import { showErrorToast } from "@/utils/toast";
import {
    createConversation as createConversationRequest,
    getAllUsers,
    getConversations,
    getMessages as getMessagesRequest,
    sendMessage as sendMessageRequest,
} from "../api/chatApi";
import type { ChatMessage, ChatUser, Conversation } from "../types/chat.types";
import type { ChatState } from "../types/store.types";

const MESSAGE_PAGE_LIMIT = 30;
const USER_PAGE_LIMIT = 30;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};

const normalizeConversation = (
  value: Partial<Conversation> & { _id?: string },
): Conversation | null => {
  const conversationId = String(value.conversationId ?? value._id ?? "");
  if (!conversationId) return null;

  return {
    ...value,
    conversationId,
    name: value.name ?? value.groupdetail?.groupname ?? "Conversation",
  } as Conversation;
};

const mergeUniqueUsers = (current: ChatUser[], incoming: ChatUser[]) => {
  const users = new Map(current.map((user) => [user._id, user]));
  incoming.forEach((user) => users.set(user._id, user));
  return [...users.values()];
};

const mergeUniqueMessages = (
  current: ChatMessage[],
  incoming: ChatMessage[],
) => {
  const messages = new Map<string, ChatMessage>();
  [...current, ...incoming].forEach((message) => {
    if (message._id) messages.set(message._id, message);
  });
  return [...messages.values()];
};

const markMessagesSeenLocally = (
  messages: ChatMessage[],
  currentUserId?: string,
) =>
  messages.map((message) => {
    if (
      message.system ||
      !currentUserId ||
      message.sender === currentUserId ||
      message.seenBy?.includes(currentUserId)
    ) {
      return message;
    }

    return {
      ...message,
      seenBy: [...(message.seenBy ?? []), currentUserId],
    };
  });

const emitUnseenMessages = (
  messages: ChatMessage[],
  currentUserId?: string,
) => {
  const { socket } = getAuthSocketSession();
  if (!socket || !currentUserId) return;

  messages.forEach((message) => {
    if (
      !message.system &&
      message.sender !== currentUserId &&
      !message.seenBy?.includes(currentUserId)
    ) {
      socket.emit("msgseen", {
        msgId: message._id,
        senderId: message.sender,
      });
    }
  });
};

const initialState = {
  conversationError: null,
  conversations: (appStorage.getCachedConversations<Conversation[]>() ?? []) as Conversation[],
  hasMoreMessages: false,
  hasMoreSurroundingUsers: false,
  isConversationLoading: false,
  isMessageLoading: false,
  isMoreMessagesLoading: false,
  isMoreSurroundingUsersLoading: false,
  isUsersLoading: false,
  messageCursor: null,
  messageError: null,
  messages: [] as ChatMessage[],
  selectedConversation: null,
  surroundingUsersCursor: null,
  typing: null,
  users: [] as ChatUser[],
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  getConversation: async () => {
    set({
      conversationError: null,
      isConversationLoading: get().conversations.length === 0,
    });
    try {
      const response = await getConversations();
      const conversations = response.filtered ?? [];
      appStorage.setCachedConversations(conversations);
      set({ conversations });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load conversations");
      set({ conversationError: message });
      if (get().conversations.length === 0) {
        showErrorToast(message);
      }
    } finally {
      set({ isConversationLoading: false });
    }
  },

  getSurroundingUsers: async () => {
    set({
      hasMoreSurroundingUsers: false,
      isMoreSurroundingUsersLoading: false,
      isUsersLoading: true,
      surroundingUsersCursor: null,
      users: [],
    });

    try {
      const response = await getAllUsers({ limit: USER_PAGE_LIMIT });
      set({
        hasMoreSurroundingUsers: Boolean(response.hasMore),
        surroundingUsersCursor: response.nextCursor ?? null,
        users: response.users ?? response.filtered ?? [],
      });
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to load people"));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  loadMoreSurroundingUsers: async () => {
    const {
      hasMoreSurroundingUsers,
      isMoreSurroundingUsersLoading,
      isUsersLoading,
      surroundingUsersCursor,
    } = get();

    if (
      !hasMoreSurroundingUsers ||
      !surroundingUsersCursor ||
      isUsersLoading ||
      isMoreSurroundingUsersLoading
    ) {
      return;
    }

    set({ isMoreSurroundingUsersLoading: true });
    try {
      const response = await getAllUsers({
        cursor: surroundingUsersCursor,
        limit: USER_PAGE_LIMIT,
      });
      set((state) => ({
        hasMoreSurroundingUsers: Boolean(response.hasMore),
        surroundingUsersCursor: response.nextCursor ?? null,
        users: mergeUniqueUsers(
          state.users,
          response.users ?? response.filtered ?? [],
        ),
      }));
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to load more people"));
    } finally {
      set({ isMoreSurroundingUsersLoading: false });
    }
  },

  createConversation: async (userId) => {
    try {
      const response = await createConversationRequest(userId);
      const conversation = normalizeConversation(
        response.conversation ?? response.newConversation ?? {},
      );

      if (conversation) {
        get().refreshGroupMember("NEW_CONVERSATION", conversation);
        get().setSelectedConversation(conversation);
        return conversation;
      }

      await get().getConversation();
      const created = get().conversations.find(
        (item) => !item.isgroup && item.oruserId === userId,
      );
      if (created) get().setSelectedConversation(created);
      return created ?? null;
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to start conversation"));
      return null;
    }
  },

  setSelectedConversation: (selectedConversation) => {
    set((state) => ({
      selectedConversation,
      conversations: state.conversations.map((conversation) =>
        conversation.conversationId === selectedConversation.conversationId
          ? { ...conversation, unseenMsg: 0 }
          : conversation,
      ),
      messageError: null,
    }));
  },

  clearSelectedConversation: (conversationId) => {
    set((state) => ({
      selectedConversation:
        !conversationId ||
        state.selectedConversation?.conversationId === conversationId
          ? null
          : state.selectedConversation,
      typing: null,
    }));
  },

  getMessages: async (conversationId) => {
    const targetId =
      conversationId ?? get().selectedConversation?.conversationId;
    if (!targetId) return;

    const cached = appStorage.getCachedMessages<ChatMessage[]>(targetId);
    const hasCached = Boolean(cached && cached.length > 0);

    set({
      hasMoreMessages: false,
      isMessageLoading: !hasCached,
      isMoreMessagesLoading: false,
      messageCursor: null,
      messageError: null,
      messages: cached ?? [],
    });

    try {
      const response = await getMessagesRequest(targetId, {
        limit: MESSAGE_PAGE_LIMIT,
      });
      if (get().selectedConversation?.conversationId !== targetId) return;

      const incoming = response.messages ?? [];
      const currentUserId = getAuthSocketSession().authUser?._id;
      emitUnseenMessages(incoming, currentUserId);
      const updatedMessages = markMessagesSeenLocally(incoming, currentUserId);
      appStorage.setCachedMessages(targetId, updatedMessages);
      set({
        hasMoreMessages: Boolean(response.hasMore),
        messageCursor: response.nextCursor ?? null,
        messages: updatedMessages,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load messages");
      set({ messageError: message });
      if (get().messages.length === 0) {
        showErrorToast(message);
      }
    } finally {
      set({ isMessageLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const {
      hasMoreMessages,
      isMessageLoading,
      isMoreMessagesLoading,
      messageCursor,
      selectedConversation,
    } = get();

    if (
      !selectedConversation ||
      !messageCursor ||
      !hasMoreMessages ||
      isMessageLoading ||
      isMoreMessagesLoading
    ) {
      return;
    }

    const targetId = selectedConversation.conversationId;
    set({ isMoreMessagesLoading: true });
    try {
      const response = await getMessagesRequest(targetId, {
        cursor: messageCursor,
        limit: MESSAGE_PAGE_LIMIT,
      });
      if (get().selectedConversation?.conversationId !== targetId) return;

      const incoming = response.messages ?? [];
      const currentUserId = getAuthSocketSession().authUser?._id;
      emitUnseenMessages(incoming, currentUserId);
      set((state) => ({
        hasMoreMessages: Boolean(response.hasMore),
        messageCursor: response.nextCursor ?? null,
        messages: mergeUniqueMessages(
          markMessagesSeenLocally(incoming, currentUserId),
          state.messages,
        ),
      }));
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to load older messages"));
    } finally {
      set({ isMoreMessagesLoading: false });
    }
  },

  sendMessage: async (data) => {
    const selectedConversation = get().selectedConversation;
    if (!selectedConversation) return false;

    const { authUser } = getAuthSocketSession();
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      conversationId: selectedConversation.conversationId,
      sender: authUser?._id ?? "",
      text: data.text,
      createdAt: new Date().toISOString(),
      status: "pending",
      replyTo: null,
      ...(data.imageUri
        ? {
            media: {
              _id: tempId,
              url: data.imageUri,
              mimeType: "image/jpeg",
              originalName: "photo.jpg",
              bytes: 0,
              resourceType: "image",
            },
          }
        : {}),
    };

    // 1. Immediately update UI state (optimistic)
    const nextMessages = [...get().messages, optimisticMessage];
    set({ messages: nextMessages });
    get().setNmsgInCon(optimisticMessage);

    // 2. Persist to MMKV cached messages and Outbox queue (WhatsApp mindset)
    appStorage.setCachedMessages(
      selectedConversation.conversationId,
      nextMessages,
    );
    appStorage.addToOutbox({
      createdAt: optimisticMessage.createdAt!,
      data,
      conversationId: selectedConversation.conversationId,
      tempId,
    });

    try {
      const response = await sendMessageRequest(
        selectedConversation.conversationId,
        data,
      );
      if (response.newMessage) {
        const confirmed: ChatMessage = {
          ...response.newMessage,
          status: "sent",
        };
        const updatedMessages = get().messages.map((m) =>
          m._id === tempId ? confirmed : m,
        );
        set({ messages: updatedMessages });
        appStorage.setCachedMessages(
          selectedConversation.conversationId,
          updatedMessages,
        );
        appStorage.removeFromOutbox(tempId);
        get().setNmsgInCon(confirmed);
      }
      return true;
    } catch (error) {
      // Check if it was a fatal rejection (e.g. 400 Bad Request, 403 Forbidden)
      if (
        isAxiosError(error) &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        appStorage.removeFromOutbox(tempId);
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === tempId ? { ...m, status: "failed" } : m,
          ),
        }));
        showErrorToast(getErrorMessage(error, "Unable to send message"));
        return false;
      }

      // If offline or network connection error: keep status as "pending" (clock icon)
      // and do not show an intrusive toast. The outbox sync will send it once online.
      return true;
    }
  },

  retrySendMessage: async (message) => {
    const selectedConversation = get().selectedConversation;
    if (!selectedConversation) return false;

    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === message._id ? { ...m, status: "pending" } : m,
      ),
    }));

    const sendData = {
      text: message.text,
      image: message.image?.url,
      replyTo: message.replyTo?._id,
    };

    appStorage.addToOutbox({
      createdAt: new Date().toISOString(),
      data: sendData,
      conversationId: selectedConversation.conversationId,
      tempId: message._id,
    });

    try {
      const response = await sendMessageRequest(
        selectedConversation.conversationId,
        sendData,
      );
      if (response.newMessage) {
        const confirmed: ChatMessage = {
          ...response.newMessage,
          status: "sent",
        };
        const updatedMessages = get().messages.map((m) =>
          m._id === message._id ? confirmed : m,
        );
        set({ messages: updatedMessages });
        appStorage.setCachedMessages(
          selectedConversation.conversationId,
          updatedMessages,
        );
        appStorage.removeFromOutbox(message._id);
        get().setNmsgInCon(confirmed);
      }
      return true;
    } catch (error) {
      if (
        isAxiosError(error) &&
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        appStorage.removeFromOutbox(message._id);
        set((state) => ({
          messages: state.messages.map((m) =>
            m._id === message._id ? { ...m, status: "failed" } : m,
          ),
        }));
        showErrorToast(getErrorMessage(error, "Unable to send message"));
        return false;
      }

      // If network error, leave as pending in outbox
      return true;
    }
  },

  syncPendingOutbox: async () => {
    const outbox = appStorage.getOutbox();
    if (outbox.length === 0) return;

    for (const item of outbox) {
      try {
        const response = await sendMessageRequest(
          item.conversationId,
          item.data,
        );
        if (response.newMessage) {
          const confirmed: ChatMessage = {
            ...response.newMessage,
            status: "sent",
          };
          appStorage.removeFromOutbox(item.tempId);

          // Update active messages if user is looking at this conversation
          set((state) => {
            const hasMsg = state.messages.some((m) => m._id === item.tempId);
            if (hasMsg) {
              return {
                messages: state.messages.map((m) =>
                  m._id === item.tempId ? confirmed : m,
                ),
              };
            }
            return state;
          });

          // Update MMKV cached messages for that conversation
          const cached = appStorage.getCachedMessages<ChatMessage[]>(
            item.conversationId,
          );
          if (cached) {
            const updated = cached.map((m) =>
              m._id === item.tempId ? confirmed : m,
            );
            appStorage.setCachedMessages(item.conversationId, updated);
          }

          get().setNmsgInCon(confirmed);
        }
      } catch (error) {
        if (
          isAxiosError(error) &&
          error.response &&
          error.response.status >= 400 &&
          error.response.status < 500
        ) {
          // Fatal rejection from server: remove from outbox and mark failed
          appStorage.removeFromOutbox(item.tempId);
          set((state) => ({
            messages: state.messages.map((m) =>
              m._id === item.tempId ? { ...m, status: "failed" } : m,
            ),
          }));
        } else {
          // Network connection still failing: halt and wait for next reconnect
          break;
        }
      }
    }
  },

  receiveMessage: (message) => {
    const { authUser, socket } = getAuthSocketSession();
    const selectedConversation = get().selectedConversation;
    if (selectedConversation?.conversationId !== message.conversationId) return;

    const newMessages = mergeUniqueMessages(get().messages, [
      message.sender === authUser?._id
        ? message
        : {
            ...message,
            seenBy: authUser?._id
              ? [...new Set([...(message.seenBy ?? []), authUser._id])]
              : message.seenBy,
          },
    ]);

    appStorage.setCachedMessages(message.conversationId, newMessages);
    set({ messages: newMessages });

    if (!message.system && message.sender !== authUser?._id) {
      socket?.emit("msgseen", {
        msgId: message._id,
        senderId: message.sender,
      });
    }
  },

  setNmsgInCon: (newMessage) => {
    const { authUser } = getAuthSocketSession();
    set((state) => {
      const index = state.conversations.findIndex(
        (conversation) =>
          conversation.conversationId === newMessage.conversationId,
      );
      if (index === -1) return state;

      const conversations = [...state.conversations];
      const [target] = conversations.splice(index, 1);
      const isOpen =
        state.selectedConversation?.conversationId ===
        newMessage.conversationId;
      const isOwn = newMessage.sender === authUser?._id;
      const unseenMsg =
        newMessage.system || isOwn || isOpen ? 0 : (target.unseenMsg ?? 0) + 1;

      conversations.unshift({ ...target, lastmessage: newMessage, unseenMsg });
      appStorage.setCachedConversations(conversations);
      return { conversations };
    });
  },

  setIsTyping: (conversation) => {
    getAuthSocketSession().socket?.emit("istyping", {
      receiverId: conversation.conversationId,
    });
  },

  setStopTyping: (conversation) => {
    getAuthSocketSession().socket?.emit("StopTyping", {
      receiverId: conversation.conversationId,
    });
  },

  setTyping: (typing) => set({ typing }),

  setMsgSeen: (payload) => {
    const msgId = typeof payload === "string" ? payload : payload.msgId;
    if (!msgId) return;

    set((state) => ({
      messages: state.messages.map((message) => {
        if (message._id !== msgId || typeof payload === "string") {
          return message;
        }

        return {
          ...message,
          isSeen:
            typeof payload.isSeen === "boolean"
              ? payload.isSeen
              : message.isSeen,
          seenBy:
            payload.seenBy ??
            (payload.userId
              ? [...new Set([...(message.seenBy ?? []), payload.userId])]
              : message.seenBy),
        };
      }),
    }));
  },

  setUpdatedMessage: (message) => {
    const { authUser } = getAuthSocketSession();
    set((state) => ({
      conversations: state.conversations.map((conversation) => {
        if (
          conversation.conversationId !== message.conversationId ||
          !conversation.lastmessage
        ) {
          return conversation;
        }

        const memberName = message.userId
          ? conversation.groupdetail?.membersDetail?.[message.userId]?.fullname
          : undefined;
        const actor =
          authUser?._id === message.userId
            ? "You"
            : (memberName ?? conversation.name);
        const text =
          message.reacted !== conversation.lastmessage.reacted
            ? `${actor} reacted ${message.reacted ?? ""} to '${message.text ?? ""}'`
            : (message.text ?? conversation.lastmessage.text);

        return {
          ...conversation,
          lastmessage: { ...conversation.lastmessage, text },
        };
      }),
    }));
  },

  setReactedMsg: (message) => {
    set((state) => ({
      messages: state.messages.map((item) =>
        item._id === message._id ? { ...item, reacted: message.reacted } : item,
      ),
    }));
  },

  setDeletedMessageForSlider: (message) => {
    const { authUser } = getAuthSocketSession();
    if (!message.deletedForEveryone) return;

    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.conversationId === message.conversationId
          ? {
              ...conversation,
              lastmessage: {
                ...(conversation.lastmessage ?? message),
                image: message.image,
                reacted: message.reacted,
                text:
                  authUser?._id === message.sender
                    ? "You deleted this message"
                    : "This message was deleted",
              },
              unseenMsg: Math.max((conversation.unseenMsg ?? 0) - 1, 0),
            }
          : conversation,
      ),
    }));
  },

  setDeletedMessage: (message) => {
    if (message.media) {
      mediaStorageService.deleteLocalMedia(
        message.media._id,
        message.media.mimeType,
        message.media.originalName,
      );
    }
    const currentUserId = getAuthSocketSession().authUser?._id;
    set((state) => {
      if (message.deletedForEveryone) {
        return {
          messages: state.messages.map((item) =>
            item._id === message._id
              ? {
                  ...item,
                  image: message.image,
                  media: null,
                  reacted: message.reacted,
                  text:
                    currentUserId === message.sender
                      ? "You deleted this message"
                      : "This message was deleted",
                }
              : item,
          ),
        };
      }

      if (currentUserId && message.deletedFor?.includes(currentUserId)) {
        return {
          messages: state.messages.filter((item) => item._id !== message._id),
        };
      }
      return state;
    });
  },

  setClearChat: (conversation) => {
    const conversationId = String(
      conversation.conversationId ?? conversation._id ?? "",
    );
    if (!conversationId) return;

    if (get().selectedConversation?.conversationId === conversationId) {
      get().messages.forEach((item) => {
        if (item.media) {
          mediaStorageService.deleteLocalMedia(
            item.media._id,
            item.media.mimeType,
            item.media.originalName,
          );
        }
      });
    }

    set((state) => ({
      conversations: state.conversations.map((item) =>
        item.conversationId === conversationId
          ? { ...item, lastmessage: undefined, unseenMsg: 0 }
          : item,
      ),
      ...(state.selectedConversation?.conversationId === conversationId
        ? {
            hasMoreMessages: false,
            messageCursor: null,
            messages: [],
          }
        : {}),
    }));
  },

  setConBgimage: (conversationId, bgImage) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.conversationId === conversationId
          ? { ...conversation, bgImage }
          : conversation,
      ),
      selectedConversation:
        state.selectedConversation?.conversationId === conversationId
          ? { ...state.selectedConversation, bgImage }
          : state.selectedConversation,
    }));
  },

  setGroupUpdation: (group) => {
    set((state) => {
      const update = (conversation: Conversation) =>
        conversation.conversationId === group._id
          ? {
              ...conversation,
              groupdetail: {
                groupIcon:
                  group.groupIcon ?? conversation.groupdetail?.groupIcon,
                groupname:
                  group.groupname ??
                  conversation.groupdetail?.groupname ??
                  conversation.name,
                membersDetail: conversation.groupdetail?.membersDetail ?? {},
              },
            }
          : conversation;

      return {
        conversations: state.conversations.map(update),
        selectedConversation: state.selectedConversation
          ? update(state.selectedConversation)
          : null,
      };
    });
  },

  refreshGroupMember: (type, incoming) => {
    const normalized = normalizeConversation(incoming);
    const incomingId = normalized?.conversationId;
    if (!incomingId) return;

    set((state) => {
      let conversations = [...state.conversations];
      let selectedConversation = state.selectedConversation;
      const index = conversations.findIndex(
        (conversation) => conversation.conversationId === incomingId,
      );

      if (type === "NEW_CONVERSATION") {
        const existing = index >= 0 ? conversations.splice(index, 1)[0] : null;
        conversations.unshift({ ...existing, ...normalized });
      }

      if (type === "UPDATE_MEMBERS") {
        conversations = conversations.map((conversation) =>
          conversation.conversationId === incomingId
            ? {
                ...conversation,
                groupdetail: normalized.groupdetail ?? conversation.groupdetail,
              }
            : conversation,
        );
        if (selectedConversation?.conversationId === incomingId) {
          selectedConversation = {
            ...selectedConversation,
            groupdetail:
              normalized.groupdetail ?? selectedConversation.groupdetail,
          };
        }
      }

      if (type === "DELETE_CONVERSATION" || type === "EXIT_GROUP") {
        conversations = conversations.filter(
          (conversation) => conversation.conversationId !== incomingId,
        );
        if (selectedConversation?.conversationId === incomingId) {
          selectedConversation = null;
        }
      }

      return { conversations, selectedConversation };
    });
  },

  resetChatState: () => set(initialState),
}));
