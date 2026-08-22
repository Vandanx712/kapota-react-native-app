import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Edit3, Search, X } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenWrapper } from "@/shared/components/ScreenWrapper";
import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing, typography } from "@/theme/tokens";
import ConversationRow from "../components/ConversationRow";
import Header from "../components/Header";
import NewChatModal from "../components/NewChatModal";
import { useChatStore } from "../store/chat.store";
import type { Conversation } from "../types/chat.types";

type Filter = "All" | "Unread" | "Groups" | "Personal";

const filters: Filter[] = ["All", "Unread", "Groups", "Personal"];

export default function ChatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const conversationError = useChatStore(
    (state) => state.conversationError,
  );
  const conversations = useChatStore((state) => state.conversations);
  const getConversation = useChatStore((state) => state.getConversation);
  const isConversationLoading = useChatStore(
    (state) => state.isConversationLoading,
  );
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation,
  );

  useEffect(() => {
    void getConversation();
  }, [getConversation]);
  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Groups" && conversation.isgroup) ||
        (activeFilter === "Personal" && !conversation.isgroup) ||
        (activeFilter === "Unread" && Boolean(conversation.unseenMsg));
      if (!matchesFilter) return false;

      const name = conversation.isgroup
        ? conversation.groupdetail?.groupname
        : conversation.name;
      return !normalizedQuery || name?.toLowerCase().includes(normalizedQuery);
    });
  }, [activeFilter, conversations, query]);

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsNewChatOpen(false);
    router.push({
      pathname: "/chat/[conversationId]",
      params: { conversationId: conversation.conversationId },
    });
  };

  const toggleSearch = () => {
    setIsSearchOpen((current) => {
      if (current) setQuery("");
      return !current;
    });
  };

  return (
    <ScreenWrapper>
      <Header onSearchPress={toggleSearch} />

      {isSearchOpen && (
        <View style={styles.searchBox}>
          <Search color={colors.outline} size={18} />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            onChangeText={setQuery}
            placeholder="Search conversations"
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
            value={query}
          />
          {!!query && (
            <Pressable
              accessibilityLabel="Clear search"
              hitSlop={8}
              onPress={() => setQuery("")}
            >
              <X color={colors.outline} size={18} />
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.filters}>
        {filters.map((filter) => (
          <Pressable
            android_ripple={{ color: "rgba(255,255,255,0.08)" }}
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={({ pressed }) => [
              styles.filterPill,
              pressed && styles.pressed,
              activeFilter === filter && styles.filterPillActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          filteredChats.length === 0 && styles.emptyListContent,
        ]}
        data={filteredChats}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.conversationId}
        ListEmptyComponent={
          isConversationLoading ? (
            <ActivityIndicator
              color={colors.primaryContainer}
              size="large"
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                {conversationError
                  ? "Conversations unavailable"
                  : query || activeFilter !== "All"
                    ? "No matching conversations"
                    : "No conversations yet"}
              </Text>
              {!!conversationError && (
                <Pressable
                  onPress={() => void getConversation()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              )}
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            colors={[colors.primaryContainer]}
            onRefresh={() => void getConversation()}
            refreshing={isConversationLoading && conversations.length > 0}
            tintColor={colors.primaryContainer}
          />
        }
        renderItem={({ item }) => (
          <ConversationRow item={item} onPress={() => openConversation(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        accessibilityLabel="Start a new chat"
        onPress={() => setIsNewChatOpen(true)}
        style={({ pressed }) => [
          styles.composeButton,
          pressed && styles.pressed,
        ]}
      >
        <Edit3 color={colors.onPrimary} size={24} />
      </Pressable>

      {isNewChatOpen && (
        <NewChatModal
          onClose={() => setIsNewChatOpen(false)}
          onOpenConversation={openConversation}
          visible
        />
      )}
    </ScreenWrapper>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    composeButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 20,
      bottom: spacing.lg,
      height: 58,
      justifyContent: "center",
      position: "absolute",
      right: spacing.lg,
      width: 58,
      ...elevation.level2,
    },
    emptyContainer: {
      alignItems: "center",
      gap: spacing.sm,
    },
    emptyListContent: {
      flexGrow: 1,
      justifyContent: "center",
    },
    emptyTitle: {
      ...typography.bodyLg,
      color: colors.outline,
      textAlign: "center",
    },
    filterPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainer,
      borderColor: colors.outlineVariant,
      borderRadius: 18,
      borderWidth: 1,
      flex: 1,
      height: 36,
      justifyContent: "center",
      paddingHorizontal: spacing.xs,
    },
    filterPillActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filters: {
      flexDirection: "row",
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    filterText: {
      color: colors.outline,
      fontSize: 12,
      fontWeight: "700",
    },
    filterTextActive: {
      color: colors.onPrimary,
    },
    listContent: {
      paddingBottom: 92,
    },
    pressed: {
      opacity: 0.74,
    },
    retryButton: {
      borderColor: colors.primaryContainer,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    retryText: {
      ...typography.bodySm,
      color: colors.primaryContainer,
      fontWeight: "700",
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
      height: 44,
      paddingVertical: 0,
    },
    separator: {
      height: spacing.xs,
    },
  });
