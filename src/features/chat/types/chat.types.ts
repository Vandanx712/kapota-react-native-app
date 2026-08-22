export type MediaAsset = {
  key?: string;
  url: string;
};

export type ChatUser = {
  _id: string;
  bio?: string;
  fullname: string;
  profilePic?: MediaAsset;
};

export type GroupMember = {
  fullname: string;
  profilePic?: MediaAsset;
  role: string;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  createdAt?: string;
  deletedFor?: string[];
  deletedForEveryone?: boolean;
  image?: MediaAsset | null;
  isSeen?: boolean;
  reacted?: string | null;
  seenBy?: string[];
  sender: string;
  system?: boolean;
  text?: string;
  updatedAt?: string;
};

export type Conversation = {
  bgImage?: MediaAsset;
  conversationId: string;
  groupdetail?: {
    groupIcon?: MediaAsset;
    groupname: string;
    membersDetail: Record<string, GroupMember>;
  };
  isgroup?: boolean;
  lastmessage?: ChatMessage;
  name: string;
  oruserId?: string;
  profilePic?: MediaAsset;
  unseenMsg?: number | null;
};

export type TypingPayload = {
  receiverId: string;
  userId: string;
};

export type MessageSeenPayload =
  | string
  | {
      isSeen?: boolean;
      msgId?: string;
      seenBy?: string[];
      userId?: string;
    };

export type GroupUpdatePayload = {
  _id: string;
  groupIcon?: MediaAsset;
  groupname?: string;
};

export type RefreshGroupEvent =
  | "DELETE_CONVERSATION"
  | "EXIT_GROUP"
  | "NEW_CONVERSATION"
  | "UPDATE_MEMBERS";

// Kept as an alias while existing components migrate to PascalCase.
export type conversation = Conversation;
