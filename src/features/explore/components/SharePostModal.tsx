import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Search, Send, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { useChatStore } from "@/features/chat/store/chat.store";
import { sendMessage } from "@/features/chat/api/chatApi";
import type { PostItem } from "../store/explore.store";
import { Avatar } from "@/shared/ui/Avatar";
import { SearchBar } from "@/shared/ui/SearchBar";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

export interface SharePostModalProps {
  visible: boolean;
  post: PostItem | null;
  onClose: () => void;
}

export function SharePostModal({
  visible,
  post,
  onClose,
}: SharePostModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const conversations = useChatStore((state) => state.conversations);

  const [query, setQuery] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const name = c.isgroup ? c.groupdetail?.groupname : c.name;
      return (name || "").toLowerCase().includes(q);
    });
  }, [conversations, query]);

  const handleShareToConversation = async (conversationId: string) => {
    if (!post || sharingId) return;
    setSharingId(conversationId);
    try {
      await sendMessage(conversationId, { postId: post._id });
      showSuccessToast("Post shared to chat");
      onClose();
    } catch {
      showErrorToast("Could not share post");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceContainer,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              Share post
            </Text>
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <SearchBar
              placeholder="Search conversation..."
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.conversationId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isGroup = Boolean(item.isgroup);
              const name = isGroup
                ? item.groupdetail?.groupname
                : item.name;
              const avatarUri = isGroup
                ? item.groupdetail?.groupIcon?.url
                : item.profilePic?.url;
              const isSending = sharingId === item.conversationId;

              return (
                <Pressable
                  disabled={Boolean(sharingId)}
                  onPress={() => void handleShareToConversation(item.conversationId)}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && { backgroundColor: colors.surfaceContainerHigh },
                  ]}
                >
                  <Avatar
                    uri={avatarUri}
                    name={name}
                    size={44}
                    isGroup={isGroup}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.name, { color: colors.onSurface }]}
                  >
                    {name}
                  </Text>
                  {isSending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <View
                      style={[
                        styles.sendBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Send size={15} color={colors.onPrimary} strokeWidth={2.4} />
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text
                style={[styles.emptyText, { color: colors.onSurfaceVariant }]}
              >
                No conversations found
              </Text>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  searchWrap: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
  sendBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 32,
    fontSize: 14,
  },
});
