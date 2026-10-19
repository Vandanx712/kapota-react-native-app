import { AppState } from "react-native";
import type { Socket } from "socket.io-client";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useChatStore } from "@/features/chat/store/chat.store";
import { useCallStore } from "@/features/call/store/call.store";
import type {
  ChatMessage,
  Conversation,
  GroupUpdatePayload,
  MessageSeenPayload,
  RefreshGroupEvent,
  TypingPayload,
} from "@/features/chat/types/chat.types";
import type {
  CallParticipant,
  IncomingCall,
} from "@/features/call/types/call.types";
import { scheduleLocalNotification } from "@/services/notifications/notificationService";
import { showInfoToast } from "@/utils/toast";

type BackgroundPayload = {
  bgImage?: Conversation["bgImage"];
  conversationId: string;
};

type CallIncomingPayload = {
  callId: string;
  conversationId: string;
  callType?: "video" | "audio";
  isGroup?: boolean;
  from?: {
    _id?: string;
    id?: string;
    name?: string;
    fullname?: string;
    profilePic?: Conversation["profilePic"];
  };
  conversation: Conversation;
  startedAt?: number;
};

type CallParticipantJoinedPayload = {
  callId: string;
  conversationId: string;
  participant: {
    _id?: string;
    id?: string;
    name?: string;
    fullname?: string;
    profilePic?: Conversation["profilePic"];
    micOn?: boolean;
    cameraOn?: boolean;
  };
};

type CallParticipantLeftPayload = {
  callId: string;
  conversationId: string;
  participantId: string;
  reason?: string;
};

type CallDeclinedPayload = {
  callId: string;
  conversationId: string;
  participant?: {
    _id?: string;
    id?: string;
    name?: string;
    fullname?: string;
  };
  reason?: string;
};

type CallEndedPayload = {
  callId: string;
  conversationId: string;
  reason?: string;
  endedBy?: string;
};

type CallMediaStatePayload = {
  callId: string;
  conversationId: string;
  participantId: string;
  micOn?: boolean;
  cameraOn?: boolean;
};

export const registerChatSocketListeners = (socket: Socket) => {
  const onNewMessage = (message: ChatMessage) => {
    const store = useChatStore.getState();
    const authUser = useAuthStore.getState().authUser;
    store.setNmsgInCon(message);
    store.receiveMessage(message);

    const isFromMe = message.sender === authUser?._id;
    const isAppBackgrounded = AppState.currentState !== "active";
    const isDifferentConversation =
      store.selectedConversation?.conversationId !== message.conversationId;

    if (!isFromMe && (isAppBackgrounded || isDifferentConversation)) {
      const conv = store.conversations.find(
        (c) => c.conversationId === message.conversationId,
      );
      const senderName =
        conv?.groupdetail?.membersDetail?.[message.sender]?.fullname ||
        conv?.name ||
        "New message";
      const preview =
        message.text ||
        (message.media?.mimeType?.startsWith("image/")
          ? "📷 Photo"
          : "Attachment");

      void scheduleLocalNotification(senderName, preview, {
        conversationId: message.conversationId,
      });
    }
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

  // Call Handlers
  const onCallIncoming = (payload: CallIncomingPayload) => {
    const callerId = payload.from?._id || payload.from?.id || "";
    const callerName =
      payload.from?.fullname || payload.from?.name || "Someone";
    const incoming: IncomingCall = {
      callId: payload.callId,
      caller: {
        _id: callerId,
        fullname: callerName,
        profilePic: payload.from?.profilePic ?? null,
      },
      callType: payload.callType || "video",
      conversation: payload.conversation,
    };

    useCallStore.getState().setIncomingCall(incoming);

    if (AppState.currentState !== "active") {
      void scheduleLocalNotification(
        "Incoming Video Call",
        `${callerName} is calling you`,
        {
          callId: payload.callId,
          conversationId: payload.conversationId,
        },
      );
    }
  };

  const onCallParticipantJoined = (payload: CallParticipantJoinedPayload) => {
    useCallStore.setState((state) => {
      if (!state.activeCall || state.activeCall.callId !== payload.callId) {
        return state;
      }
      const participantId =
        payload.participant._id || payload.participant.id || "";
      const newParticipant: CallParticipant = {
        _id: participantId,
        id: participantId,
        displayName:
          payload.participant.fullname ||
          payload.participant.name ||
          "Participant",
        profilePic: payload.participant.profilePic ?? null,
        micOn: payload.participant.micOn !== false,
        cameraOn: payload.participant.cameraOn !== false,
      };
      const filtered = state.participants.filter(
        (p) => p._id !== participantId,
      );
      return {
        activeCall: {
          ...state.activeCall,
          phase: "active",
          startedAt: state.activeCall.startedAt ?? Date.now(),
        },
        participants: [...filtered, newParticipant],
      };
    });
  };

  const onCallParticipantLeft = (payload: CallParticipantLeftPayload) => {
    useCallStore.setState((state) => ({
      participants: state.participants.filter(
        (p) =>
          p._id !== payload.participantId && p.id !== payload.participantId,
      ),
    }));
  };

  const onCallDeclined = (payload: CallDeclinedPayload) => {
    const callStore = useCallStore.getState();
    if (callStore.incomingCall?.callId === payload.callId) {
      callStore.clearIncomingCall();
    }
    if (callStore.activeCall?.callId === payload.callId) {
      showInfoToast("Call declined");
      callStore.endCall("declined");
    }
  };

  const onCallEnded = (payload: CallEndedPayload) => {
    const callStore = useCallStore.getState();
    if (callStore.incomingCall?.callId === payload.callId) {
      callStore.clearIncomingCall();
    }
    if (callStore.activeCall?.callId === payload.callId) {
      useCallStore.setState({
        activeCall: null,
        incomingCall: null,
        participants: [],
      });
      showInfoToast("Call ended");
    }
  };

  const onCallMediaState = (payload: CallMediaStatePayload) => {
    useCallStore.setState((state) => ({
      participants: state.participants.map((p) =>
        p._id === payload.participantId || p.id === payload.participantId
          ? {
              ...p,
              cameraOn:
                payload.cameraOn !== undefined ? payload.cameraOn : p.cameraOn,
              micOn: payload.micOn !== undefined ? payload.micOn : p.micOn,
            }
          : p,
      ),
    }));
  };

  const onCallAnsweredElsewhere = (payload: { callId: string }) => {
    if (useCallStore.getState().incomingCall?.callId === payload.callId) {
      useCallStore.getState().clearIncomingCall();
    }
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

  // Call listeners
  socket.on("call:incoming", onCallIncoming);
  socket.on("call:participant-joined", onCallParticipantJoined);
  socket.on("call:participant-left", onCallParticipantLeft);
  socket.on("call:declined", onCallDeclined);
  socket.on("call:ended", onCallEnded);
  socket.on("call:media-state", onCallMediaState);
  socket.on("call:answered-elsewhere", onCallAnsweredElsewhere);

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

    // Call listeners teardown
    socket.off("call:incoming", onCallIncoming);
    socket.off("call:participant-joined", onCallParticipantJoined);
    socket.off("call:participant-left", onCallParticipantLeft);
    socket.off("call:declined", onCallDeclined);
    socket.off("call:ended", onCallEnded);
    socket.off("call:media-state", onCallMediaState);
    socket.off("call:answered-elsewhere", onCallAnsweredElsewhere);
  };
};
