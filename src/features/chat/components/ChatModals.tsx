import dayjs from "dayjs";
import { CheckCheck, Trash2, UsersRound, X } from "lucide-react-native";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing, typography } from "@/theme/tokens";
import type { ChatMessage, Conversation } from "../types/chat.types";

type SheetProps = {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

function Sheet({ children, onClose, title, visible }: SheetProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable
              accessibilityLabel="Close"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X color={colors.onSurface} size={22} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

type ChatInfoProps = {
  conversation: Conversation;
  onClose: () => void;
  visible: boolean;
};

export function ChatInfoModal({
  conversation,
  onClose,
  visible,
}: ChatInfoProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const isGroup = Boolean(conversation.isgroup);
  const title = isGroup
    ? conversation.groupdetail?.groupname ?? conversation.name
    : conversation.name;
  const avatarUri = isGroup
    ? conversation.groupdetail?.groupIcon?.url
    : conversation.profilePic?.url;
  const members = Object.entries(
    conversation.groupdetail?.membersDetail ?? {},
  );

  return (
    <Sheet
      onClose={onClose}
      title={isGroup ? "Group Info" : "Contact Info"}
      visible={visible}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.infoHero}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.infoAvatar} />
          ) : (
            <View style={[styles.infoAvatar, styles.avatarFallback]}>
              {isGroup ? (
                <UsersRound color={colors.onSurface} size={34} />
              ) : (
                <Text style={styles.infoInitial}>
                  {title.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
          )}
          <Text numberOfLines={2} style={styles.infoName}>
            {title}
          </Text>
          {isGroup && (
            <Text style={styles.infoMeta}>
              {members.length} {members.length === 1 ? "member" : "members"}
            </Text>
          )}
        </View>

        {isGroup && (
          <View style={styles.memberSection}>
            <Text style={styles.sectionLabel}>Participants</Text>
            {members.map(([id, member]) => (
              <View key={id} style={styles.memberRow}>
                {member.profilePic?.url ? (
                  <Image
                    source={{ uri: member.profilePic.url }}
                    style={styles.memberAvatar}
                  />
                ) : (
                  <View style={[styles.memberAvatar, styles.avatarFallback]}>
                    <Text style={styles.memberInitial}>
                      {member.fullname.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text numberOfLines={1} style={styles.memberName}>
                  {member.fullname}
                </Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}

type DeleteMessagesProps = {
  canDeleteForEveryone: boolean;
  messageCount: number;
  onClose: () => void;
  onDeleteForEveryone: () => void;
  onDeleteForMe: () => void;
  visible: boolean;
};

export function DeleteMessagesModal({
  canDeleteForEveryone,
  messageCount,
  onClose,
  onDeleteForEveryone,
  onDeleteForMe,
  visible,
}: DeleteMessagesProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <Sheet onClose={onClose} title="Delete message?" visible={visible}>
      <Text style={styles.deleteDescription}>
        {messageCount === 1
          ? "Choose how you want to remove this message."
          : `Choose how you want to remove ${messageCount} messages.`}
      </Text>
      <View style={styles.deleteActions}>
        {canDeleteForEveryone && (
          <Pressable
            onPress={onDeleteForEveryone}
            style={({ pressed }) => [
              styles.deleteAction,
              pressed && styles.actionPressed,
            ]}
          >
            <Trash2 color={colors.error} size={20} />
            <Text style={styles.deleteActionText}>Delete for Everyone</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onDeleteForMe}
          style={({ pressed }) => [
            styles.deleteAction,
            pressed && styles.actionPressed,
          ]}
        >
          <Trash2 color={colors.error} size={20} />
          <Text style={styles.deleteActionText}>Delete for Me</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}

type MessageInfoProps = {
  conversation: Conversation;
  currentUserId?: string;
  messages: ChatMessage[];
  onClose: () => void;
  visible: boolean;
};

export function MessageInfoModal({
  conversation,
  currentUserId,
  messages,
  onClose,
  visible,
}: MessageInfoProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const message = messages[0];
  const seenIds = (message?.seenBy ?? []).filter(
    (id) => id !== message?.sender && id !== currentUserId,
  );
  const seenNames = seenIds.map(
    (id) =>
      conversation.groupdetail?.membersDetail?.[id]?.fullname ??
      (!conversation.isgroup && id === conversation.oruserId
        ? conversation.name
        : "Unknown"),
  );

  return (
    <Sheet onClose={onClose} title="Message Info" visible={visible}>
      {message ? (
        <View>
          {messages.length > 1 && (
            <Text style={styles.selectionSummary}>
              Showing the first of {messages.length} selected messages
            </Text>
          )}
          <View style={styles.messagePreview}>
            <Text numberOfLines={4} style={styles.previewText}>
              {message.text || (message.image ? "Photo" : "Message")}
            </Text>
            <Text style={styles.previewTime}>
              {message.createdAt
                ? dayjs(message.createdAt).format("MMM D, YYYY [at] h:mm A")
                : "Time unavailable"}
            </Text>
          </View>
          <View style={styles.readRow}>
            <CheckCheck color={colors.primaryContainer} size={21} />
            <View style={styles.readCopy}>
              <Text style={styles.readTitle}>Read by</Text>
              <Text style={styles.readNames}>
                {seenNames.length > 0 ? seenNames.join(", ") : "Not read yet"}
              </Text>
            </View>
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    actionPressed: {
      backgroundColor: colors.surfaceContainerHighest,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    closeButton: {
      alignItems: "center",
      height: 38,
      justifyContent: "center",
      width: 38,
    },
    deleteAction: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: 52,
      paddingHorizontal: spacing.xs,
    },
    deleteActions: {
      marginTop: spacing.sm,
    },
    deleteActionText: {
      ...typography.bodyLg,
      color: colors.error,
      fontSize: 15,
      fontWeight: "600",
    },
    deleteDescription: {
      ...typography.bodySm,
      color: colors.onSurfaceVariant,
      lineHeight: 20,
    },
    infoAvatar: {
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: radius.full,
      height: 92,
      width: 92,
    },
    infoHero: {
      alignItems: "center",
      paddingBottom: spacing.md,
      paddingTop: spacing.xs,
    },
    infoInitial: {
      color: colors.onSurface,
      fontSize: 32,
      fontWeight: "700",
    },
    infoMeta: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 3,
    },
    infoName: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontSize: 21,
      marginTop: spacing.sm,
      maxWidth: "88%",
      textAlign: "center",
    },
    memberAvatar: {
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: radius.full,
      height: 42,
      width: 42,
    },
    memberInitial: {
      color: colors.onSurface,
      fontSize: 15,
      fontWeight: "700",
    },
    memberName: {
      ...typography.bodyLg,
      color: colors.onSurface,
      flex: 1,
      fontSize: 15,
    },
    memberRole: {
      ...typography.labelMd,
      color: colors.primaryContainer,
      textTransform: "capitalize",
    },
    memberRow: {
      alignItems: "center",
      borderBottomColor: colors.outlineVariant,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: 62,
    },
    memberSection: {
      paddingBottom: spacing.md,
    },
    messagePreview: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary,
      borderRadius: 8,
      maxWidth: "86%",
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    overlay: {
      backgroundColor: "rgba(0,0,0,0.52)",
      flex: 1,
      justifyContent: "flex-end",
    },
    previewText: {
      color: colors.onPrimary,
      fontSize: 15,
      lineHeight: 20,
    },
    previewTime: {
      color: colors.onPrimary,
      fontSize: 10,
      marginTop: 4,
      opacity: 0.72,
      textAlign: "right",
    },
    readCopy: {
      flex: 1,
    },
    readNames: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 2,
    },
    readRow: {
      alignItems: "flex-start",
      borderTopColor: colors.outlineVariant,
      borderTopWidth: StyleSheet.hairlineWidth,
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
      paddingTop: spacing.sm,
    },
    readTitle: {
      ...typography.bodyLg,
      color: colors.onSurface,
      fontSize: 15,
      fontWeight: "600",
    },
    sectionLabel: {
      ...typography.labelMd,
      color: colors.primaryContainer,
      marginBottom: spacing.xs,
      textTransform: "uppercase",
    },
    selectionSummary: {
      ...typography.bodySm,
      color: colors.outline,
      marginBottom: spacing.sm,
    },
    sheet: {
      backgroundColor: colors.surfaceContainerLow,
      borderColor: colors.outlineVariant,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      borderWidth: 1,
      maxHeight: "82%",
      minHeight: 220,
      paddingHorizontal: spacing.sm,
      paddingTop: 7,
      ...elevation.level3,
    },
    sheetHandle: {
      alignSelf: "center",
      backgroundColor: colors.outlineVariant,
      borderRadius: radius.full,
      height: 4,
      width: 38,
    },
    sheetHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
      marginTop: 5,
    },
    sheetTitle: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontSize: 19,
      fontWeight: "700",
    },
  });
