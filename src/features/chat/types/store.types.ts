export interface ChatState {
  conversations: [];
  selectedConversation: string | null;
  isConversationLoading: boolean;

  getConversation: () => Promise<any>;
  setSelectedConversation: (selectedConversation: string) => boolean;
}
