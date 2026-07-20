import { useChatStore } from "../../features/chat/store/chat.store";
import { Socket } from "socket.io-client";

export const useChatSocket = (socket: Socket) => {
  socket.on("newmessage", (newMessage) =>
    useChatStore.getState().setNmsgInCon(newMessage),
  );
  socket.on("istyping", (userId) => useChatStore.getState().setTyping(userId));
  socket.on("StopTyping", (userId) =>
    useChatStore
      .getState()
      .setTyping(
        userId?.receiverId == useChatStore.getState().typing?.receiverId
          ? null
          : useChatStore.getState().typing,
      ),
  );
  socket.on("reacted", (msg) => useChatStore.getState().setUpdatedMessage(msg));
  socket.on("delete", (msg) => useChatStore.getState().setDeletedMessageForSlider(msg));
  // socket.on("udGroupDetail", (conversation) => useChatStore.getState().setGroupUpdation(conversation));
  socket.on("refresh", (type, conversation) => {
    useChatStore.getState().refreshGroupMember(type, conversation);
  });
};
