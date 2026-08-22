import { useRef } from "react";
import dayjs from "dayjs";
import { Check, CheckCheck } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, typography } from "@/theme/tokens";
import type { ChatMessage, Conversation } from "../types/chat.types";

type Props = {
  conversation: Conversation;
  currentUserId?: string;
  isSelected: boolean;
  message: ChatMessage;
  onLongPress: (message: ChatMessage) => void;
  onPress: (message: ChatMessage) => void;
  selectionMode: boolean;
};

const senderColorIndex = (senderId: string | undefined, colorCount: number) =>
  [...String(senderId || "")].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  ) % colorCount;

export default function MessageBubble({
  conversation,
  currentUserId,
  isSelected,
  message,
  onLongPress,
  onPress,
  selectionMode,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const didLongPressRef = useRef(false);
  const isOwn = message.sender === currentUserId;
  const member = conversation.groupdetail?.membersDetail?.[message.sender];
  const showGroupSender = Boolean(conversation.isgroup && !isOwn);
  const isRead =
    Boolean(message.isSeen) ||
    Boolean(message.seenBy?.some((userId) => userId !== message.sender));
  const senderColors = [
    colors.primaryContainer,
    colors.tertiary,
    colors.success,
    colors.highlight,
    colors.secondary,
  ];
  const senderColor =
    senderColors[senderColorIndex(message.sender, senderColors.length)];

  if (message.system) {
    return (
      <View style={styles.systemRow}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>
            {message.text ?? "Conversation updated"}
          </Text>
        </View>
      </View>
    );
  }

  const handlePress = () => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    if (selectionMode) onPress(message);
  };

  const handleLongPress = () => {
    didLongPressRef.current = true;
    onLongPress(message);
  };

  const senderAvatar = member?.profilePic?.url;

  return (
    <Pressable
      delayLongPress={260}
      onLongPress={handleLongPress}
      onPress={handlePress}
      style={[styles.tapArea, isSelected && styles.selectedRow]}
    >
      <View
        style={[
          styles.messageRow,
          isOwn ? styles.messageRowOwn : styles.messageRowIncoming,
        ]}
      >
        {showGroupSender && (
          <View style={styles.avatarColumn}>
            {senderAvatar ? (
              <Image
                source={{ uri: senderAvatar }}
                style={styles.senderAvatar}
              />
            ) : (
              <View style={[styles.senderAvatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {(member?.fullname ?? "?").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        )}

        <View
          style={[
            styles.messageColumn,
            isOwn ? styles.messageColumnOwn : styles.messageColumnIncoming,
          ]}
        >
          {showGroupSender && (
            <Text
              numberOfLines={1}
              style={[styles.senderName, { color: senderColor }]}
            >
              {member?.fullname ?? "Unknown"}
            </Text>
          )}

          <View
            style={[
              styles.bubble,
              isOwn ? styles.bubbleOwn : styles.bubbleIncoming,
            ]}
          >
            {!!message.image?.url && (
              <Image
                resizeMode="cover"
                source={{ uri: message.image.url }}
                style={styles.messageImage}
              />
            )}
            {!!message.text && (
              <Text
                style={[
                  styles.messageText,
                  isOwn && styles.messageTextOwn,
                  message.image && styles.textWithImage,
                  message.deletedForEveryone && styles.deletedText,
                ]}
              >
                {message.text}
              </Text>
            )}

            <View style={styles.metaRow}>
              <Text style={[styles.timestamp, isOwn && styles.timestampOwn]}>
                {message.createdAt
                  ? dayjs(message.createdAt).format("h:mm A")
                  : ""}
              </Text>
              {isOwn &&
                (isRead ? (
                  <CheckCheck
                    color={colors.onPrimary}
                    size={15}
                    strokeWidth={2.1}
                  />
                ) : (
                  <Check color={colors.onPrimary} size={15} strokeWidth={2.1} />
                ))}
            </View>
          </View>

          {!!message.reacted && (
            <View
              style={[
                styles.reactionPill,
                isOwn ? styles.reactionOwn : styles.reactionIncoming,
              ]}
            >
              <Text style={styles.reactionText}>{message.reacted}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    avatarColumn: {
      justifyContent: "flex-start",
      marginRight: 6,
      paddingTop: 18,
      width: 30,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      color: colors.onSurface,
      fontSize: 11,
      fontWeight: "700",
    },
    bubble: {
      borderRadius: 9,
      maxWidth: "100%",
      minWidth: 74,
      paddingBottom: 4,
      paddingHorizontal: 8,
      paddingTop: 6,
    },
    bubbleIncoming: {
      backgroundColor: colors.surfaceContainerHigh,
      borderTopLeftRadius: 3,
    },
    bubbleOwn: {
      backgroundColor: colors.primary,
      borderTopRightRadius: 3,
    },
    deletedText: {
      fontStyle: "italic",
      opacity: 0.76,
    },
    messageColumn: {
      maxWidth: "82%",
      minWidth: 0,
    },
    messageColumnIncoming: {
      alignItems: "flex-start",
    },
    messageColumnOwn: {
      alignItems: "flex-end",
    },
    messageImage: {
      borderRadius: 6,
      height: 180,
      marginHorizontal: -4,
      marginTop: -2,
      maxWidth: 260,
      width: 236,
    },
    messageRow: {
      flexDirection: "row",
      paddingHorizontal: 8,
    },
    messageRowIncoming: {
      justifyContent: "flex-start",
    },
    messageRowOwn: {
      justifyContent: "flex-end",
    },
    messageText: {
      ...typography.bodyLg,
      color: colors.onSurface,
      fontSize: 15,
      lineHeight: 20,
    },
    messageTextOwn: {
      color: colors.onPrimary,
    },
    metaRow: {
      alignItems: "center",
      alignSelf: "flex-end",
      flexDirection: "row",
      gap: 2,
      height: 15,
      marginLeft: 16,
      marginTop: 1,
    },
    reactionIncoming: {
      marginLeft: 6,
    },
    reactionOwn: {
      marginRight: 6,
    },
    reactionPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerHighest,
      borderColor: colors.outlineVariant,
      borderRadius: radius.full,
      borderWidth: 1,
      justifyContent: "center",
      marginTop: -3,
      minHeight: 24,
      minWidth: 32,
      paddingHorizontal: 6,
      zIndex: 2,
    },
    reactionText: {
      fontSize: 15,
      lineHeight: 19,
    },
    selectedRow: {
      backgroundColor: "rgba(37, 211, 102, 0.17)",
    },
    senderAvatar: {
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: radius.full,
      height: 28,
      width: 28,
    },
    senderName: {
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 16,
      marginBottom: 2,
      marginLeft: 2,
      maxWidth: 210,
    },
    systemBubble: {
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: 7,
      maxWidth: "82%",
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    systemRow: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 6,
    },
    systemText: {
      color: colors.onSurfaceVariant,
      fontSize: 12,
      lineHeight: 16,
      textAlign: "center",
    },
    tapArea: {
      paddingVertical: 2,
      width: "100%",
    },
    textWithImage: {
      marginTop: 6,
    },
    timestamp: {
      color: colors.outline,
      fontSize: 10,
      lineHeight: 13,
    },
    timestampOwn: {
      color: colors.onPrimary,
      opacity: 0.76,
    },
  });
