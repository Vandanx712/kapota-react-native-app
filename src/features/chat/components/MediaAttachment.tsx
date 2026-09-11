import React, { memo, useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import ImageView from "react-native-image-viewing";
import {
  ArrowDown,
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Play,
  Video,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  mediaStorageService,
  type MediaCategory,
} from "@/services/storage/mediaStorageService";
import type { ChatMedia } from "../types/chat.types";
import { showErrorToast } from "@/utils/toast";

export interface MediaAttachmentProps {
  media: ChatMedia;
  isOwn?: boolean;
  reserveTime?: boolean;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const MediaAttachment = memo(function MediaAttachment({
  media,
  isOwn = false,
  reserveTime = false,
}: MediaAttachmentProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const autoDownload = useAuthStore(
    (state) => state.authUser?.mediaSettings?.autoDownload ?? true
  );
  const maxAutoDownloadBytes = useAuthStore(
    (state) => state.authUser?.mediaSettings?.maxAutoDownloadBytes ?? 10 * 1024 * 1024
  );

  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const category: MediaCategory = mediaStorageService.getCategory(
    media.mimeType,
    media.resourceType,
  );

  // Check initial local cache and perform auto-download if qualified
  useEffect(() => {
    let isMounted = true;

    const existingUri = mediaStorageService.getLocalUri(
      media._id,
      media.mimeType,
      media.originalName,
      media.resourceType,
    );

    if (existingUri) {
      setLocalUri(existingUri);
      return;
    }

    // Auto-download check
    const fileSize = media.bytes || 0;
    if (autoDownload && fileSize <= maxAutoDownloadBytes) {
      setIsDownloading(true);
      mediaStorageService
        .downloadMedia({
          _id: media._id,
          bytes: media.bytes,
          mimeType: media.mimeType,
          originalName: media.originalName,
          url: media.url,
          onProgress: (pct) => {
            if (isMounted) setDownloadProgress(pct);
          },
        })
        .then((uri) => {
          if (isMounted) {
            setLocalUri(uri);
            setIsDownloading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setIsDownloading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [media._id, media.bytes, media.mimeType, media.originalName, media.resourceType, media.url, autoDownload, maxAutoDownloadBytes]);

  const handleManualDownload = useCallback(async () => {
    if (isDownloading || localUri) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const uri = await mediaStorageService.downloadMedia({
        _id: media._id,
        bytes: media.bytes,
        mimeType: media.mimeType,
        originalName: media.originalName,
        url: media.url,
        onProgress: (pct) => setDownloadProgress(pct),
      });
      setLocalUri(uri);
    } catch {
      showErrorToast("Download failed. Please check connection.");
    } finally {
      setIsDownloading(false);
    }
  }, [isDownloading, localUri, media]);

  const CategoryIcon =
    category === "photos"
      ? ImageIcon
      : category === "videos"
      ? Video
      : category === "audio"
      ? Music
      : FileText;

  // 1. Render when image is downloaded
  if (category === "photos" && localUri) {
    return (
      <View style={[styles.container, reserveTime && styles.reserveBottom]}>
        <Pressable
          onPress={() => setIsImageViewerOpen(true)}
          style={styles.imagePressable}
        >
          <Image
            source={{ uri: localUri }}
            style={styles.mediaImage}
            contentFit="cover"
            transition={200}
          />
        </Pressable>

        <ImageView
          images={[{ uri: localUri }]}
          imageIndex={0}
          visible={isImageViewerOpen}
          onRequestClose={() => setIsImageViewerOpen(false)}
        />
      </View>
    );
  }

  // 2. Render when video is downloaded
  if (category === "videos" && localUri) {
    return (
      <View style={[styles.container, reserveTime && styles.reserveBottom]}>
        <View style={styles.videoPreviewBox}>
          <Image
            source={{ uri: localUri }}
            style={styles.mediaImage}
            contentFit="cover"
          />
          <View style={styles.playOverlay}>
            <View style={styles.playIconCircle}>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <View style={styles.videoInfoBadge}>
              <Text style={styles.videoInfoText}>
                {formatFileSize(media.bytes)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 3. Render when audio / voice note is downloaded
  if (category === "audio" && localUri) {
    return (
      <View style={[styles.audioBox, isOwn ? styles.audioBoxOwn : styles.audioBoxOther]}>
        <View style={[styles.audioIconCircle, { backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : colors.surfaceContainerHighest }]}>
          <Music size={18} color={isOwn ? "#FFFFFF" : colors.primary} />
        </View>
        <View style={styles.audioContent}>
          <Text
            numberOfLines={1}
            style={[styles.audioTitle, { color: isOwn ? "#FFFFFF" : colors.onSurface }]}
          >
            {media.originalName || "Voice Note"}
          </Text>
          <View style={styles.waveformPlaceholder}>
            {[35, 70, 45, 90, 60, 80, 40, 65, 85, 50, 75, 40, 60, 30].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  {
                    height: (h / 100) * 22,
                    backgroundColor: isOwn ? "rgba(255,255,255,0.7)" : colors.primary,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.audioMeta, { color: isOwn ? "rgba(255,255,255,0.75)" : colors.onSurfaceVariant }]}>
            {formatFileSize(media.bytes)}
          </Text>
        </View>
      </View>
    );
  }

  // 4. Render when document is downloaded
  if (category === "documents" && localUri) {
    return (
      <View style={[styles.docCard, isOwn ? styles.docCardOwn : styles.docCardOther]}>
        <View style={[styles.docIconWrap, { backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : colors.surfaceContainerHighest }]}>
          <FileText size={20} color={isOwn ? "#FFFFFF" : colors.primary} />
        </View>
        <View style={styles.docDetails}>
          <Text
            numberOfLines={1}
            style={[styles.docName, { color: isOwn ? "#FFFFFF" : colors.onSurface }]}
          >
            {media.originalName || "Document"}
          </Text>
          <Text style={[styles.docSize, { color: isOwn ? "rgba(255,255,255,0.75)" : colors.onSurfaceVariant }]}>
            {formatFileSize(media.bytes)} • Saved
          </Text>
        </View>
      </View>
    );
  }

  // 5. Un-downloaded State (Blurred placeholder + Circular Download Arrow Badge)
  return (
    <View style={[styles.container, reserveTime && styles.reserveBottom]}>
      {category === "photos" || category === "videos" ? (
        <View style={styles.visualPlaceholder}>
          <View style={styles.placeholderDimmer}>
            <Pressable
              onPress={handleManualDownload}
              disabled={isDownloading}
              style={({ pressed }) => [
                styles.circularDownloadBtn,
                pressed && styles.pressed,
              ]}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ArrowDown size={22} color="#FFFFFF" strokeWidth={2.5} />
              )}
            </Pressable>

            <View style={styles.sizePill}>
              <Text style={styles.sizePillText}>
                {isDownloading
                  ? `Downloading ${downloadProgress}%`
                  : formatFileSize(media.bytes)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={handleManualDownload}
          disabled={isDownloading}
          style={({ pressed }) => [
            styles.docPlaceholderBox,
            isOwn ? styles.docCardOwn : styles.docCardOther,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.docIconWrap, { backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : colors.surfaceContainerHighest }]}>
            <CategoryIcon size={20} color={isOwn ? "#FFFFFF" : colors.primary} />
          </View>

          <View style={styles.docDetails}>
            <Text
              numberOfLines={1}
              style={[styles.docName, { color: isOwn ? "#FFFFFF" : colors.onSurface }]}
            >
              {media.originalName || "Attachment"}
            </Text>
            <Text style={[styles.docSize, { color: isOwn ? "rgba(255,255,255,0.75)" : colors.onSurfaceVariant }]}>
              {isDownloading
                ? `Downloading ${downloadProgress}%`
                : `${formatFileSize(media.bytes)} • Tap to download`}
            </Text>
          </View>

          <View style={styles.circularDownloadSmall}>
            {isDownloading ? (
              <ActivityIndicator size="small" color={isOwn ? "#FFFFFF" : colors.primary} />
            ) : (
              <Download size={18} color={isOwn ? "#FFFFFF" : colors.primary} />
            )}
          </View>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    borderRadius: 14,
    overflow: "hidden",
  },
  reserveBottom: {
    marginBottom: 14,
  },
  imagePressable: {
    borderRadius: 14,
    overflow: "hidden",
  },
  mediaImage: {
    width: 240,
    height: 180,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  videoPreviewBox: {
    position: "relative",
    width: 240,
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoInfoBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoInfoText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  visualPlaceholder: {
    width: 240,
    height: 180,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    overflow: "hidden",
  },
  placeholderDimmer: {
    flex: 1,
    backgroundColor: "rgba(11, 15, 25, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  circularDownloadBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  sizePill: {
    marginTop: 10,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sizePillText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  audioBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    minWidth: 230,
    maxWidth: 280,
  },
  audioBoxOwn: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  audioBoxOther: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  audioIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  audioContent: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  waveformPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    height: 22,
    gap: 3,
    marginBottom: 4,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  audioMeta: {
    fontSize: 11,
  },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    minWidth: 220,
    maxWidth: 270,
  },
  docPlaceholderBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    minWidth: 220,
    maxWidth: 270,
  },
  docCardOwn: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  docCardOther: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  docIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  docDetails: {
    flex: 1,
  },
  docName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  docSize: {
    fontSize: 11,
  },
  circularDownloadSmall: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default MediaAttachment;
