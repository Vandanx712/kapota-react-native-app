export interface conversation {
  conversationId: string;
  name: string;
  profilePic?: { url: string; key: string };
  bgImage?: { url: string; key: string };
  lastmessage?: {
    text: string;
    image: { url: string; key: string };
    sender: string;
    deletedFor: [];
    deletedForEveryone: boolean;
  };
  isgroup?: boolean;
  groupdetail?: {
    groupname: string;
    groupIcon: { url: string; key: string };
    membersDetail: {
      fullname: string;
      role: string;
      profilePic: { url: string; key: string };
    };
  };
  unseenMsg?: number|null;
}
