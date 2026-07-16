export interface ChatState {
  conversations: [];
  selectedConversation: string | null;
  typing: object | null;
  isConversationLoading: boolean;

  getConversation: () => any;
  setSelectedConversation: (selectedConversation: any) => any;

  setTyping: (userId: object) => any;

  setNmsgInCon: (newMessage: any) => any;
  setIsTyping: (selectedConversation: any) => any;
  setStopTyping: (selectedConversation: any) => any;

  setUpdatedMessage: (message: any) => any;
  setDeletedMessageForSlider: (message: any) => any;
  refreshGroupMember: (type: string, conversation: any) => any;
}
