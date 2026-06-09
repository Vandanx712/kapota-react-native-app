import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import {
  Edit3,
  Pin,
  Search,
  UsersRound,
  CheckCheck,
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  darkColors,
  elevation,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type Filter = "All" | "Unread" | "Groups" | "Personal";

type PinnedConversation = {
  id: string;
  name: string;
  image?: string;
  online?: boolean;
  accent?: string;
};

type RecentConversation = {
  id: string;
  name: string;
  message: string;
  time: string;
  image?: string;
  initials?: string;
  unread?: number;
  online?: boolean;
  isGroup?: boolean;
  sender?: string;
  delivered?: boolean;
};

const filters: Filter[] = ["All", "Unread", "Groups", "Personal"];

const pinned: PinnedConversation[] = [
  {
    id: "sarah",
    name: "Sarah",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop&crop=faces",
    online: true,
    accent: darkColors.accent,
  },
  {
    id: "design",
    name: "Design",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=240&h=240&fit=crop",
  },
  {
    id: "james",
    name: "James",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop&crop=faces",
    online: true,
    accent: darkColors.primaryContainer,
  },
];

const recent: RecentConversation[] = [
  {
    id: "elena",
    name: "Elena Vance",
    message: "The motion prototype is ready for review.",
    time: "10:42 AM",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=220&h=220&fit=crop&crop=faces",
    unread: 2,
    online: true,
  },
  {
    id: "marcus",
    name: "Marcus Knight",
    message: "Sent a voice message (0:45)",
    time: "Yesterday",
    initials: "MK",
  },
  {
    id: "sophia",
    name: "Sophia Chen",
    message: "Let's schedule the kickoff for tomorrow.",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=220&h=220&fit=crop&crop=faces",
    delivered: true,
  },
  {
    id: "alpha",
    name: "Alpha Launch Team",
    message: "Pushed final assets.",
    time: "2 days ago",
    initials: "",
    isGroup: true,
    sender: "David",
  },
];

export default function Chat() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header />

        <View style={styles.filters}>
          {filters.map((filter, index) => (
            <Pressable
              key={filter}
              style={[styles.filterPill, index === 0 && styles.filterPillActive]}
            >
              <Text
                style={[
                  styles.filterText,
                  index === 0 && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle
          icon={<Pin size={17} color={darkColors.outline} />}
          label="Pinned"
        />

        <View style={styles.pinnedRow}>
          {pinned.map((item) => (
            <PinnedAvatar key={item.id} item={item} />
          ))}
        </View>

        <SectionTitle label="Recent Messages" />

        <View style={styles.recentList}>
          {recent.map((item) => (
            <ConversationRow key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>

      <Pressable style={styles.composeButton}>
        <Edit3 size={30} color={darkColors.onSurface} strokeWidth={2.4} />
      </Pressable>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <LinearGradient
          colors={[darkColors.primaryContainer, "#6F5CFF"]}
          style={styles.logo}
        >
          <View style={styles.logoMark} />
        </LinearGradient>
        <Text style={styles.brand}>Kapota</Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable style={styles.iconButton}>
          <Search size={31} color={darkColors.outline} strokeWidth={2.4} />
        </Pressable>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
          }}
          style={styles.profileImage}
          contentFit="cover"
        />
      </View>
    </View>
  );
}

function SectionTitle({ icon, label }: { icon?: ReactNode; label: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      {icon}
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );
}

function PinnedAvatar({ item }: { item: PinnedConversation }) {
  return (
    <View style={styles.pinnedItem}>
      <View
        style={[
          styles.pinnedImageFrame,
          { borderColor: item.accent ?? "transparent" },
        ]}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.pinnedImage}
          contentFit="cover"
        />
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <Text numberOfLines={1} style={styles.pinnedName}>
        {item.name}
      </Text>
    </View>
  );
}

function ConversationRow({ item }: { item: RecentConversation }) {
  return (
    <Pressable style={styles.conversationRow}>
      <Avatar item={item} />

      <View style={styles.conversationBody}>
        <View style={styles.rowTop}>
          <Text numberOfLines={1} style={styles.conversationName}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={styles.timeText}>
            {item.time}
          </Text>
        </View>

        <View style={styles.previewRow}>
          {item.delivered && (
            <CheckCheck
              size={18}
              color={darkColors.primaryContainer}
              strokeWidth={2.4}
            />
          )}
          {item.sender && (
            <Text style={styles.senderText}>{item.sender}: </Text>
          )}
          <Text numberOfLines={1} style={styles.messageText}>
            {item.message}
          </Text>
        </View>
      </View>

      {!!item.unread && (
        <LinearGradient
          colors={[darkColors.primaryContainer, "#725EFF"]}
          style={styles.unreadBadge}
        >
          <Text style={styles.unreadText}>{item.unread}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

function Avatar({ item }: { item: RecentConversation }) {
  if (item.image) {
    return (
      <View style={styles.avatarFrame}>
        <Image
          source={{ uri: item.image }}
          style={styles.avatarImage}
          contentFit="cover"
        />
        {item.online && <View style={styles.smallOnlineDot} />}
      </View>
    );
  }

  return (
    <View style={styles.initialsAvatar}>
      {item.isGroup ? (
        <UsersRound size={28} color={darkColors.primaryContainer} />
      ) : (
        <Text style={styles.initialsText}>{item.initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#081121",
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 136,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 44,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
  },
  logo: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 42,
    justifyContent: "center",
    width: 42,
    ...elevation.level2,
  },
  logoMark: {
    backgroundColor: darkColors.onSurface,
    borderRadius: 5,
    height: 17,
    transform: [{ rotate: "45deg" }],
    width: 17,
  },
  brand: {
    ...typography.headlineLg,
    color: darkColors.onSurface,
    fontSize: 39,
    fontWeight: "800",
    lineHeight: 45,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  iconButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
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
    marginBottom: 42,
  },
  filterPill: {
    alignItems: "center",
    backgroundColor: "rgba(28, 43, 60, 0.72)",
    borderColor: "rgba(146, 142, 160, 0.28)",
    borderRadius: radius.full,
    borderWidth: 1.5,
    flex: 1,
    height: 62,
    justifyContent: "center",
  },
  filterPillActive: {
    backgroundColor: "#806BFF",
    borderColor: "#806BFF",
  },
  filterText: {
    ...typography.bodyLg,
    color: darkColors.outline,
    fontSize: 20,
    fontWeight: "700",
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
  pinnedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 70,
  },
  pinnedItem: {
    alignItems: "center",
    width: 118,
  },
  pinnedImageFrame: {
    borderRadius: 32,
    borderWidth: 6,
    height: 104,
    marginBottom: spacing.md,
    width: 104,
  },
  pinnedImage: {
    backgroundColor: darkColors.surfaceContainer,
    borderRadius: 27,
    height: "100%",
    width: "100%",
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
    gap: 34,
  },
  conversationRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 76,
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
    ...typography.titleMd,
    color: darkColors.onSurface,
    flex: 1,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 31,
  },
  timeText: {
    ...typography.bodySm,
    color: darkColors.outline,
    fontSize: 17,
  },
  previewRow: {
    alignItems: "center",
    flexDirection: "row",
    minWidth: 0,
  },
  senderText: {
    ...typography.bodyLg,
    color: darkColors.primaryContainer,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  messageText: {
    ...typography.bodyLg,
    color: darkColors.outline,
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
  },
  avatarFrame: {
    height: 76,
    width: 76,
  },
  avatarImage: {
    backgroundColor: darkColors.surfaceContainer,
    borderRadius: 25,
    height: 76,
    width: 76,
  },
  smallOnlineDot: {
    backgroundColor: darkColors.success,
    borderColor: "#081121",
    borderRadius: radius.full,
    borderWidth: 4,
    bottom: -4,
    height: 24,
    position: "absolute",
    right: -4,
    width: 24,
  },
  initialsAvatar: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
    borderColor: "rgba(146, 142, 160, 0.2)",
    borderRadius: 25,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  initialsText: {
    ...typography.headlineLg,
    color: darkColors.primaryContainer,
    fontSize: 34,
    fontWeight: "800",
  },
  unreadBadge: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 38,
    justifyContent: "center",
    marginLeft: spacing.sm,
    width: 38,
    ...elevation.level2,
  },
  unreadText: {
    ...typography.bodySm,
    color: darkColors.onSurface,
    fontSize: 16,
    fontWeight: "800",
  },
  composeButton: {
    alignItems: "center",
    backgroundColor: "#7662F8",
    borderRadius: 28,
    bottom: 100,
    height: 72,
    justifyContent: "center",
    position: "absolute",
    right: spacing.lg,
    width: 72,
    ...elevation.level2,
  },
});
