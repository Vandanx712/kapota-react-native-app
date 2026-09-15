import React, { memo, useState } from "react";
import { StyleSheet, Text, View, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import dayjs from "dayjs";
import { Heart, MapPin, Send } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import type { PostItem } from "../store/explore.store";
import { Avatar } from "@/shared/ui/Avatar";

export interface ExplorePostCardProps {
  post: PostItem;
  onLike: (postId: string) => void;
  onShare: (post: PostItem) => void;
  onAuthorPress?: (userId: string) => void;
}

export const ExplorePostCard = memo(function ExplorePostCard({
  post,
  onLike,
  onShare,
  onAuthorPress,
}: ExplorePostCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const { width: screenWidth } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const formattedTime = post.createdAt
    ? dayjs(post.createdAt).format("MMM D, h:mm A")
    : "";

  const locationName = post.location?.name;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
    >
      {/* Header: Author & Location */}
      <View style={styles.header}>
        <Avatar
          uri={post.user?.profilePic?.url}
          name={post.user?.fullname}
          size={42}
          onPress={() => onAuthorPress?.(post.user?._id)}
        />
        <View style={styles.authorInfo}>
          <Pressable onPress={() => onAuthorPress?.(post.user?._id)}>
            <Text
              numberOfLines={1}
              style={[styles.authorName, { color: colors.onSurface }]}
            >
              {post.user?.fullname || "Kapota User"}
            </Text>
          </Pressable>
          {locationName ? (
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.primary} />
              <Text
                numberOfLines={1}
                style={[styles.locationText, { color: colors.onSurfaceVariant }]}
              >
                {locationName}
              </Text>
            </View>
          ) : (
            <Text style={[styles.timeText, { color: colors.onSurfaceVariant }]}>
              {formattedTime}
            </Text>
          )}
        </View>
      </View>

      {/* Post Image */}
      {post.image?.url ? (
        <View
          style={[
            styles.imageContainer,
            {
              width: screenWidth,
              height: screenWidth * 1.05,
              backgroundColor: colors.surfaceContainerHigh,
            },
          ]}
        >
          <Image
            source={{ uri: post.image.url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={post.image.url}
            priority="normal"
          />
        </View>
      ) : null}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <Pressable
            hitSlop={8}
            onPress={() => onLike(post._id)}
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
          >
            <Heart
              size={24}
              color={post.isLiked ? colors.error : colors.onSurface}
              fill={post.isLiked ? colors.error : "transparent"}
              strokeWidth={2.2}
            />
            {!post.hideLike && (
              <Text
                style={[
                  styles.countText,
                  { color: post.isLiked ? colors.error : colors.onSurface },
                ]}
              >
                {post.likesCount ?? 0}
              </Text>
            )}
          </Pressable>

          {!post.disableShare && (
            <Pressable
              hitSlop={8}
              onPress={() => onShare(post)}
              style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            >
              <Send size={22} color={colors.onSurface} strokeWidth={2.2} />
              <Text
                style={[styles.countText, { color: colors.onSurfaceVariant }]}
              >
                Share
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Caption */}
      {post.caption ? (
        <View style={styles.captionContainer}>
          <Text
            numberOfLines={expanded ? undefined : 2}
            style={[styles.captionText, { color: colors.onSurface }]}
          >
            <Text style={[styles.captionAuthor, { color: colors.onSurface }]}>
              {post.user?.fullname}{" "}
            </Text>
            {post.caption}
          </Text>
          {post.caption.length > 90 && !expanded && (
            <Pressable onPress={() => setExpanded(true)}>
              <Text style={[styles.moreText, { color: colors.outline }]}>
                more
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
  },
  timeText: {
    fontSize: 12,
    marginTop: 2,
  },
  imageContainer: {
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
  },
  captionContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  captionAuthor: {
    fontWeight: "700",
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreText: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  pressed: {
    opacity: 0.65,
  },
});
