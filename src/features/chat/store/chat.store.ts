import { showErrorToast } from "@/utils/toast";
import axios from "axios";
import { create } from "zustand";
import { ChatState } from "../types/store.types";
import { getConversations } from "../api/chatApi";
import { conversation } from "../types/chat.types";
import { useAuthStore } from "@/features/auth/store/auth.store";

const throwError = (error: any) => {
  if (axios.isAxiosError(error)) {
    showErrorToast(error.response?.data?.message);
  } else {
    showErrorToast("Something went wrong");
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  typing: null,
  isConversationLoading: false,

  getConversation: async () => {
    set({ isConversationLoading: true });
    try {
      const resdata = await getConversations();
      set({ conversations: resdata.filtered });
    } catch (error) {
      console.log("Fetch conversation error:", error);
      throwError(error);
    } finally {
      set({ isConversationLoading: false });
    }
  },

  setSelectedConversation: (selectedConversation) => {
    set((state: any) => ({
      selectedConversation,
      conversations: state.conversations.map((con: conversation) =>
        con.conversationId === selectedConversation.conversationId
          ? { ...con, unseenMsg: 0 }
          : con,
      ),
    }));
    return true;
  },

  setNmsgInCon: (newMessage) => {
    const authUser = useAuthStore.getState().authUser;
    set((state: any) => {
      const index = state.conversations.findIndex(
        (con: conversation) => con.conversationId === newMessage.conversationId,
      );
      if (index === -1) return state;
      const updatedConversations = [...state.conversations];
      const [targetCon] = updatedConversations.splice(index, 1);
      const isOwnMessage = newMessage.sender == authUser._id;
      const isSystem = newMessage.system == true;
      const selectedConId = state.selectedConversation?.conversationId;
      const isOpenCon = selectedConId === newMessage.conversationId;
      let nextUnseen = targetCon?.unseenMsg || 0;

      if (isSystem) nextUnseen = 0;
      else nextUnseen = isOwnMessage || isOpenCon ? 0 : nextUnseen + 1;

      const updatedTargetCon = {
        ...targetCon,
        lastmessage: newMessage,
        unseenMsg: nextUnseen,
      };
      updatedConversations.unshift(updatedTargetCon);
      return { conversations: updatedConversations };
    });
  },

  setIsTyping: (selectedConversation) => {
    const socket = useAuthStore.getState().socket;
    socket?.emit("istyping", {
      receiverId: selectedConversation.conversationId,
    });
  },

  setTyping: (userId) => {
    set({ typing: userId });
  },

  setStopTyping: (selectedConversation) => {
    const socket = useAuthStore.getState().socket;
    socket?.emit("StopTyping", {
      receiverId: selectedConversation.conversationId,
    });
  },

  setUpdatedMessage: (message) => {
    const authUser = useAuthStore.getState().authUser;

    set((state: any) => ({
      conversations: state.conversations.map((con: any) => {
        if (con.conversationId !== message.conversationId) return con;
        return {
          ...con,
          lastMessage: {
            ...con.lastMessage,
            text:
              message?.reacted !== con.lastMessage?.reacted
                ? con.isgroup
                  ? authUser._id === message?.userId
                    ? `You reacted ${message?.reacted} to '${message?.text}'`
                    : `${con.groupdetail.membersDetail[message.userId].fullname} reacted ${message?.reacted} to '${message?.text}'`
                  : authUser._id == message?.userId
                    ? `You reacted ${message?.reacted} to '${message?.text}'`
                    : `${con.name} reacted ${message?.reacted} to '${message?.text}'`
                : message?.text,
          },
        };
      }),
    }));
  },

  setDeletedMessageForSlider: (message) => {
    const authUser = useAuthStore.getState().authUser;

    set((state: any) => ({
      conversations: state.conversations.map((con: any) => {
        if (
          con.conversationId == message.conversationId &&
          message.deletedForEveryone
        ) {
          return {
            ...con,
            lastmessage: {
              ...con.lastmessage,
              text:
                authUser._id == message.sender
                  ? "You deleted this message"
                  : "This message was deleted",
              reacted: message.reacted,
              image: message.image,
            },
            unseenMsg: con.unseenMsg - 1 >= 0 ? con.unseenMsg - 1 : 0,
          };
        } else return con;
      }),
    }));
  },

  refreshGroupMember: (type, conversation) => {
    set((state: any) => {
      let conversations = [...state.conversations];
      let selectedConversation = state.selectedConversation;

      const getId = (con: any) =>
        con?.conversationId?.toString?.() ??
        con?.conversationId ??
        con?._id?.toString?.() ??
        con?._id;

      const incomingId = getId(conversation);

      switch (type) {
        case "NEW_CONVERSATION": {
          if (!incomingId) break;
          const existingIndex = conversations.findIndex(
            (con: any) => getId(con) === incomingId,
          );
          const normalizedConversation = conversation?.conversationId
            ? conversation
            : { ...conversation, conversationId: incomingId };
          if (existingIndex !== -1) {
            const existing = conversations[existingIndex];
            conversations.splice(existingIndex, 1);
            conversation.unshift({ ...existing, ...normalizedConversation });
          } else conversations = [normalizedConversation, ...conversations];
          break;
        }

        case "UPDATE_MEMBERS": {
          if (!incomingId) break;
          conversations = conversations.map((con) =>
            getId(con) === incomingId
              ? {
                  ...con,
                  groupdetail: conversation.groupdetail ?? con.groupdetail,
                }
              : con,
          );
          if (
            selectedConversation &&
            getId(selectedConversation) === incomingId
          ) {
            selectedConversation = {
              ...selectedConversation,
              groupdetail:
                conversation.groupdetail ?? selectedConversation.groupdetail,
            };
          }
          break;
        }

        case "DELETE_CONVERSATION":
        case "EXIT_GROUP": {
          if (!incomingId) break;
          conversations = conversations.filter(
            (con) => getId(con) !== incomingId,
          );

          if (
            selectedConversation &&
            getId(selectedConversation) === incomingId
          ) {
            selectedConversation = null;
          }
          break;
        }
      }
      return { conversations, selectedConversation };
    });
  },
}));
