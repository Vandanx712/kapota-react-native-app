import {
  Clock3,
  Laptop2,
  LogOut,
  MapPin,
  ShieldCheck,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ActiveSession } from "../types/settings.types";
import { formatSessionTime } from "../utils/settings.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  session: ActiveSession;
  canManageDevices: boolean;
  isActionLoading: boolean;
  onLogout: () => void;
};

export default function SessionCard({
  session,
  canManageDevices,
  isActionLoading,
  onLogout,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const isHighlighted = session.isCurrent || session.isPrimaryDevice;

  return (
    <View
      style={[
        styles.card,
        isHighlighted && styles.cardHighlighted,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, isHighlighted && styles.iconWrapActive]}>
          <Laptop2
            size={20}
            color={isHighlighted ? colors.primaryContainer : colors.outline}
            strokeWidth={2.2}
          />
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            {session.deviceName || "Unknown device"}
          </Text>
          {session.isCurrent && (
            <Text style={styles.badge}>This device</Text>
          )}
        </View>

        {!session.isCurrent && (
          <Pressable
            onPress={onLogout}
            disabled={!canManageDevices || isActionLoading}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.pressed,
              (!canManageDevices || isActionLoading) && styles.disabled,
            ]}
          >
            <LogOut size={14} color={colors.error} strokeWidth={2.4} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statLabelRow}>
            <Clock3 size={12} color={colors.outline} />
            <Text style={styles.statLabel}>Last active</Text>
          </View>
          <Text style={styles.statValue}>
            {formatSessionTime(session.lastSeenAt)}
          </Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.statLabelRow}>
            <ShieldCheck size={12} color={colors.outline} />
            <Text style={styles.statLabel}>Logged in</Text>
          </View>
          <Text style={styles.statValue}>
            {formatSessionTime(session.createdAt)}
          </Text>
        </View>

        <View style={[styles.statItem, styles.statItemFull]}>
          <View style={styles.statLabelRow}>
            <MapPin size={12} color={colors.outline} />
            <Text style={styles.statLabel}>Network</Text>
          </View>
          <Text numberOfLines={1} style={styles.statValue}>
            {session.ipAddress || "IP unavailable"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  cardHighlighted: {
    backgroundColor: "rgba(140,128,255,0.06)",
    borderColor: "rgba(140,128,255,0.28)",
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconWrapActive: {
    backgroundColor: "rgba(140,128,255,0.14)",
  },
  deviceInfo: {
    flex: 1,
    minWidth: 0,
  },
  deviceName: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  badge: {
    ...typography.labelMd,
    color: colors.success,
    marginTop: 2,
  },
  logoutButton: {
    alignItems: "center",
    borderColor: "rgba(255,180,171,0.35)",
    borderRadius: radius.full,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
  },
  logoutText: {
    ...typography.bodySm,
    color: colors.error,
    fontWeight: "600",
  },
  statsGrid: {
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    overflow: "hidden",
  },
  statItem: {
    padding: spacing.sm,
    width: "50%",
  },
  statItemFull: {
    borderTopColor: "rgba(255,255,255,0.05)",
    borderTopWidth: 1,
    width: "100%",
  },
  statLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  statLabel: {
    ...typography.labelMd,
    color: colors.outline,
    fontSize: 10,
  },
  statValue: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
    marginTop: 4,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.45,
  },
  });
