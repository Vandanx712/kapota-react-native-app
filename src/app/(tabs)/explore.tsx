import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Compass, RefreshCw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useExploreStore,
  type PostItem,
} from "@/features/explore/store/explore.store";
import { ExplorePostCard } from "@/features/explore/components/ExplorePostCard";
import { SharePostModal } from "@/features/explore/components/SharePostModal";
import { EmptyState } from "@/shared/ui/EmptyState";
import { IconButton } from "@/shared/ui/IconButton";
import { FlashList } from "@shopify/flash-list"

export default function ExploreScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const socket = useAuthStore((state) => state.socket);

  const {
    posts,
    isLoading,
    isRefreshing,
    hasMore,
    fetchFeed,
    likePost,
    syncSocketLike,
  } = useExploreStore();

  const [sharePostTarget, setSharePostTarget] = useState<PostItem | null>(null);

  const handleSharePost = useCallback((post: PostItem) => {
    setSharePostTarget(post);
  }, []);

  const renderPostCard = useCallback(
    ({ item }: { item: PostItem }) => (
      <ExplorePostCard
        post={item}
        onLike={likePost}
        onShare={handleSharePost}
      />
    ),
    [likePost, handleSharePost],
  );

  useEffect(() => {
    void fetchFeed(true);
  }, []);

  // Socket listener for real-time like updates
  useEffect(() => {
    if (!socket) return;

    const handlePostLiked = (data: {
      postId: string;
      userId: string;
      liked: boolean;
      likesCount: number;
    }) => {
      syncSocketLike(data);
    };

    socket.on("postLiked", handlePostLiked);
    return () => {
      socket.off("postLiked", handlePostLiked);
    };
  }, [socket, syncSocketLike]);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            Explore
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}
          >
            Community posts & stories
          </Text>
        </View>

        <IconButton
          icon={RefreshCw}
          onPress={() => void fetchFeed(true)}
          disabled={isLoading || isRefreshing}
          size={20}
        />
      </View>

      {/* Posts List */}
      <FlashList
        data={posts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          posts.length === 0 && styles.emptyContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void fetchFeed(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        renderItem={renderPostCard}
        onEndReached={() => {
          if (hasMore && !isLoading && !isRefreshing) {
            void fetchFeed(false);
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading && posts.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading && !isRefreshing ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              icon={Compass}
              title="No posts yet"
              description="Be the first to share a moment with the Kapota community."
            />
          )
        }
      />

      <SharePostModal
        visible={Boolean(sharePostTarget)}
        post={sharePostTarget}
        onClose={() => setSharePostTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  listContent: {
    paddingBottom: 90,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
