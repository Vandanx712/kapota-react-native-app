import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { useChatStore } from "../store/chat.store";
import type { ChatUser, Conversation } from "../types/chat.types";

type Props = {
  onClose: () => void;
  onOpenConversation: (conversation: Conversation) => void;
  visible: boolean;
};

export default function NewChatModal({
  onClose,
  onOpenConversation,
  visible,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [startingUserId, setStartingUserId] = useState<string | null>(null);

  const conversations = useChatStore((state) => state.conversations);
  const createConversation = useChatStore(
    (state) => state.createConversation,
  );
  const getSurroundingUsers = useChatStore(
    (state) => state.getSurroundingUsers,
  );
  const hasMore = useChatStore(
    (state) => state.hasMoreSurroundingUsers,
  );
  const isLoading = useChatStore((state) => state.isUsersLoading);
  const isLoadingMore = useChatStore(
    (state) => state.isMoreSurroundingUsersLoading,
  );
  const loadMore = useChatStore(
    (state) => state.loadMoreSurroundingUsers,
  );
  const users = useChatStore((state) => state.users);

  useEffect(() => {
    if (!visible) return;
    void getSurroundingUsers();
  }, [getSurroundingUsers, visible]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;
    return users.filter((user) =>
      `${user.fullname} ${user.bio ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, users]);

  const openUser = async (user: ChatUser) => {
    if (startingUserId) return;

    const existing = conversations.find(
      (conversation) =>
        !conversation.isgroup && conversation.oruserId === user._id,
    );
    if (existing) {
      useChatStore.getState().setSelectedConversation(existing);
      onOpenConversation(existing);
      return;
    }

    setStartingUserId(user._id);
    const created = await createConversation(user._id);
    setStartingUserId(null);
    if (created) onOpenConversation(created);
  };

  const renderUser = ({ item }: { item: ChatUser }) => {
    const isStarting = startingUserId === item._id;
    return (
      <Pressable
        disabled={Boolean(startingUserId)}
        onPress={() => void openUser(item)}
        style={({ pressed }) => [
          styles.userRow,
          pressed && styles.pressed,
        ]}
      >
        {item.profilePic?.url ? (
          <Image source={{ uri: item.profilePic.url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {item.fullname.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userCopy}>
          <Text numberOfLines={1} style={styles.userName}>
            {item.fullname}
          </Text>
          {!!item.bio && (
            <Text numberOfLines={1} style={styles.userBio}>
              {item.bio}
            </Text>
          )}
        </View>
        {isStarting && (
          <ActivityIndicator color={colors.primaryContainer} size="small" />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>New message</Text>
            <Pressable
              accessibilityLabel="Close"
              hitSlop={8}
              onPress={onClose}
              style={styles.closeButton}
            >
              <X color={colors.onSurface} size={22} />
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <Search color={colors.outline} size={19} />
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Search people"
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
              value={query}
            />
          </View>

          <FlatList
            contentContainerStyle={[
              styles.listContent,
              filteredUsers.length === 0 && styles.emptyListContent,
            ]}
            data={filteredUsers}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              isLoading ? (
                <ActivityIndicator
                  color={colors.primaryContainer}
                  size="large"
                />
              ) : (
                <Text style={styles.emptyText}>No people found</Text>
              )
            }
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator
                  color={colors.primaryContainer}
                  style={styles.footerLoader}
                />
              ) : null
            }
            onEndReached={() => {
              if (hasMore) void loadMore();
            }}
            onEndReachedThreshold={0.35}
            renderItem={renderUser}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    avatar: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.full,
      height: 48,
      width: 48,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      color: colors.onSurface,
      fontSize: 17,
      fontWeight: "800",
    },
    backdrop: {
      flex: 1,
    },
    closeButton: {
      alignItems: "center",
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    emptyText: {
      ...typography.bodyLg,
      color: colors.outline,
      textAlign: "center",
    },
    footerLoader: {
      paddingVertical: spacing.md,
    },
    handle: {
      alignSelf: "center",
      backgroundColor: colors.outlineVariant,
      borderRadius: radius.full,
      height: 4,
      marginBottom: spacing.sm,
      width: 42,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    overlay: {
      backgroundColor: "rgba(0,0,0,0.5)",
      flex: 1,
      justifyContent: "flex-end",
    },
    pressed: {
      opacity: 0.7,
    },
    searchBox: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerHigh,
      borderColor: colors.outlineVariant,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.xs,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    searchInput: {
      ...typography.bodyLg,
      color: colors.onSurface,
      flex: 1,
      height: 46,
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      height: "78%",
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.xs,
    },
    title: {
      ...typography.headlineLg,
      color: colors.onSurface,
      fontSize: 21,
      fontWeight: "800",
    },
    titleRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    userBio: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 3,
    },
    userCopy: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      ...typography.bodyLg,
      color: colors.onSurface,
      fontWeight: "700",
    },
    userRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: 68,
      paddingHorizontal: spacing.xs,
    },
  });
