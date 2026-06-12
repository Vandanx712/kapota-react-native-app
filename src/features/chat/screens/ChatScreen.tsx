import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Edit3, Search, UsersRound, CheckCheck } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ScreenWrapper } from "@/shared/components/ScreenWrapper";

import {
  darkColors,
  elevation,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import { useChatStore } from "@/features/chat/store/chat.store";
import { conversation } from "@/features/chat/types/chat.types";
import Header from "../components/Header";
import ConversationRow from "../components/ConversationRow";

type Filter = "All" | "Unread" | "Groups" | "Personal";
const filters: Filter[] = ["All", "Unread", "Groups", "Personal"];

export default function ChatScreen() {
  const { conversations, getConversation, isConversationLoading } =
    useChatStore();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  useEffect(() => {
    getConversation();
  }, []);
  
  const filteredChats = useMemo(() => {
    switch (activeFilter) {
      case "Groups":
        return conversations.filter((c: conversation) => c.isgroup);

      case "Personal":
        return conversations.filter((c: conversation) => !c.isgroup);

      case "Unread":
        return conversations.filter((c: conversation) => c.unseenMsg);

      default:
        return conversations;
    }
  }, [conversations, activeFilter]);
  
  if (isConversationLoading) {
    return (
      <ScreenWrapper>
        <Text>Loading conversations...</Text>
      </ScreenWrapper>
    );
  }


  const changeFilter = (filter: Filter) => {
    setActiveFilter(filter);
  };

  return (
    <ScreenWrapper>
      <Header />

      <View style={styles.filters}>
        {filters.map((filter, index) => (
          <Pressable
            key={filter}
            onPress={() => changeFilter(filter)}
            android_ripple={{ color: "rgba(255,255,255,0.08)" }}
            style={({ pressed }) => [
              styles.filterPill,
              pressed && { opacity: 0.8 },
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
        style={{ flex: 1 }}
        data={filteredChats}
        renderItem={({ item }) => <ConversationRow item={item} />}
        keyExtractor={(item: conversation) => item.conversationId}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          // <View style={styles.emptyContainer}>
          //   <Text style={styles.emptyText}>No conversations yet</Text>
          // </View>
          <Text style={{ color: "white", margin: "auto" }}>
            No conversations yet
          </Text>
        )}
      />

      <Pressable style={styles.composeButton}>
        <Edit3 size={25} color={darkColors.onSurface} />
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#081121",
  },
  content: {
    paddingBottom: 136,
  },
  profileImage: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderColor: darkColors.outlineVariant,
    borderRadius: radius.full,
    borderWidth: 2,
    height: 56,
    width: 56,
  },
  filters: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterPill: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  filterPillActive: {
    backgroundColor: "rgba(118,98,248,0.18)",
    borderColor: "#7662F8",
  },
  filterText: {
    ...typography.bodyLg,
    color: darkColors.outline,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: darkColors.onSurface,
  },
  sectionTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.labelMd,
    color: darkColors.outline,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  onlineDot: {
    backgroundColor: darkColors.success,
    borderColor: "#081121",
    borderRadius: radius.full,
    borderWidth: 4,
    bottom: -9,
    height: 30,
    position: "absolute",
    right: -9,
    width: 30,
    ...elevation.level2,
  },
  pinnedName: {
    ...typography.bodyLg,
    color: darkColors.onSurfaceVariant,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  recentList: {
    gap: spacing.md,
  },
  composeButton: {
    alignItems: "center",
    backgroundColor: "#7662F8",
    borderRadius: 20,
    bottom: 120,
    height: 60,
    justifyContent: "center",
    position: "absolute",
    right: spacing.lg,
    width: 60,
    ...elevation.level2,
  },
  chatList: {
    paddingBottom: 140,
  },
});
