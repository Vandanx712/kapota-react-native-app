import { useMemo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MessageSquarePlus, Trash2 } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { useChatStore } from "../store/chat.store";
import type { Conversation } from "../types/chat.types";
import { deleteConversation } from "../api/chatApi";
import { ConversationRow } from "../components/ConversationRow";
import Header from "../components/Header";
import NewChatModal from "../components/NewChatModal";
import { NewGroupModal } from "../components/NewGroupModal";
import { SearchBar } from "@/shared/ui/SearchBar";
import { ActionSheet } from "@/shared/ui/ActionSheet";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { EmptyState } from "@/shared/ui/EmptyState";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { FlashList } from "@shopify/flash-list"

type Filter = "All" | "Unread" | "Groups" | "Direct";
const FILTERS: Filter[] = ["All", "Unread", "Groups", "Direct"];

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedConForMenu, setSelectedConForMenu] = useState<Conversation | null>(null);
  const [confirmDeleteCon, setConfirmDeleteCon] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const getConversation = useChatStore((state) => state.getConversation);
  const isConversationLoading = useChatStore((state) => state.isConversationLoading);
  const setSelectedConversation = useChatStore((state) => state.setSelectedConversation);

  useFocusEffect(
    useCallback(() => {
      void getConversation();
    }, [getConversation])
  );

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Groups" && conversation.isgroup) ||
        (activeFilter === "Direct" && !conversation.isgroup) ||
        (activeFilter === "Unread" && Boolean(conversation.unseenMsg && conversation.unseenMsg > 0));

      if (!matchesFilter) return false;

      const name = conversation.isgroup
        ? conversation.groupdetail?.groupname
        : conversation.name;

      return !q || name?.toLowerCase().includes(q);
    });
  }, [activeFilter, conversations, searchQuery]);

  const openConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsNewChatOpen(false);
    setIsNewGroupOpen(false);
    router.push({
      pathname: "/chat/[conversationId]",
      params: { conversationId: conversation.conversationId },
    });
  }, [setSelectedConversation, router]);

  const handleLongPress = useCallback((conversation: Conversation) => {
    setSelectedConForMenu(conversation);
  }, []);

  const renderConversationRow = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationRow
        item={item}
        onPress={openConversation}
        onLongPress={handleLongPress}
      />
    ),
    [openConversation, handleLongPress]
  );

  const handleDeleteConversation = async () => {
    if (!confirmDeleteCon) return;
    setIsDeleting(true);
    try {
      await deleteConversation(confirmDeleteCon.conversationId);
      useChatStore.getState().refreshGroupMember("DELETE_CONVERSATION", confirmDeleteCon);
      showSuccessToast("Chat deleted");
      setConfirmDeleteCon(null);
    } catch {
      showErrorToast("Could not delete conversation");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <Header
        onSearchPress={() => {
          setIsSearchOpen((prev) => !prev);
          if (isSearchOpen) setSearchQuery("");
        }}
        onNewGroupPress={() => setIsNewGroupOpen(true)}
      />

      {/* Search Input when active */}
      {isSearchOpen && (
        <View style={styles.searchContainer}>
          <SearchBar
            autoFocus
            placeholder="Search chats or messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </View>
      )}

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.surfaceContainerHigh,
                  borderColor: isActive
                    ? colors.primary
                    : colors.outlineVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? colors.onPrimary : colors.onSurfaceVariant,
                    fontWeight: isActive ? "700" : "600",
                  },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Conversation List */}
      <FlashList
        data={filteredChats}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={[
          styles.listContent,
          filteredChats.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isConversationLoading && conversations.length > 0}
            onRefresh={() => void getConversation()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={renderConversationRow}
        ListEmptyComponent={
          isConversationLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              icon={MessageSquarePlus}
              title={
                searchQuery || activeFilter !== "All"
                  ? "No matching chats"
                  : "No conversations yet"
              }
              description={
                searchQuery || activeFilter !== "All"
                  ? "Try checking your search terms or filter selection."
                  : "Start chatting with friends, family, or communities on Kapota."
              }
              action={
                !searchQuery && activeFilter === "All" ? (
                  <Pressable
                    onPress={() => setIsNewChatOpen(true)}
                    style={[styles.startChatBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={[styles.startChatText, { color: colors.onPrimary }]}>
                      Start a chat
                    </Text>
                  </Pressable>
                ) : null
              }
            />
          )
        }
      />

      {/* WhatsApp Floating Action Button */}
      <Pressable
        accessibilityLabel="New Chat"
        onPress={() => setIsNewChatOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            bottom: insets.bottom + 20,
          },
          pressed && styles.pressed,
        ]}
      >
        <MessageSquarePlus size={26} color={colors.onPrimary} strokeWidth={2.4} />
      </Pressable>

      {/* Context Menu Action Sheet */}
      <ActionSheet
        visible={Boolean(selectedConForMenu)}
        title={
          selectedConForMenu?.isgroup
            ? selectedConForMenu.groupdetail?.groupname
            : selectedConForMenu?.name
        }
        options={[
          {
            id: "delete",
            label: "Delete chat",
            icon: Trash2,
            isDestructive: true,
            onPress: () => {
              const target = selectedConForMenu;
              setSelectedConForMenu(null);
              setConfirmDeleteCon(target);
            },
          },
        ]}
        onClose={() => setSelectedConForMenu(null)}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmationDialog
        visible={Boolean(confirmDeleteCon)}
        title="Delete this chat?"
        message="Messages will only be removed from this device and your view."
        confirmLabel="Delete chat"
        isDestructive
        loading={isDeleting}
        onCancel={() => setConfirmDeleteCon(null)}
        onConfirm={handleDeleteConversation}
      />

      {/* Modals */}
      {isNewChatOpen && (
        <NewChatModal
          visible={isNewChatOpen}
          onClose={() => setIsNewChatOpen(false)}
          onOpenConversation={openConversation}
        />
      )}

      {isNewGroupOpen && (
        <NewGroupModal
          visible={isNewGroupOpen}
          onClose={() => setIsNewGroupOpen(false)}
          onGroupCreated={openConversation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  startChatBtn: {
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  startChatText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
