import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing, typography } from "@/theme/tokens";
import dayjs from "dayjs";
import { LinearGradient } from "expo-linear-gradient";
import { CheckCheck } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useChatStore } from "../store/chat.store";
import { conversation } from "../types/chat.types";
import Avatar from "./ChatAvatar";

type Props = {
  item: conversation;
  onPress: () => void;
};

export default function ConversationRow({ item, onPress }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const { onlineUsers, authUser } = useAuthStore();
  const { typing } = useChatStore();
  const onlineUserSet = new Set(onlineUsers);

  const isOnline = item.isgroup
    ? Object.keys(item.groupdetail?.membersDetail ?? {}).some(
        (id) => id !== authUser?._id && onlineUserSet.has(id),
      )
    : Boolean(item.oruserId && onlineUserSet.has(item.oruserId));
  const lastMessage = item.lastmessage;
  const isOwnLastMessage = lastMessage?.sender === authUser?._id;
  const time = lastMessage?.createdAt
    ? dayjs(lastMessage.createdAt).isSame(dayjs(), "day")
      ? dayjs(lastMessage.createdAt).format("h:mm A")
      : dayjs(lastMessage.createdAt).format("MMM D")
    : "";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationRow,
        pressed && styles.pressed,
      ]}
    >
      <Avatar item={item} isOnline={isOnline} />

      <View style={styles.conversationBody}>
        <View style={styles.rowTop}>
          <Text numberOfLines={1} style={styles.conversationName}>
            {item.isgroup ? item.groupdetail?.groupname : item?.name}
          </Text>
          <Text numberOfLines={1} style={styles.timeText}>
            {time}
          </Text>
        </View>

        <View style={styles.previewRow}>
          {isOwnLastMessage && (
            <CheckCheck
              size={18}
              color={colors.primaryContainer}
              strokeWidth={2.4}
            />
          )}
          <Text numberOfLines={1} style={styles.messageText}>
            {typing?.receiverId === item.conversationId &&
            typing?.userId !== authUser?._id
              ? item.isgroup
                ? `${item.groupdetail?.membersDetail?.[typing.userId]?.fullname ?? "Someone"} is typing...`
                : "typing..."
              : item.lastmessage?.deletedForEveryone
                ? authUser?._id === item.lastmessage.sender
                  ? "You deleted this message"
                  : "This message was deleted"
                : item.lastmessage?.image
                  ? "Image"
                  : authUser?._id &&
                      item.lastmessage?.deletedFor?.includes(authUser._id)
                    ? ""
                    : item.lastmessage?.text || ""}
          </Text>
        </View>
      </View>

      {!!item?.unseenMsg && (
        <LinearGradient
          colors={[colors.primaryContainer, colors.primary]}
          style={styles.unreadBadge}
        >
          <Text style={styles.unreadText}>{item?.unseenMsg}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    conversationRow: {
      alignItems: "center",
      flexDirection: "row",
      minHeight: 76,
      paddingHorizontal: spacing.xs,
    },
    pressed: {
      opacity: 0.72,
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
      color: colors.onSurface,
      flex: 1,
      fontSize: 15,
      fontWeight: "800",
    },
    timeText: {
      ...typography.bodySm,
      color: colors.outline,
    },
    previewRow: {
      alignItems: "center",
      flexDirection: "row",
      minWidth: 0,
      gap: 5,
    },
    senderText: {
      ...typography.bodySm,
      color: colors.primaryContainer,
    },
    messageText: {
      ...typography.bodySm,
      color: colors.outline,
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
      color: colors.onSurface,
    },
  });
