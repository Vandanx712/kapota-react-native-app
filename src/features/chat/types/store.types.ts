import type {
  ChatMessage,
  ChatUser,
  Conversation,
  GroupUpdatePayload,
  MessageSeenPayload,
  RefreshGroupEvent,
  TypingPayload,
} from "./chat.types";

export type SendMessageInput = {
  image?: string;
  text?: string;
};

export interface ChatState {
  conversationError: string | null;
  conversations: Conversation[];
  hasMoreMessages: boolean;
  hasMoreSurroundingUsers: boolean;
  isConversationLoading: boolean;
  isMessageLoading: boolean;
  isMoreMessagesLoading: boolean;
  isMoreSurroundingUsersLoading: boolean;
  isUsersLoading: boolean;
  messageCursor: string | null;
  messageError: string | null;
  messages: ChatMessage[];
  selectedConversation: Conversation | null;
  surroundingUsersCursor: string | null;
  typing: TypingPayload | null;
  users: ChatUser[];

  createConversation: (userId: string) => Promise<Conversation | null>;
  clearSelectedConversation: (conversationId?: string) => void;
  getConversation: () => Promise<void>;
  getMessages: (conversationId?: string) => Promise<void>;
  getSurroundingUsers: () => Promise<void>;
  loadMoreSurroundingUsers: () => Promise<void>;
  loadOlderMessages: () => Promise<void>;
  receiveMessage: (message: ChatMessage) => void;
  refreshGroupMember: (
    type: RefreshGroupEvent,
    conversation: Partial<Conversation> & { _id?: string },
  ) => void;
  resetChatState: () => void;
  sendMessage: (data: SendMessageInput) => Promise<boolean>;
  setClearChat: (conversation: { _id?: string; conversationId?: string }) => void;
  setConBgimage: (conversationId: string, bgImage: Conversation["bgImage"]) => void;
  setDeletedMessage: (message: ChatMessage) => void;
  setDeletedMessageForSlider: (message: ChatMessage) => void;
  setGroupUpdation: (conversation: GroupUpdatePayload) => void;
  setIsTyping: (conversation: Conversation) => void;
  setMsgSeen: (payload: MessageSeenPayload) => void;
  setNmsgInCon: (message: ChatMessage) => void;
  setReactedMsg: (message: ChatMessage) => void;
  setSelectedConversation: (conversation: Conversation) => void;
  setStopTyping: (conversation: Conversation) => void;
  setTyping: (payload: TypingPayload | null) => void;
  setUpdatedMessage: (message: ChatMessage & { userId?: string }) => void;
}
