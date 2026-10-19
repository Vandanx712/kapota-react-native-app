import type { Conversation, MediaAsset } from "@/features/chat/types/chat.types";

export type CallType = "video" | "audio";
export type CallMode = "outgoing" | "incoming";
export type CallPhase =
  | "preparing"
  | "ringing"
  | "connecting"
  | "active"
  | "ended";

export type CallParticipant = {
  _id: string;
  id: string;
  displayName: string;
  profilePic?: MediaAsset | null;
  cameraOn?: boolean;
  micOn?: boolean;
};

export type ActiveCall = {
  callId: string;
  callType: CallType;
  conversation: Conversation;
  mode: CallMode;
  phase: CallPhase;
  startedAt?: number;
};

export type IncomingCall = {
  callId: string;
  caller: {
    _id: string;
    fullname: string;
    profilePic?: MediaAsset | null;
  };
  callType: CallType;
  conversation: Conversation;
};
