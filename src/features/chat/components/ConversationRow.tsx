import React, { memo, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import dayjs from "dayjs";
import { Camera, FileText, Image as ImageIcon, Video } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useChatStore } from "../store/chat.store";
import type { Conversation } from "../types/chat.types";
import { Avatar } from "@/shared/ui/Avatar";
import { MessageStatus } from "./MessageStatus";
import { StatusBadge } from "@/shared/ui/StatusBadge";

export interface ConversationRowProps {
  item: Conversation;
  onPress: (item: Conversation) => void;
  onLongPress?: (item: Conversation) => void;
}

export const ConversationRow = memo(function ConversationRow({
  item,
  onPress,
  onLongPress,
}: ConversationRowProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const currentUserId = useAuthStore((state) => state.authUser?._id);

  const isTypingNow = useChatStore((state) =>
    state.typing?.receiverId === item.conversationId &&
    state.typing?.userId !== currentUserId
  );

  const typingUserId = useChatStore((state) =>
    state.typing?.receiverId === item.conversationId ? state.typing.userId : null
  );

  const isOnline = useAuthStore((state) => {
    if (item.isgroup) {
      const members = item.groupdetail?.membersDetail ?? {};
      return Object.keys(members).some(
        (id) => id !== currentUserId && state.onlineUsers.includes(id)
      );
    }
    return Boolean(item.oruserId && state.onlineUsers.includes(item.oruserId));
  });

  const isGroup = Boolean(item.isgroup);
  const groupDetail = item.groupdetail;

  const conversationName = isGroup
    ? groupDetail?.groupname || "Group"
    : item.name || "User";

  const avatarUri = isGroup
    ? groupDetail?.groupIcon?.url
    : item.profilePic?.url;

  const lastMessage = item.lastmessage;
  const isOwnLastMessage = lastMessage?.sender === currentUserId;
  const hasUnread = Boolean(item.unseenMsg && item.unseenMsg > 0);

  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const handleLongPress = useCallback(() => {
    onLongPress?.(item);
  }, [item, onLongPress]);

  const formattedTime = useMemo(() => {
    if (!lastMessage?.createdAt) return "";
    const date = dayjs(lastMessage.createdAt);
    const now = dayjs();
    if (date.isSame(now, "day")) return date.format("h:mm A");
    if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
    return date.format("MMM D");
  }, [lastMessage?.createdAt]);


  const typingMemberName =
    isTypingNow && isGroup && typingUserId
      ? groupDetail?.membersDetail?.[typingUserId]?.fullname || "Someone"
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface },
        pressed && { backgroundColor: colors.surfaceContainerHigh },
      ]}
    >
      <View style={styles.avatarContainer}>
        <Avatar
          uri={avatarUri}
          name={conversationName}
          size={52}
          isGroup={isGroup}
          isOnline={isOnline}
          showStatusIndicator={isOnline}
        />
      </View>

      <View style={[styles.contentContainer, { borderBottomColor: colors.outlineVariant }]}>
        <View style={styles.topRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.name,
              { color: colors.onSurface },
            ]}
          >
            {conversationName}
          </Text>
          {formattedTime ? (
            <Text
              style={[
                styles.time,
                { color: hasUnread ? colors.primary : colors.onSurfaceVariant },
              ]}
            >
              {formattedTime}
            </Text>
          ) : null}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.previewContainer}>
            {isTypingNow ? (
              <Text
                numberOfLines={1}
                style={[styles.typingText, { color: colors.success }]}
              >
                {typingMemberName ? `${typingMemberName} is typing...` : "typing..."}
              </Text>
            ) : lastMessage ? (
              <View style={styles.messageSnippet}>
                {isOwnLastMessage && (
                  <MessageStatus
                    isSeen={lastMessage.seenBy?.some((id) => id !== currentUserId)}
                    size={16}
                  />
                )}
                {isGroup && !isOwnLastMessage && lastMessage.sender && (
                  <Text
                    numberOfLines={1}
                    style={[styles.senderPrefix, { color: colors.onSurfaceVariant }]}
                  >
                    {groupDetail?.membersDetail?.[lastMessage.sender]?.fullname
                      ? `${groupDetail.membersDetail[lastMessage.sender].fullname}: `
                      : ""}
                  </Text>
                )}
                {lastMessage.deletedForEveryone ? (
                  <Text
                    numberOfLines={1}
                    style={[styles.deletedText, { color: colors.outline }]}
                  >
                    {isOwnLastMessage
                      ? "You deleted this message"
                      : "This message was deleted"}
                  </Text>
                ) : lastMessage.image ? (
                  <View style={styles.mediaPreview}>
                    <ImageIcon size={14} color={colors.onSurfaceVariant} />
                    <Text
                      numberOfLines={1}
                      style={[styles.previewText, { color: colors.onSurfaceVariant }]}
                    >
                      Photo
                    </Text>
                  </View>
                ) : lastMessage.text ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.previewText,
                      { color: hasUnread ? colors.onSurface : colors.onSurfaceVariant },
                      hasUnread && styles.unreadPreview,
                    ]}
                  >
                    {lastMessage.text}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text
                numberOfLines={1}
                style={[styles.previewText, { color: colors.outline }]}
              >
                Tap to start chatting
              </Text>
            )}
          </View>

          {hasUnread && (
            <StatusBadge
              count={item.unseenMsg ?? undefined}
              variant="primary"
              size="sm"
            />
          )}
        </View>
      </View>
    </Pressable>
  );
});

export default ConversationRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    height: 74,
  },
  avatarContainer: {
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingRight: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  time: {
    fontSize: 12,
    fontWeight: "500",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewContainer: {
    flex: 1,
    marginRight: 8,
  },
  messageSnippet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  senderPrefix: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewText: {
    fontSize: 14,
    flex: 1,
  },
  unreadPreview: {
    fontWeight: "600",
  },
  deletedText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  typingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  mediaPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
