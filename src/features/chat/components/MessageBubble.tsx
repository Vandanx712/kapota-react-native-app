import React, { memo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Reply } from "lucide-react-native";
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
  onSwipeReply?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
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
    prev.message.status === next.message.status &&
    prev.message.deletedForEveryone === next.message.deletedForEveryone &&
    prev.message.media?._id === next.message.media?._id &&
    prev.message.seenBy?.length === next.message.seenBy?.length &&
    prev.message.replyTo === next.message.replyTo &&
    prev.isSelected === next.isSelected &&
    prev.selectionMode === next.selectionMode &&
    prev.currentUserId === next.currentUserId &&
    prev.onRetry === next.onRetry
  );
}

export const MessageBubble = memo(function MessageBubble({
  message,
  conversation,
  currentUserId,
  isSelected = false,
  selectionMode = false,
  onPress,
  onLongPress,
  onReactionPress,
  onSwipeReply,
  onRetry,
}: MessageBubbleProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const isOwn = message.sender === currentUserId;
  const isGroup = Boolean(conversation.isgroup);
  const member = isGroup ? conversation.groupdetail?.membersDetail?.[message.sender] : null;
  const senderName = member?.fullname || "Member";

  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .activeOffsetX([15, 100])
    .failOffsetY([-15, 15])
    .enabled(!selectionMode && !message.system && Boolean(onSwipeReply))
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, 60);
      }
    })
    .onEnd((event) => {
      if (event.translationX >= 45 && onSwipeReply) {
        runOnJS(onSwipeReply)(message);
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 250 });
    });

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedReplyIconStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, 20, 45],
      [0.2, 0.7, 1],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      translateX.value,
      [0, 15, 45],
      [0, 0.5, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

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
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.swipeWrapper, animatedBubbleStyle]}>
        <Animated.View
          style={[
            styles.replyIndicator,
            { backgroundColor: colors.surfaceContainerHighest },
            animatedReplyIconStyle,
          ]}
        >
          <Reply size={16} color={colors.primary} strokeWidth={2.4} />
        </Animated.View>
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
                  transition={150}
                  cachePolicy="memory-disk"
                  recyclingKey={message.post.image.url}
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
            {isOwn &&
              (message.status === "failed" ? (
                <Pressable
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation();
                    onRetry?.(message);
                  }}
                  style={styles.retryRow}
                >
                  <Text style={styles.retryText}>Retry</Text>
                  <MessageStatus
                    status="failed"
                    isSeen={false}
                    size={13}
                  />
                </Pressable>
              ) : (
                <MessageStatus
                  status={message.status}
                  isSeen={isSeenByOther}
                  color="rgba(255,255,255,0.7)"
                  activeColor="#FFFFFF"
                  size={14}
                />
              ))}
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
      </Animated.View>
    </GestureDetector>
  );
}, areMessageBubblePropsEqual);

export default MessageBubble;

const styles = StyleSheet.create({
  swipeWrapper: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },
  replyIndicator: {
    position: "absolute",
    left: 8,
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
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
  retryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  retryText: {
    color: "#FCA5A5",
    fontSize: 10,
    fontWeight: "700",
  },
});

