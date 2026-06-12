import { showErrorToast } from "@/utils/toast";
import axios from "axios";
import { create } from "zustand";
import { ChatState } from "../types/store.types";
import { getConversations } from "../api/chatApi";

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

  setSelectedConversation: (selectedConversation: string) => {
    set((state) => ({
      selectedConversation,
      conversations: state.conversations.map((con) =>
        con.conversationId === selectedConversation.conversationId
          ? { ...con, unseenMsg: 0 }
          : con,
      ),
    }));
    return true;
  },
}));
