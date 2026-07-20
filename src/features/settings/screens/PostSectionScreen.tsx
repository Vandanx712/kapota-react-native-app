import { Settings2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButton from "@/features/settings/components/ActionButton";
import ConfirmModal from "@/features/settings/components/ConfirmModal";
import PostCard from "@/features/settings/components/PostCard";
import SectionShell from "@/features/settings/components/SectionShell";
import StatCard from "@/features/settings/components/StatCard";
import { useSettingsStore } from "@/features/settings/store/settings.store";
import type { UserPost } from "@/features/settings/types/settings.types";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

export default function PostSectionScreen() {
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

  const [postToDelete, setPostToDelete] = useState<UserPost | null>(null);

  useEffect(() => {
    resetPosts();
    loadMyPosts({ reset: true });
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <SectionShell
        icon={Settings2}
        title="Post"
        description="See posts, post setting"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.statsGrid}>
            <StatCard
              title="Total posts"
              value={postSummary.total}
              description="All uploads in your account"
            />
            <StatCard
              title="Archived"
              value={postSummary.archived}
              description="Posts hidden from the feed"
            />
            <StatCard
              title="Likes hidden"
              value={postSummary.hiddenLikes}
              description="Posts with hidden like count"
            />
            <StatCard
              title="Share disabled"
              value={postSummary.shareDisabled}
              description="Posts not allowed to share"
            />
          </View>

          {postLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={darkColors.primaryContainer} />
              <Text style={styles.loadingText}>Loading your posts...</Text>
            </View>
          ) : myPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Settings2 size={48} color={darkColors.outline} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>
                Once you share posts, they will show up here with quick controls
                for likes, sharing, archive state, and delete.
              </Text>
            </View>
          ) : (
            <>
              {myPosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  isUpdating={updatingPostId === post._id}
                  onToggle={(field, value) =>
                    updatePostSetting(post._id, field, value)
                  }
                  onDelete={() => setPostToDelete(post)}
                />
              ))}

              {hasMorePosts && (
                <ActionButton
                  label={isMorePostsLoading ? "Loading..." : "Load more posts"}
                  onPress={() =>
                    loadMyPosts({ cursor: postCursor, reset: false })
                  }
                  disabled={isMorePostsLoading}
                  loading={isMorePostsLoading}
                  fullWidth
                />
              )}
            </>
          )}
        </ScrollView>
      </SectionShell>

      <ConfirmModal
        visible={Boolean(postToDelete)}
        title="Delete this post?"
        message="This will permanently remove the post from your account. You cannot undo this action."
        confirmLabel="Delete post"
        destructive
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

const styles = StyleSheet.create({
  screen: {
    backgroundColor: darkColors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  loadingBox: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.bodySm,
    color: darkColors.outline,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.titleMd,
    color: darkColors.onSurface,
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 22,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
