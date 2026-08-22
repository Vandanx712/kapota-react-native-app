import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Bell,
  BellOff,
  ChevronLeft,
  ClipboardCopy,
  EllipsisVertical,
  Eraser,
  Image as ImageIcon,
  Info,
  Search,
  Trash2,
  Video,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import type { Conversation } from "../types/chat.types";
import PopupMenu, { type PopupMenuItem } from "./PopupMenu";

type Props = {
  canManageChat: boolean;
  contact: Conversation;
  isMuted: boolean;
  isOnline?: boolean;
  onClearChat: () => void;
  onDeleteChat: () => void;
  onInfo: () => void;
  onMuteChat: () => void;
  onSearch: () => void;
  onSetBackground: () => void;
  onVideoCall?: () => void;
};

export default function ConversationHeader({
  canManageChat,
  contact,
  isMuted,
  isOnline = false,
  onClearChat,
  onDeleteChat,
  onInfo,
  onMuteChat,
  onSearch,
  onSetBackground,
  onVideoCall,
}: Props) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);

  const displayName = contact.isgroup
    ? contact.groupdetail?.groupname ?? contact.name
    : contact.name;
  const avatarUri = contact.isgroup
    ? contact.groupdetail?.groupIcon?.url
    : contact.profilePic?.url;
  const memberCount = Object.keys(
    contact.groupdetail?.membersDetail ?? {},
  ).length;
  const subtitle = contact.isgroup
    ? `${memberCount} ${memberCount === 1 ? "member" : "members"}`
    : isOnline
      ? "online"
      : "offline";

  const menuItems: PopupMenuItem[] = [
    { icon: Search, label: "Search Messages", onPress: onSearch },
    {
      icon: Info,
      label: contact.isgroup ? "Group Info" : "Contact Info",
      onPress: onInfo,
    },
    { icon: Eraser, label: "Clear Chat", onPress: onClearChat },
    ...(canManageChat
      ? [
          {
            danger: true,
            icon: Trash2,
            label: "Delete Chat",
            onPress: onDeleteChat,
          } satisfies PopupMenuItem,
        ]
      : []),
    {
      icon: isMuted ? Bell : BellOff,
      label: isMuted ? "Unmute Chat" : "Mute Chat",
      onPress: onMuteChat,
    },
    ...(canManageChat
      ? [
          {
            icon: ImageIcon,
            label: "Set Chat Background",
            onPress: onSetBackground,
          } satisfies PopupMenuItem,
        ]
      : []),
  ];

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <ChevronLeft color={colors.onSurface} size={27} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={onInfo} style={styles.titleBlock}>
          <Text numberOfLines={1} style={styles.name}>
            {displayName}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Video call"
          hitSlop={7}
          onPress={onVideoCall}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Video color={colors.onSurface} size={23} strokeWidth={2} />
        </Pressable>

        <Pressable
          accessibilityLabel="More options"
          hitSlop={7}
          onPress={() => setMenuVisible(true)}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <EllipsisVertical
            color={colors.onSurface}
            size={24}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      <PopupMenu
        items={menuItems}
        onClose={() => setMenuVisible(false)}
        visible={menuVisible}
      />
    </>
  );
}

type SelectionHeaderProps = {
  onBack: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onMessageInfo: () => void;
  selectedCount: number;
};

export function SelectionHeader({
  onBack,
  onCopy,
  onDelete,
  onMessageInfo,
  selectedCount,
}: SelectionHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Cancel selection"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <ChevronLeft color={colors.onSurface} size={27} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.selectionCount}>{selectedCount}</Text>
        <View style={styles.selectionSpacer} />
        <Pressable
          accessibilityLabel="Delete selected messages"
          hitSlop={8}
          onPress={onDelete}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Trash2 color={colors.onSurface} size={22} strokeWidth={2} />
        </Pressable>
        <Pressable
          accessibilityLabel="More selection options"
          hitSlop={8}
          onPress={() => setMenuVisible(true)}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <EllipsisVertical color={colors.onSurface} size={24} strokeWidth={2} />
        </Pressable>
      </View>
      <PopupMenu
        items={[
          { icon: Info, label: "Message Info", onPress: onMessageInfo },
          { icon: ClipboardCopy, label: "Copy Message", onPress: onCopy },
        ]}
        onClose={() => setMenuVisible(false)}
        visible={menuVisible}
      />
    </>
  );
}

type SearchHeaderProps = {
  isLoading: boolean;
  onBack: () => void;
  onChangeText: (value: string) => void;
  query: string;
};

export function ConversationSearchHeader({
  isLoading,
  onBack,
  onChangeText,
  query,
}: SearchHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Close search"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.pressed,
        ]}
      >
        <ChevronLeft color={colors.onSurface} size={27} strokeWidth={2.2} />
      </Pressable>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        onChangeText={onChangeText}
        placeholder="Search messages"
        placeholderTextColor={colors.outline}
        returnKeyType="search"
        style={styles.searchInput}
        value={query}
      />
      {isLoading && <Text style={styles.searchingText}>...</Text>}
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    avatar: {
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: radius.full,
      height: 40,
      width: 40,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      ...typography.bodyLg,
      color: colors.onSurface,
      fontWeight: "700",
    },
    avatarWrapper: {
      marginRight: 10,
    },
    header: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerLow,
      flexDirection: "row",
      height: 58,
      paddingHorizontal: 5,
    },
    iconButton: {
      alignItems: "center",
      height: 42,
      justifyContent: "center",
      width: 40,
    },
    name: {
      color: colors.onSurface,
      fontSize: 16,
      fontWeight: "700",
      lineHeight: 20,
    },
    pressed: {
      opacity: 0.62,
    },
    searchInput: {
      ...typography.bodyLg,
      color: colors.onSurface,
      flex: 1,
      height: 48,
      paddingHorizontal: spacing.xs,
      paddingVertical: 0,
    },
    searchingText: {
      color: colors.outline,
      fontSize: 18,
      paddingHorizontal: spacing.sm,
    },
    selectionCount: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontSize: 19,
      fontWeight: "600",
    },
    selectionSpacer: {
      flex: 1,
    },
    subtitle: {
      color: colors.outline,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 1,
    },
    titleBlock: {
      flex: 1,
      justifyContent: "center",
      minWidth: 0,
      paddingRight: 4,
    },
  });
