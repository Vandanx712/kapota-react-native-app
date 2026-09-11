import React, { memo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import dayjs from "dayjs";
import { useTheme } from "@/theme/ThemeProvider";
import type { ChatMessage, Conversation } from "../types/chat.types";
import { MessageStatus } from "./MessageStatus";
import { MediaAttachment } from "./MediaAttachment";

export interface MessageBubbleProps {
  message: ChatMessage;
  conversation: Conversation;
  currentUserId?: string;
  isSelected?: boolean;
  selectionMode?: boolean;
  onPress?: (message: ChatMessage) => void;
  onLongPress?: (message: ChatMessage) => void;
  onReactionPress?: (message: ChatMessage) => void;
}

function areMessageBubblePropsEqual(
  prev: MessageBubbleProps,
  next: MessageBubbleProps
): boolean {
  return (
    prev.message._id === next.message._id &&
    prev.message.text === next.message.text &&
    prev.message.reacted === next.message.reacted &&
    prev.message.isSeen === next.message.isSeen &&
    prev.message.isEdited === next.message.isEdited &&
    prev.message.deletedForEveryone === next.message.deletedForEveryone &&
    prev.isSelected === next.isSelected &&
    prev.selectionMode === next.selectionMode &&
    prev.currentUserId === next.currentUserId
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
  conversation,
  currentUserId,
  isSelected = false,
  onPress,
  onLongPress,
  onReactionPress,
}: MessageBubbleProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const isOwn = message.sender === currentUserId;
  const isGroup = Boolean(conversation.isgroup);
  const member = isGroup ? conversation.groupdetail?.membersDetail?.[message.sender] : null;
  const senderName = member?.fullname || "Member";

  if (message.system) {
    return (
      <View style={styles.systemRow}>
        <View
          style={[
            styles.systemPill,
            { backgroundColor: colors.surfaceContainerHighest },
          ]}
        >
          <Text
            style={[styles.systemText, { color: colors.onSurfaceVariant }]}
          >
            {message.text || "System notice"}
          </Text>
        </View>
      </View>
    );
  }

  const isSeenByOther = Boolean(
    message.isSeen ||
    message.seenBy?.some((userId) => userId !== message.sender),
  );

  const formattedTime = message.createdAt
    ? dayjs(message.createdAt).format("h:mm A")
    : "";

  return (
    <Pressable
      onPress={() => onPress?.(message)}
      onLongPress={() => onLongPress?.(message)}
      delayLongPress={220}
      style={[
        styles.container,
        isSelected && { backgroundColor: "rgba(91, 76, 240, 0.14)" },
      ]}
    >
      <View
        style={[
          styles.bubbleWrapper,
          isOwn ? styles.bubbleWrapperOwn : styles.bubbleWrapperOther,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isOwn
              ? [
                styles.bubbleOwn,
                {
                  backgroundColor: colors.primary,
                },
              ]
              : [
                styles.bubbleOther,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                },
              ],
          ]}
        >
          {/* Sender name in group */}
          {isGroup && !isOwn && (
            <Text
              numberOfLines={1}
              style={[styles.groupSenderName, { color: colors.primary }]}
            >
              {senderName}
            </Text>
          )}

          {/* Quoted reply inside bubble */}
          {message.replyTo && (
            <View
              style={[
                styles.replyQuote,
                {
                  backgroundColor: isOwn
                    ? "rgba(0,0,0,0.12)"
                    : colors.surfaceContainerHighest,
                  borderLeftColor: isOwn ? colors.onPrimary : colors.primary,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.replySender,
                  { color: isOwn ? colors.onPrimary : colors.primary },
                ]}
              >
                Reply
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.replySnippet,
                  { color: isOwn ? colors.onPrimary : colors.onSurfaceVariant },
                ]}
              >
                {typeof message.replyTo === "object"
                  ? (message.replyTo as any)?.text || "Quoted message"
                  : "Quoted message"}
              </Text>
            </View>
          )}

          {/* Shared Post attachment */}
          {message.post && !message.post.unavailable && (
            <View
              style={[
                styles.sharedPostCard,
                {
                  backgroundColor: isOwn
                    ? "rgba(0,0,0,0.15)"
                    : colors.surfaceContainerHighest,
                },
              ]}
            >
              {message.post.image?.url && (
                <Image
                  source={{ uri: message.post.image.url }}
                  style={styles.sharedPostImage}
                  contentFit="cover"
                />
              )}
              <View style={styles.sharedPostInfo}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.sharedPostAuthor,
                    { color: isOwn ? colors.onPrimary : colors.onSurface },
                  ]}
                >
                  {message.post.user?.fullname || "Kapota Post"}
                </Text>
                {message.post.caption && (
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.sharedPostCaption,
                      { color: isOwn ? colors.onPrimary : colors.onSurfaceVariant },
                    ]}
                  >
                    {message.post.caption}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Media attachment */}
          {message.media ? (
            <MediaAttachment
              media={message.media}
              isOwn={isOwn}
              reserveTime={!message.text}
            />
          ) : message.image?.url ? (
            <Image
              source={{ uri: message.image.url }}
              style={styles.messageImage}
              contentFit="cover"
            />
          ) : null}

          {/* Message Text */}
          {message.text ? (
            <Text
              style={[
                styles.messageText,
                {
                  color: isOwn ? colors.onPrimary : colors.onSurface,
                },
                message.deletedForEveryone && styles.deletedText,
              ]}
            >
              {message.text}
              {message.isEdited && (
                <Text
                  style={{
                    fontSize: 11,
                    fontStyle: "italic",
                    color: isOwn ? "rgba(255,255,255,0.7)" : colors.onSurfaceVariant,
                  }}
                >
                  {" "}(edited)
                </Text>
              )}
            </Text>
          ) : null}

          {/* Bottom metadata row (time + delivery ticks) */}
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                {
                  color: isOwn
                    ? "rgba(255,255,255,0.75)"
                    : colors.onSurfaceVariant,
                },
              ]}
            >
              {formattedTime}
            </Text>
            {isOwn && (
              <MessageStatus
                isSeen={isSeenByOther}
                color="rgba(255,255,255,0.7)"
                activeColor="#FFFFFF"
                size={14}
              />
            )}
          </View>
        </View>

        {/* Reaction badge */}
        {message.reacted ? (
          <Pressable
            onPress={() => onReactionPress?.(message)}
            style={[
              styles.reactionBadge,
              isOwn ? styles.reactionOwn : styles.reactionOther,
              {
                backgroundColor: colors.surfaceContainerHighest,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <Text style={styles.reactionText}>{message.reacted}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}, areMessageBubblePropsEqual);

export default MessageBubble;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginVertical: 2,
    width: "100%",
  },
  systemRow: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  systemPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  systemText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  bubbleWrapper: {
    flexDirection: "column",
    maxWidth: "80%",
    position: "relative",
  },
  bubbleWrapperOwn: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleWrapperOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 5,
    borderRadius: 16,
    minWidth: 70,
  },
  bubbleOwn: {
    borderBottomRightRadius: 3,
  },
  bubbleOther: {
    borderBottomLeftRadius: 3,
  },
  groupSenderName: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  replyQuote: {
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
  },
  replySender: {
    fontSize: 11,
    fontWeight: "700",
  },
  replySnippet: {
    fontSize: 12,
    marginTop: 1,
  },
  sharedPostCard: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
    width: 220,
  },
  sharedPostImage: {
    width: "100%",
    height: 140,
  },
  sharedPostInfo: {
    padding: 8,
  },
  sharedPostAuthor: {
    fontSize: 12,
    fontWeight: "700",
  },
  sharedPostCaption: {
    fontSize: 11,
    marginTop: 2,
  },
  messageImage: {
    width: 230,
    height: 180,
    borderRadius: 10,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  deletedText: {
    fontStyle: "italic",
    opacity: 0.8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    gap: 3,
    marginTop: 2,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  reactionBadge: {
    position: "absolute",
    bottom: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    zIndex: 2,
  },
  reactionOwn: {
    right: 8,
  },
  reactionOther: {
    left: 8,
  },
  reactionText: {
    fontSize: 13,
  },
});
