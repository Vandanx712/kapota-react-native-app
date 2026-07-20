import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  darkColors,
  elevation,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import { conversation } from "../types/chat.types";
import Avatar from "./ChatAvatar";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useChatStore } from "../store/chat.store";

export default function ConversationRow({ item }: { item: conversation }) {
  const { onlineUsers, authUser } = useAuthStore();
  const { typing } = useChatStore();
  const onlineUserSet = new Set(onlineUsers);

  const isOnline = item.isgroup
    ? Object.entries(item.groupdetail?.membersDetail).filter(
        ([id]) => id !== authUser._id && onlineUserSet.has(id),
      ).length > 0
    : onlineUserSet.has(item?.oruserId);

  return (
    <Pressable style={styles.conversationRow}>
      <Avatar item={item} isOnline={isOnline} />

      <View style={styles.conversationBody}>
        <View style={styles.rowTop}>
          <Text numberOfLines={1} style={styles.conversationName}>
            {item.isgroup ? item.groupdetail?.groupname : item?.name}
          </Text>
          <Text numberOfLines={1} style={styles.timeText}>
            {/* {item.time} */}
          </Text>
        </View>

        <View style={styles.previewRow}>
          {/* {item.delivered && (
            <CheckCheck
              size={18}
              color={darkColors.primaryContainer}
              strokeWidth={2.4}
            />
          )} */}
          {/* {item.sender && (
            <Text style={styles.senderText}>{item.sender}: </Text>
          )} */}
          <Text numberOfLines={1} style={styles.messageText}>
            {typing?.receiverId == item.conversationId &&
            typing?.userId !== authUser._id
              ? item.isgroup
                ? `${item.groupdetail?.membersDetail[typing.userId].fullname} is typing...`
                : "typing..."
              : item.lastmessage?.deletedForEveryone
                ? authUser._id == item.lastmessage.sender
                  ? "You deleted this message"
                  : "This message was deleted"
                : item.lastmessage?.image
                  ? "Image"
                  : item.lastmessage?.deletedFor?.includes(authUser._id)
                    ? ""
                    : item.lastmessage?.text || ""}
          </Text>
        </View>
      </View>

      {!!item?.unseenMsg && (
        <LinearGradient
          colors={[darkColors.primaryContainer, "#725EFF"]}
          style={styles.unreadBadge}
        >
          <Text style={styles.unreadText}>{item?.unseenMsg}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  conversationRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 76,
  },
  conversationBody: {
    flex: 1,
    justifyContent: "center",
    marginLeft: spacing.md,
    minWidth: 0,
  },
  rowTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginBottom: 7,
  },
  conversationName: {
    color: darkColors.onSurface,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  timeText: {
    ...typography.bodySm,
    color: darkColors.outline,
  },
  previewRow: {
    alignItems: "center",
    flexDirection: "row",
    minWidth: 0,
  },
  senderText: {
    ...typography.bodySm,
    color: darkColors.primaryContainer,
  },
  messageText: {
    ...typography.bodySm,
    color: darkColors.outline,
    flex: 1,
  },
  unreadBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    justifyContent: "center",
    marginLeft: spacing.sm,
    width: 20,
    height: 20,
    ...elevation.level2,
  },
  unreadText: {
    ...typography.bodySm,
    color: darkColors.onSurface,
  },
});
