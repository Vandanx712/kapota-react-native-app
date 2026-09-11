import { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Archive,
  Eye,
  EyeOff,
  Heart,
  Image as ImageIcon,
  MoreVertical,
  Plus,
  Share2,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react-native";
import dayjs from "dayjs";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { AppHeader } from "@/shared/ui/AppHeader";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import type { UserPost } from "@/features/settings/types/settings.types";

export default function PostSectionScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const {
    myPosts,
    postLoading,
    isMorePostsLoading,
    updatingPostId,
    postCursor,
    hasMorePosts,
    postSummary,
    loadMyPosts,
    updatePostSetting,
    removePost,
    resetPosts,
  } = useSettingsStore();

  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "archived">("all");
  const [selectedPostForSheet, setSelectedPostForSheet] = useState<UserPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<UserPost | null>(null);

  useEffect(() => {
    resetPosts();
    void loadMyPosts({ reset: true });
  }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === "archived") {
      return myPosts.filter((p) => p.isArchived);
    }
    if (activeFilter === "active") {
      return myPosts.filter((p) => !p.isArchived);
    }
    return myPosts;
  }, [myPosts, activeFilter]);

  const activeSelectedPost = useMemo(() => {
    if (!selectedPostForSheet) return null;
    return myPosts.find((p) => p._id === selectedPostForSheet._id) ?? selectedPostForSheet;
  }, [selectedPostForSheet, myPosts]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppHeader
        title="My Posts"
        showBack
        onBackPress={() => router.back()}
        rightActions={
          <Pressable
            onPress={() => router.push("/(tabs)/post")}
            style={({ pressed }) => [styles.headerAddBtn, pressed && styles.pressed]}
          >
            <Plus size={22} color={colors.onSurface} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* STATS OVERVIEW CARDS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{postSummary.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>
              {postSummary.archived}
            </Text>
            <Text style={styles.statLabel}>Archived</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.accent }]}>
              {postSummary.hiddenLikes}
            </Text>
            <Text style={styles.statLabel}>Likes Hidden</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primaryContainer }]}>
              {postSummary.shareDisabled}
            </Text>
            <Text style={styles.statLabel}>Shares Off</Text>
          </View>
        </View>

        {/* FILTER PILLS */}
        <View style={styles.filterRow}>
          {(["all", "active", "archived"] as const).map((filter) => {
            const isSelected = activeFilter === filter;
            const labels = {
              all: `All (${myPosts.length})`,
              active: `Live (${myPosts.filter((p) => !p.isArchived).length})`,
              archived: `Archived (${postSummary.archived})`,
            };

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextActive,
                  ]}
                >
                  {labels[filter]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* POSTS LIST OR LOADING OR EMPTY */}
        {postLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryContainer} />
            <Text style={styles.loadingText}>Loading your posts...</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={activeFilter === "all" ? "No posts published" : `No ${activeFilter} posts`}
            description={
              activeFilter === "all"
                ? "Share photos, updates, and thoughts with the Kapota community."
                : "You don't have any posts matching this filter."
            }
            action={
              activeFilter === "all" ? (
                <PrimaryButton
                  label="Create your first post"
                  onPress={() => router.push("/(tabs)/post")}
                />
              ) : undefined
            }
          />
        ) : (
          <View style={styles.postsList}>
            {filteredPosts.map((post) => (
              <View key={post._id} style={styles.postCard}>
                {/* Image Header / Thumbnail */}
                {post.image?.url ? (
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: post.image.url }}
                      style={styles.postImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {post.isArchived && (
                      <View style={styles.archivedOverlayPill}>
                        <Archive size={12} color="#FFFFFF" />
                        <Text style={styles.archivedOverlayText}>Archived</Text>
                      </View>
                    )}
                  </View>
                ) : null}

                {/* Post Body */}
                <View style={styles.postBody}>
                  <View style={styles.postHeaderRow}>
                    <Text style={styles.postDate}>
                      {dayjs(post.createdAt).format("MMM D, YYYY • h:mm A")}
                    </Text>
                    <Pressable
                      onPress={() => setSelectedPostForSheet(post)}
                      style={({ pressed }) => [styles.postMenuBtn, pressed && styles.pressed]}
                    >
                      <SlidersHorizontal size={18} color={colors.outline} />
                    </Pressable>
                  </View>

                  {post.caption ? (
                    <Text numberOfLines={3} style={styles.postCaption}>
                      {post.caption}
                    </Text>
                  ) : (
                    <Text style={styles.emptyCaption}>No caption provided</Text>
                  )}

                  {/* Badges & Metrics Row */}
                  <View style={styles.postMetricsRow}>
                    <View style={styles.metricItem}>
                      <Heart size={14} color={colors.accent} />
                      <Text style={styles.metricText}>
                        {post.hideLike ? "Hidden" : post.likesCount ?? 0}
                      </Text>
                    </View>

                    <View style={styles.metricItem}>
                      <Share2 size={14} color={colors.primaryContainer} />
                      <Text style={styles.metricText}>
                        {post.disableShare ? "Disabled" : post.sharesCount ?? 0}
                      </Text>
                    </View>

                    <View style={styles.spacer} />

                    <Pressable
                      onPress={() => setPostToDelete(post)}
                      style={({ pressed }) => [styles.deleteIconBtn, pressed && styles.pressed]}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {hasMorePosts && (
              <View style={styles.loadMoreContainer}>
                <PrimaryButton
                  label={isMorePostsLoading ? "Loading..." : "Load more posts"}
                  variant="outline"
                  loading={isMorePostsLoading}
                  onPress={() => void loadMyPosts({ cursor: postCursor, reset: false })}
                  fullWidth
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* POST CONTROLS ACTION SHEET MODAL */}
      <Modal
        visible={Boolean(activeSelectedPost)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPostForSheet(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedPostForSheet(null)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalDragHandle} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Post Privacy & Visibility</Text>
                <Pressable
                  onPress={() => setSelectedPostForSheet(null)}
                  style={({ pressed }) => [styles.modalCloseBtn, pressed && styles.pressed]}
                >
                  <X size={20} color={colors.outline} />
                </Pressable>
              </View>
            </View>

            {activeSelectedPost && (
              <View style={styles.modalOptions}>
                {/* Toggle: Hide Likes */}
                <View style={styles.optionRow}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>Hide Like Count</Text>
                    <Text style={styles.optionDescription}>
                      Only you will see total likes on this post in the feed.
                    </Text>
                  </View>
                  <Switch
                    value={activeSelectedPost.hideLike}
                    disabled={updatingPostId === activeSelectedPost._id}
                    onValueChange={(val) =>
                      updatePostSetting(activeSelectedPost._id, "hideLike", val)
                    }
                    trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.modalDivider} />

                {/* Toggle: Disable Share */}
                <View style={styles.optionRow}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>Disable Sharing</Text>
                    <Text style={styles.optionDescription}>
                      Prevent other members from forwarding this post to chats.
                    </Text>
                  </View>
                  <Switch
                    value={activeSelectedPost.disableShare}
                    disabled={updatingPostId === activeSelectedPost._id}
                    onValueChange={(val) =>
                      updatePostSetting(activeSelectedPost._id, "disableShare", val)
                    }
                    trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.modalDivider} />

                {/* Toggle: Archive Post */}
                <View style={styles.optionRow}>
                  <View style={styles.optionCopy}>
                    <Text style={styles.optionTitle}>Archive Post</Text>
                    <Text style={styles.optionDescription}>
                      Hide this post from Explore feed without deleting it.
                    </Text>
                  </View>
                  <Switch
                    value={activeSelectedPost.isArchived}
                    disabled={updatingPostId === activeSelectedPost._id}
                    onValueChange={(val) =>
                      updatePostSetting(activeSelectedPost._id, "isArchived", val)
                    }
                    trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.modalDivider} />

                {/* Delete Shortcut */}
                <Pressable
                  onPress={() => {
                    const post = activeSelectedPost;
                    setSelectedPostForSheet(null);
                    setPostToDelete(post);
                  }}
                  style={({ pressed }) => [styles.sheetDeleteRow, pressed && styles.pressed]}
                >
                  <Trash2 size={18} color={colors.error} />
                  <Text style={styles.sheetDeleteText}>Delete this post permanently</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmationDialog
        visible={Boolean(postToDelete)}
        title="Delete this post?"
        message="This will permanently delete this post, its media, and all like counts from Kapota. This action cannot be undone."
        confirmLabel="Delete Post"
        isDestructive
        loading={Boolean(postToDelete && updatingPostId === postToDelete._id)}
        onCancel={() => setPostToDelete(null)}
        onConfirm={async () => {
          if (!postToDelete) return;
          await removePost(postToDelete);
          setPostToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerAddBtn: {
      width: 38,
      height: 38,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    statsRow: {
      flexDirection: "row",
      gap: spacing.xs,
      marginTop: spacing.md,
      marginBottom: spacing.md,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      ...typography.headlineLgMobile,
      fontWeight: "800",
      color: colors.onSurface,
    },
    statLabel: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.outline,
      marginTop: 2,
    },
    filterRow: {
      flexDirection: "row",
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    filterPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh,
    },
    filterPillActive: {
      backgroundColor: colors.primaryContainer,
    },
    filterText: {
      ...typography.labelMd,
      color: colors.outline,
      fontWeight: "600",
    },
    filterTextActive: {
      color: colors.onPrimary,
      fontWeight: "700",
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.xl,
      gap: spacing.sm,
    },
    loadingText: {
      ...typography.bodySm,
      color: colors.outline,
    },
    postsList: {
      gap: spacing.md,
    },
    postCard: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
    },
    imageWrapper: {
      width: "100%",
      height: 220,
      backgroundColor: colors.surfaceContainerHigh,
      position: "relative",
    },
    postImage: {
      width: "100%",
      height: "100%",
    },
    archivedOverlayPill: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(0,0,0,0.72)",
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    archivedOverlayText: {
      ...typography.labelMd,
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 11,
    },
    postBody: {
      padding: spacing.md,
    },
    postHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    postDate: {
      ...typography.labelMd,
      color: colors.outline,
    },
    postMenuBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainerHigh,
    },
    postCaption: {
      ...typography.bodySm,
      color: colors.onSurface,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    emptyCaption: {
      ...typography.bodySm,
      color: colors.outline,
      fontStyle: "italic",
      marginBottom: spacing.sm,
    },
    postMetricsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
    },
    metricItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    metricText: {
      ...typography.labelMd,
      color: colors.onSurface,
      fontWeight: "600",
    },
    spacer: {
      flex: 1,
    },
    deleteIconBtn: {
      width: 30,
      height: 30,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.error}14`,
    },
    loadMoreContainer: {
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.surfaceContainer,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    modalHeader: {
      alignItems: "center",
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    modalDragHandle: {
      width: 36,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.outlineVariant,
      marginBottom: spacing.sm,
    },
    modalTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    modalTitle: {
      ...typography.titleMd,
      fontWeight: "700",
      color: colors.onSurface,
    },
    modalCloseBtn: {
      padding: 4,
    },
    modalOptions: {
      marginTop: spacing.sm,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.sm,
    },
    optionCopy: {
      flex: 1,
      paddingRight: spacing.md,
    },
    optionTitle: {
      ...typography.bodySm,
      fontWeight: "600",
      color: colors.onSurface,
    },
    optionDescription: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 2,
    },
    modalDivider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
    },
    sheetDeleteRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.md,
    },
    sheetDeleteText: {
      ...typography.bodySm,
      color: colors.error,
      fontWeight: "700",
    },
    pressed: {
      opacity: 0.75,
    },
  });
