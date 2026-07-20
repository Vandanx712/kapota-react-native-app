import {
  Archive,
  EllipsisVertical,
  Heart,
  MapPin,
  Share2,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import SettingSwitchRow from "./SettingSwitchRow";
import type { UserPost } from "../types/settings.types";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  post: UserPost;
  isUpdating: boolean;
  onToggle: (
    field: "hideLike" | "disableShare" | "isArchived",
    value: boolean,
  ) => void;
  onDelete: () => void;
};

export default function PostCard({
  post,
  isUpdating,
  onToggle,
  onDelete,
}: Props) {
  const { authUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.author}>{authUser?.fullname}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <MapPin size={12} color={darkColors.outline} />
              <Text style={styles.metaText}>
                {post.location?.name || "No location"}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => setMenuOpen(true)}
          style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}
        >
          <EllipsisVertical size={18} color={darkColors.outline} />
        </Pressable>
      </View>

      {post.image?.url && (
        <Image
          source={{ uri: post.image.url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.captionBlock}>
        <Text style={styles.captionLabel}>Caption</Text>
        <Text style={styles.caption}>
          {post.caption || "No caption added for this post."}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Heart size={16} color={darkColors.accent} />
          <Text style={styles.statLabel}>Like</Text>
          <Text style={styles.statValue}>{post.likesCount ?? 0}</Text>
        </View>
        <View style={styles.stat}>
          <Share2 size={16} color={darkColors.primaryContainer} />
          <Text style={styles.statLabel}>Shared</Text>
          <Text style={styles.statValue}>{post.sharesCount ?? 0}</Text>
        </View>
      </View>

      <View style={styles.badges}>
        {post.hideLike && <Text style={styles.badge}>Hide like on</Text>}
        {post.disableShare && <Text style={styles.badge}>Share disabled</Text>}
        {post.isArchived && (
          <View style={styles.archiveBadge}>
            <Archive size={12} color={darkColors.outline} />
            <Text style={styles.badge}>Archived</Text>
          </View>
        )}
        {!post.hideLike && !post.disableShare && !post.isArchived && (
          <Text style={[styles.badge, styles.activeBadge]}>Active post</Text>
        )}
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Post settings</Text>

            <SettingSwitchRow
              title="Hide like"
              description="Hide like count on this post"
              value={post.hideLike}
              disabled={isUpdating}
              onValueChange={(value) => onToggle("hideLike", value)}
            />
            <SettingSwitchRow
              title="Disable share"
              description="Stop other users from sharing this post"
              value={post.disableShare}
              disabled={isUpdating}
              onValueChange={(value) => onToggle("disableShare", value)}
            />
            <SettingSwitchRow
              title="Archive"
              description="Keep the post but hide it from explore feed"
              value={post.isArchived}
              disabled={isUpdating}
              onValueChange={(value) => onToggle("isArchived", value)}
            />

            <Pressable
              onPress={() => {
                setMenuOpen(false);
                onDelete();
              }}
              disabled={isUpdating}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.pressed,
                isUpdating && styles.disabled,
              ]}
            >
              <Trash2 size={16} color={darkColors.error} />
              <Text style={styles.deleteText}>Delete post</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: "hidden",
    padding: spacing.sm,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerCopy: {
    flex: 1,
  },
  author: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 4,
  },
  metaBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  metaText: {
    ...typography.bodySm,
    color: darkColors.outline,
  },
  dateText: {
    ...typography.bodySm,
    color: darkColors.outline,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  image: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.xl,
    height: 260,
    marginBottom: spacing.sm,
    width: "100%",
  },
  captionBlock: {
    marginBottom: spacing.sm,
  },
  captionLabel: {
    ...typography.labelMd,
    color: darkColors.outline,
    marginBottom: 4,
  },
  caption: {
    ...typography.bodySm,
    color: darkColors.onSurfaceVariant,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.lg,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    padding: spacing.sm,
  },
  statLabel: {
    ...typography.bodySm,
    color: darkColors.outline,
    flex: 1,
  },
  statValue: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badge: {
    ...typography.labelMd,
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.full,
    color: darkColors.outline,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadge: {
    color: darkColors.success,
  },
  archiveBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  sheetBackdrop: {
    backgroundColor: "rgba(1,15,31,0.72)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: darkColors.surfaceContainer,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sheetTitle: {
    ...typography.titleMd,
    color: darkColors.onSurface,
    marginBottom: spacing.sm,
  },
  deleteButton: {
    alignItems: "center",
    borderColor: "rgba(255,180,171,0.35)",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: spacing.xs,
    paddingVertical: spacing.sm,
  },
  deleteText: {
    ...typography.bodySm,
    color: darkColors.error,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.45,
  },
});
