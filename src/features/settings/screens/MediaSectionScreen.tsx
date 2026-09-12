import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Check,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Music,
  RefreshCw,
  Trash2,
  Video,
  Wifi,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { AppHeader } from "@/shared/ui/AppHeader";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { updateMediaSettings } from "@/features/auth/api/authApi";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  mediaStorageService,
  type StorageBreakdownStats,
} from "@/services/storage/mediaStorageService";

interface AutoDownloadOption {
  value: number;
  label: string;
  description: string;
  badge: string;
}

const AUTO_DOWNLOAD_OPTIONS: AutoDownloadOption[] = [
  { value: 2 * 1024 * 1024, label: "2 MB", description: "Low data usage • Best for mobile networks", badge: "Low" },
  { value: 5 * 1024 * 1024, label: "5 MB", description: "Standard quality photos & voice notes", badge: "Balanced" },
  { value: 10 * 1024 * 1024, label: "10 MB", description: "High-resolution photos & audio", badge: "Recommended" },
  { value: 25 * 1024 * 1024, label: "25 MB", description: "HD Photos, larger voice & audio files", badge: "HD" },
  { value: 50 * 1024 * 1024, label: "50 MB", description: "High-speed Wi-Fi • Short clips & documents", badge: "Fast" },
  { value: 100 * 1024 * 1024, label: "100 MB", description: "Maximum — Auto-download all media", badge: "Max" },
];

const EMPTY_STATS: StorageBreakdownStats = {
  totalBytes: 0,
  totalCount: 0,
  totalFormatted: "0 KB",
  photos: { bytes: 0, count: 0, formatted: "0 KB" },
  audio: { bytes: 0, count: 0, formatted: "0 KB" },
  videos: { bytes: 0, count: 0, formatted: "0 KB" },
  documents: { bytes: 0, count: 0, formatted: "0 KB" },
};

export default function MediaSectionScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const initialAutoDownload = useAuthStore(
    (state) => state.authUser?.mediaSettings?.autoDownload ?? true
  );
  const initialLimit = useAuthStore(
    (state) => state.authUser?.mediaSettings?.maxAutoDownloadBytes ?? 10 * 1024 * 1024
  );

  const [isAutoDownload, setIsAutoDownload] = useState(initialAutoDownload);
  const [currentLimit, setCurrentLimit] = useState(initialLimit);
  const [isUpdating, setIsUpdating] = useState(false);

  // Network toggles
  const [wifiOnly, setWifiOnly] = useState(false);
  const [roamingDownload, setRoamingDownload] = useState(false);

  // Storage breakdown state
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [storageStats, setStorageStats] = useState<StorageBreakdownStats>(EMPTY_STATS);

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      try {
        const stats = mediaStorageService.getStorageStats();
        if (isMounted) setStorageStats(stats);
      } catch (err) {
        console.warn("Failed to get storage stats:", err);
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleToggleAutoDownload = async (val: boolean) => {
    setIsAutoDownload(val);
    setIsUpdating(true);
    try {
      await updateMediaSettings({
        autoDownload: val,
        maxAutoDownloadBytes: currentLimit,
      });
      useAuthStore.setState((state) => ({
        authUser: state.authUser
          ? {
            ...state.authUser,
            mediaSettings: {
              autoDownload: val,
              maxAutoDownloadBytes: currentLimit,
            },
          }
          : null,
      }));
      showSuccessToast(val ? "Auto-download enabled" : "Auto-download disabled");
    } catch {
      showErrorToast("Failed to update media settings");
      setIsAutoDownload(!val);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectLimit = async (limitBytes: number) => {
    if (limitBytes === currentLimit || isUpdating) return;
    const prevLimit = currentLimit;
    setCurrentLimit(limitBytes);
    setIsUpdating(true);
    try {
      await updateMediaSettings({
        autoDownload: isAutoDownload,
        maxAutoDownloadBytes: limitBytes,
      });
      useAuthStore.setState((state) => ({
        authUser: state.authUser
          ? {
            ...state.authUser,
            mediaSettings: {
              autoDownload: isAutoDownload,
              maxAutoDownloadBytes: limitBytes,
            },
          }
          : null,
      }));
      showSuccessToast("Download limit updated");
    } catch {
      showErrorToast("Failed to update limit");
      setCurrentLimit(prevLimit);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshStats = () => {
    setIsRefreshingStats(true);
    try {
      const stats = mediaStorageService.getStorageStats();
      setStorageStats(stats);
      showSuccessToast("Storage statistics refreshed");
    } catch {
      showErrorToast("Failed to refresh statistics");
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      const freshStats = mediaStorageService.clearMediaCache();
      setStorageStats(freshStats);
      setClearDialogOpen(false);
      showSuccessToast("Media files cleared");
    } catch {
      showErrorToast("Failed to clear media cache");
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppHeader
        title="Media & Storage"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* SECTION: AUTO-DOWNLOAD PREFERENCES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primaryContainer}20` }]}>
              <HardDrive size={18} color={colors.primaryContainer} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Auto-Download Preferences</Text>
              <Text style={styles.sectionSubtitle}>
                Configure automatic media downloading and size limits.
              </Text>
            </View>
          </View>

          <View style={styles.cardBox}>
            <View style={styles.preferenceRow}>
              <View style={styles.prefCopy}>
                <Text style={styles.prefLabel}>Auto-download incoming media</Text>
                <Text style={styles.prefDesc}>
                  Automatically download media files within your size threshold when viewing chats.
                </Text>
              </View>
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.primaryContainer} />
              ) : (
                <Switch
                  value={isAutoDownload}
                  onValueChange={handleToggleAutoDownload}
                  trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>

            {isAutoDownload && (
              <>
                <View style={styles.separator} />

                <Text style={styles.limitTitle}>Maximum Auto-Download File Size</Text>
                <Text style={styles.limitDesc}>
                  Files larger than this limit will require tapping to download manually.
                </Text>

                <View style={styles.optionsList}>
                  {AUTO_DOWNLOAD_OPTIONS.map((opt) => {
                    const isSelected = currentLimit === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => handleSelectLimit(opt.value)}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.optionTopRow}>
                          <Text
                            style={[
                              styles.optionLabel,
                              isSelected && { color: colors.primaryContainer, fontWeight: "700" },
                            ]}
                          >
                            {opt.label}
                          </Text>

                          <View style={styles.optionRightWrap}>
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor: isSelected
                                    ? `${colors.primaryContainer}20`
                                    : colors.surfaceContainerHigh,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeText,
                                  {
                                    color: isSelected
                                      ? colors.primaryContainer
                                      : colors.outline,
                                  },
                                ]}
                              >
                                {opt.badge}
                              </Text>
                            </View>

                            {isSelected && (
                              <View
                                style={[
                                  styles.checkCircle,
                                  { backgroundColor: colors.primaryContainer },
                                ]}
                              >
                                <Check size={11} color={colors.onPrimary} strokeWidth={3} />
                              </View>
                            )}
                          </View>
                        </View>
                        <Text style={styles.optionDescription}>{opt.description}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>

        {/* SECTION: STORAGE & LOCAL CACHE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.accent}20` }]}>
              <HardDrive size={18} color={colors.accent} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Device Storage & Offline Cache</Text>
              <Text style={styles.sectionSubtitle}>
                Manage media files stored locally for zero-latency access.
              </Text>
            </View>
            <Pressable
              onPress={handleRefreshStats}
              disabled={isRefreshingStats}
              style={({ pressed }) => [styles.refreshBtn, pressed && styles.pressed]}
            >
              {isRefreshingStats ? (
                <ActivityIndicator size="small" color={colors.primaryContainer} />
              ) : (
                <RefreshCw size={15} color={colors.onSurface} />
              )}
            </Pressable>
          </View>

          {/* Storage Overview Card */}
          <View style={styles.cardBox}>
            <View style={styles.storageHeroRow}>
              <View style={[styles.heroIconWrap, { backgroundColor: `${colors.primaryContainer}15` }]}>
                <HardDrive size={22} color={colors.primaryContainer} />
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>Total Storage</Text>
                <Text style={styles.heroSubtitle}>
                  {storageStats.totalCount} {storageStats.totalCount === 1 ? "file" : "files"} offline ({storageStats.totalFormatted})
                </Text>
                <Text style={styles.heroNote}>
                  Stored locally on this device for instant viewing without re-downloading.
                </Text>
                <Text style={[styles.heroNote, { color: colors.primaryContainer, fontWeight: "600", marginTop: 4 }]}>
                  📁 {mediaStorageService.getDisplayPath()}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            {/* Breakdown Grid */}
            <View style={styles.breakdownGrid}>
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <ImageIcon size={15} color={colors.primaryContainer} />
                  <Text style={styles.breakdownLabel}>Photos</Text>
                </View>
                <Text style={styles.breakdownSize}>{storageStats.photos.formatted}</Text>
                <Text style={styles.breakdownCount}>{storageStats.photos.count} items</Text>
              </View>

              <View style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <Music size={15} color={colors.secondary} />
                  <Text style={styles.breakdownLabel}>Audio</Text>
                </View>
                <Text style={styles.breakdownSize}>{storageStats.audio.formatted}</Text>
                <Text style={styles.breakdownCount}>{storageStats.audio.count} items</Text>
              </View>

              <View style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <Video size={15} color={colors.tertiary} />
                  <Text style={styles.breakdownLabel}>Videos</Text>
                </View>
                <Text style={styles.breakdownSize}>{storageStats.videos.formatted}</Text>
                <Text style={styles.breakdownCount}>{storageStats.videos.count} items</Text>
              </View>

              <View style={styles.breakdownCard}>
                <View style={styles.breakdownHeader}>
                  <FileText size={15} color={colors.accent} />
                  <Text style={styles.breakdownLabel}>Docs</Text>
                </View>
                <Text style={styles.breakdownSize}>{storageStats.documents.formatted}</Text>
                <Text style={styles.breakdownCount}>{storageStats.documents.count} items</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <PrimaryButton
              label="Clear media"
              icon={Trash2}
              variant="danger"
              disabled={storageStats.totalCount === 0 || isClearingCache}
              loading={isClearingCache}
              onPress={() => setClearDialogOpen(true)}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>

      {/* CLEAR CACHE CONFIRMATION */}
      <ConfirmationDialog
        visible={clearDialogOpen}
        title="Clear media?"
        message="This will delete downloaded photos, audio, and documents from this device. Messages and chats will not be deleted."
        confirmLabel="Clear Cache"
        isDestructive
        loading={isClearingCache}
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={handleClearCache}
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
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    sectionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitleBlock: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontWeight: "700",
    },
    sectionSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 2,
    },
    refreshBtn: {
      width: 32,
      height: 32,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceContainer,
    },
    cardBox: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
    },
    preferenceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },
    prefCopy: {
      flex: 1,
      paddingRight: spacing.sm,
    },
    prefLabel: {
      ...typography.bodySm,
      color: colors.onSurface,
      fontWeight: "600",
    },
    prefDesc: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.outline,
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: spacing.sm,
    },
    limitTitle: {
      ...typography.labelMd,
      color: colors.onSurface,
      fontWeight: "700",
      marginTop: spacing.xs,
    },
    limitDesc: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.outline,
      marginTop: 2,
      marginBottom: spacing.sm,
    },
    optionsList: {
      gap: spacing.xs,
    },
    optionCard: {
      backgroundColor: colors.background,
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
      borderRadius: radius.lg,
      padding: spacing.sm,
    },
    optionCardSelected: {
      borderColor: colors.primaryContainer,
      backgroundColor: `${colors.primaryContainer}10`,
    },
    optionTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    optionLabel: {
      ...typography.labelMd,
      color: colors.onSurface,
      fontSize: 14,
    },
    optionRightWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    badgeText: {
      ...typography.labelMd,
      fontSize: 11,
      fontWeight: "600",
    },
    checkCircle: {
      width: 18,
      height: 18,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    optionDescription: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.outline,
      marginTop: 4,
    },
    storageHeroRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    heroIconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    heroCopy: {
      flex: 1,
    },
    heroTitle: {
      ...typography.titleMd,
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
    },
    heroSubtitle: {
      ...typography.bodySm,
      fontSize: 13,
      color: colors.outline,
      marginTop: 2,
    },
    heroNote: {
      ...typography.bodySm,
      fontSize: 11,
      color: colors.outline,
      marginTop: 4,
      fontStyle: "italic",
    },
    breakdownGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    breakdownCard: {
      width: "48.5%",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: radius.md,
      padding: spacing.sm,
    },
    breakdownHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    breakdownLabel: {
      ...typography.labelMd,
      fontSize: 12,
      color: colors.onSurface,
      fontWeight: "600",
    },
    breakdownSize: {
      ...typography.titleMd,
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
      marginTop: 6,
    },
    breakdownCount: {
      ...typography.bodySm,
      fontSize: 11,
      color: colors.outline,
      marginTop: 2,
    },
    pressed: {
      opacity: 0.8,
    },
  });
