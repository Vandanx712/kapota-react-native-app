export type MediaAsset = {
  key?: string;
  url: string;
};

export type ChatUser = {
  _id: string;
  bio?: string;
  email?: string;
  fullname: string;
  profilePic?: MediaAsset;
};

export type GroupMember = {
  fullname: string;
  profilePic?: MediaAsset;
  role: string;
};

export type ChatMedia = {
  _id: string;
  purpose?: string;
  resourceType?: "image" | "video" | "raw" | string;
  mimeType: string;
  originalName: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  status?: string;
  url?: string | null;
};

export type ChatMessage = {
  _id: string;
  conversationId: string;
  createdAt?: string;
  deletedFor?: string[];
  deletedForEveryone?: boolean;
  image?: MediaAsset | null;
  media?: ChatMedia | null;
  isEdited?: boolean;
  isSeen?: boolean;
  reacted?: string | null;
  seenBy?: string[];
  sender: string;
  system?: boolean;
  text?: string;
  status?: "pending" | "sent" | "delivered" | "seen" | "failed";
  updatedAt?: string;
  replyTo?: {
    _id: string;
    text?: string;
    image?: MediaAsset | null;
    sender?: string;
  } | null;
  post?: {
    _id: string;
    image?: MediaAsset;
    caption?: string;
    authorName?: string;
    user?: {
      fullname?: string;
      profilePic?: MediaAsset;
    };
    unavailable?: boolean;
    likesCount?: number;
    createdAt?: string;
  } | null;
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
