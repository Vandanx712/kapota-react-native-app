import type { Socket } from "socket.io-client";

import { useChatStore } from "@/features/chat/store/chat.store";
import type {
  ChatMessage,
  Conversation,
  GroupUpdatePayload,
  MessageSeenPayload,
  RefreshGroupEvent,
  TypingPayload,
} from "@/features/chat/types/chat.types";

type BackgroundPayload = {
  bgImage?: Conversation["bgImage"];
  conversationId: string;
};

export const registerChatSocketListeners = (socket: Socket) => {
  const onNewMessage = (message: ChatMessage) => {
    const store = useChatStore.getState();
    store.setNmsgInCon(message);
    store.receiveMessage(message);
  };

  const onTyping = (payload: TypingPayload) => {
    useChatStore.getState().setTyping(payload);
  };

  const onStopTyping = (payload: Partial<TypingPayload>) => {
    const store = useChatStore.getState();
    if (
      !payload.receiverId ||
      store.typing?.receiverId === payload.receiverId
    ) {
      store.setTyping(null);
    }
  };

  const onReacted = (message: ChatMessage & { userId?: string }) => {
    const store = useChatStore.getState();
    store.setUpdatedMessage(message);
    store.setReactedMsg(message);
  };

  const onDelete = (message: ChatMessage) => {
    const store = useChatStore.getState();
    store.setDeletedMessageForSlider(message);
    store.setDeletedMessage(message);
  };

  const onGroupDetail = (conversation: GroupUpdatePayload) => {
    useChatStore.getState().setGroupUpdation(conversation);
  };

  const onRefresh = (
    type: RefreshGroupEvent,
    conversation: Partial<Conversation> & { _id?: string },
  ) => {
    useChatStore.getState().refreshGroupMember(type, conversation);
  };

  const onSeen = (payload: MessageSeenPayload) => {
    useChatStore.getState().setMsgSeen(payload);
  };

  const onBackgroundChanged = ({
    bgImage,
    conversationId,
  }: BackgroundPayload) => {
    useChatStore.getState().setConBgimage(conversationId, bgImage);
  };

  const onClearChat = (conversation: {
    _id?: string;
    conversationId?: string;
  }) => {
    useChatStore.getState().setClearChat(conversation);
  };

  socket.on("newmessage", onNewMessage);
  socket.on("istyping", onTyping);
  socket.on("StopTyping", onStopTyping);
  socket.on("reacted", onReacted);
  socket.on("delete", onDelete);
  socket.on("udGroupDetail", onGroupDetail);
  socket.on("refresh", onRefresh);
  socket.on("msgseen", onSeen);
  socket.on("changeBgimage", onBackgroundChanged);
  socket.on("clearchat", onClearChat);

  return () => {
    socket.off("newmessage", onNewMessage);
    socket.off("istyping", onTyping);
    socket.off("StopTyping", onStopTyping);
    socket.off("reacted", onReacted);
    socket.off("delete", onDelete);
    socket.off("udGroupDetail", onGroupDetail);
    socket.off("refresh", onRefresh);
    socket.off("msgseen", onSeen);
    socket.off("changeBgimage", onBackgroundChanged);
    socket.off("clearchat", onClearChat);
  };
};
