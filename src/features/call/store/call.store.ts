import { create } from "zustand";
import { getAuthSocketSession } from "@/services/socket/authSocketSession";
import { showErrorToast, showInfoToast } from "@/utils/toast";
import type { Conversation } from "@/features/chat/types/chat.types";
import type {
  ActiveCall,
  CallParticipant,
  CallPhase,
  CallType,
  IncomingCall,
} from "../types/call.types";

interface CallState {
  activeCall: ActiveCall | null;
  incomingCall: IncomingCall | null;
  participants: CallParticipant[];
  isMicMuted: boolean;
  isCameraOff: boolean;
  isFrontCamera: boolean;
  isSpeakerOn: boolean;

  setIncomingCall: (incomingCall: IncomingCall | null) => void;
  clearIncomingCall: () => void;
  startOutgoingCall: (
    conversation: Conversation,
    callType?: CallType,
  ) => Promise<boolean>;
  acceptIncomingCall: () => Promise<boolean>;
  declineIncomingCall: () => void;
  endCall: (reason?: string) => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  flipCamera: () => void;
  toggleSpeaker: () => void;
  updateActiveCall: (updates: Partial<ActiveCall>) => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  incomingCall: null,
  participants: [],
  isMicMuted: false,
  isCameraOff: false,
  isFrontCamera: true,
  isSpeakerOn: true,

  setIncomingCall: (incomingCall) => set({ incomingCall }),

  clearIncomingCall: () => set({ incomingCall: null }),

  startOutgoingCall: async (conversation, callType = "video") => {
    const { socket } = getAuthSocketSession();
    if (!socket || !socket.connected) {
      showErrorToast("Connect to Kapota before starting a call");
      return false;
    }

    if (get().activeCall) {
      showInfoToast("Call already in progress");
      return false;
    }

    set({
      activeCall: {
        callId: "",
        callType,
        conversation,
        mode: "outgoing",
        phase: "preparing",
      },
      incomingCall: null,
      isCameraOff: false,
      isFrontCamera: true,
      isMicMuted: false,
      isSpeakerOn: true,
      participants: [],
    });

    try {
      const response = await new Promise<{
        callId: string;
        existing?: boolean;
        call?: unknown;
      }>((resolve, reject) => {
        socket.timeout(10000).emit(
          "call:start",
          {
            conversationId: conversation.conversationId,
            callType,
          },
          (err: Error | null, res: { callId: string; existing?: boolean }) => {
            if (err) {
              reject(new Error("The call server did not respond"));
            } else {
              resolve(res);
            }
          },
        );
      });

      const callId = response.callId;
      set((state) => ({
        activeCall: state.activeCall
          ? {
              ...state.activeCall,
              callId,
              phase: response.existing ? "connecting" : "ringing",
            }
          : null,
      }));

      // Join the call room
      socket.emit("call:join", { callId });
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Unable to start call";
      showErrorToast(errorMsg);
      set({ activeCall: null });
      return false;
    }
  },

  acceptIncomingCall: async () => {
    const { incomingCall } = get();
    const { socket } = getAuthSocketSession();
    if (!incomingCall || !socket) return false;

    set({
      activeCall: {
        callId: incomingCall.callId,
        callType: incomingCall.callType || "video",
        conversation: incomingCall.conversation,
        mode: "incoming",
        phase: "connecting",
        startedAt: Date.now(),
      },
      incomingCall: null,
      isCameraOff: false,
      isFrontCamera: true,
      isMicMuted: false,
      isSpeakerOn: true,
    });

    try {
      socket.emit("call:join", { callId: incomingCall.callId });
      return true;
    } catch {
      showErrorToast("Could not join call");
      set({ activeCall: null });
      return false;
    }
  },

  declineIncomingCall: () => {
    const { incomingCall } = get();
    const { socket } = getAuthSocketSession();
    if (incomingCall && socket) {
      socket.emit("call:decline", {
        callId: incomingCall.callId,
        reason: "declined",
      });
    }
    set({ incomingCall: null });
  },

  endCall: (reason = "ended") => {
    const { activeCall } = get();
    const { socket } = getAuthSocketSession();
    if (activeCall?.callId && socket) {
      socket.emit("call:leave", { callId: activeCall.callId, reason });
    }
    set({
      activeCall: null,
      incomingCall: null,
      participants: [],
    });
  },

  toggleMic: () => {
    const next = !get().isMicMuted;
    set({ isMicMuted: next });
    const { activeCall } = get();
    const { socket } = getAuthSocketSession();
    if (activeCall?.callId && socket) {
      socket.emit("call:media-state", {
        callId: activeCall.callId,
        cameraOn: !get().isCameraOff,
        micOn: !next,
      });
    }
  },

  toggleCamera: () => {
    const next = !get().isCameraOff;
    set({ isCameraOff: next });
    const { activeCall } = get();
    const { socket } = getAuthSocketSession();
    if (activeCall?.callId && socket) {
      socket.emit("call:media-state", {
        callId: activeCall.callId,
        cameraOn: !next,
        micOn: !get().isMicMuted,
      });
    }
  },

  flipCamera: () => {
    set((state) => ({ isFrontCamera: !state.isFrontCamera }));
  },

  toggleSpeaker: () => {
    set((state) => ({ isSpeakerOn: !state.isSpeakerOn }));
  },

  updateActiveCall: (updates) =>
    set((state) => ({
      activeCall: state.activeCall
        ? { ...state.activeCall, ...updates }
        : null,
    })),
}));
