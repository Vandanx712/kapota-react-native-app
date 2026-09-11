import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ArrowLeft, Search, UserPlus, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { useChatStore } from "../store/chat.store";
import type { ChatUser, Conversation } from "../types/chat.types";
import { Avatar } from "@/shared/ui/Avatar";
import { SearchBar } from "@/shared/ui/SearchBar";
import { NewGroupModal } from "./NewGroupModal";

export interface NewChatModalProps {
  onClose: () => void;
  onOpenConversation: (conversation: Conversation) => void;
  visible: boolean;
}

export default function NewChatModal({
  onClose,
  onOpenConversation,
  visible,
}: NewChatModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [startingUserId, setStartingUserId] = useState<string | null>(null);
  const [isNewGroupVisible, setIsNewGroupVisible] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const createConversation = useChatStore((state) => state.createConversation);
  const getSurroundingUsers = useChatStore((state) => state.getSurroundingUsers);
  const hasMore = useChatStore((state) => state.hasMoreSurroundingUsers);
  const isLoading = useChatStore((state) => state.isUsersLoading);
  const isLoadingMore = useChatStore((state) => state.isMoreSurroundingUsersLoading);
  const loadMore = useChatStore((state) => state.loadMoreSurroundingUsers);
  const users = useChatStore((state) => state.users);

  useEffect(() => {
    if (visible) {
      void getSurroundingUsers();
      setQuery("");
    }
  }, [visible, getSurroundingUsers]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.fullname} ${u.bio ?? ""}`.toLowerCase().includes(q),
    );
  }, [query, users]);

  const openUser = async (user: ChatUser) => {
    if (startingUserId) return;

    const existing = conversations.find(
      (c) => !c.isgroup && c.oruserId === user._id,
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

  return (
    <>
      <Modal
        animationType="slide"
        onRequestClose={onClose}
        visible={visible}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.outlineVariant },
            ]}
          >
            <Pressable
              hitSlop={10}
              onPress={onClose}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.onSurface} strokeWidth={2.2} />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                Select contact
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
                {users.length > 0 ? `${users.length} contacts` : "Loading contacts..."}
              </Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchWrap}>
            <SearchBar
              placeholder="Search contacts by name..."
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* List */}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              !query ? (
                <View style={styles.topActions}>
                  <Pressable
                    onPress={() => setIsNewGroupVisible(true)}
                    style={({ pressed }) => [
                      styles.actionRow,
                      pressed && { backgroundColor: colors.surfaceContainerHigh },
                    ]}
                  >
                    <View
                      style={[
                        styles.actionIconWrap,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Users size={22} color={colors.onPrimary} />
                    </View>
                    <View style={styles.actionTextWrap}>
                      <Text style={[styles.actionLabel, { color: colors.onSurface }]}>
                        New group
                      </Text>
                    </View>
                  </Pressable>

                  <View
                    style={[
                      styles.contactsHeader,
                      { backgroundColor: colors.surfaceContainerLow },
                    ]}
                  >
                    <Text
                      style={[
                        styles.contactsHeaderText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      CONTACTS ON KAPOTA
                    </Text>
                  </View>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const isStarting = startingUserId === item._id;
              return (
                <Pressable
                  disabled={Boolean(startingUserId)}
                  onPress={() => void openUser(item)}
                  style={({ pressed }) => [
                    styles.userRow,
                    pressed && { backgroundColor: colors.surfaceContainerHigh },
                  ]}
                >
                  <Avatar
                    uri={item.profilePic?.url}
                    name={item.fullname}
                    size={46}
                  />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.onSurface }]}>
                      {item.fullname}
                    </Text>
                    {item.bio ? (
                      <Text
                        numberOfLines={1}
                        style={[styles.userBio, { color: colors.onSurfaceVariant }]}
                      >
                        {item.bio}
                      </Text>
                    ) : (
                      <Text
                        numberOfLines={1}
                        style={[styles.userBio, { color: colors.outline }]}
                      >
                        Available
                      </Text>
                    )}
                  </View>
                  {isStarting && (
                    <ActivityIndicator size="small" color={colors.primary} />
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors.outlineVariant },
                ]}
              />
            )}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.onSurfaceVariant }]}>
                    Loading contacts...
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.outline }]}>
                    No contacts found
                  </Text>
                </View>
              )
            }
            onEndReached={() => {
              if (hasMore) void loadMore();
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.footerLoader}
                />
              ) : null
            }
          />
        </View>
      </Modal>

      <NewGroupModal
        visible={isNewGroupVisible}
        onClose={() => setIsNewGroupVisible(false)}
        onGroupCreated={(group) => {
          onClose();
          onOpenConversation(group);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  searchWrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  topActions: {
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  contactsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  contactsHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userBio: {
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
