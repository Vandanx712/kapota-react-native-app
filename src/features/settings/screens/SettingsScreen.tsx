import { LogOut, ShieldCheck, SlidersHorizontal } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "@/features/auth/store/auth.store";
import SettingsItemRow from "@/features/settings/components/SettingsItemRow";
import SettingsProfileHeader from "@/features/settings/components/SettingsProfileHeader";
import {
  APP_VERSION,
  SETTINGS_ITEMS,
} from "@/features/settings/constants/settings.constants";
import { SETTINGS_SECTION_ICONS } from "@/features/settings/constants/settings.icons";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { ScreenWrapper } from "@/shared/components/ScreenWrapper";

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Account</Text>
            <Text style={styles.subtitle}>
              Your identity, preferences, and app controls.
            </Text>
          </View>
          
        </View>

        <SettingsProfileHeader />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <SlidersHorizontal size={17} color={colors.primaryContainer} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Manage your space</Text>
            <Text style={styles.sectionDescription}>
              Everything you need, in one place.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          {SETTINGS_ITEMS.map((item) => {
            const Icon = SETTINGS_SECTION_ICONS[item.id];
            return (
              <SettingsItemRow
                key={item.id}
                icon={Icon}
                label={item.label}
                description={item.description}
                onPress={() => router.push(`/settings/${item.id}`)}
              />
            );
          })}
        </View>

        <View style={styles.securityNote}>
          <ShieldCheck size={18} color={colors.success} />
          <Text style={styles.securityText}>
            Your account settings stay on this device until you change them.
          </Text>
        </View>

        <View style={styles.logoutCard}>
          <SettingsItemRow
            icon={LogOut}
            label="Log out"
            description="Sign out from this device"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={styles.version}>{APP_VERSION}</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    content: {
      paddingBottom: 140,
    },
    hero: {
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    eyebrow: {
      ...typography.labelMd,
      color: colors.primary,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    title: {
      ...typography.headlineLgMobile,
      color: colors.onSurface,
      fontSize: 30,
      fontWeight: "800",
      marginTop: 3,
    },
    subtitle: {
      ...typography.bodySm,
      color: colors.onSurfaceVariant,
      lineHeight: 21,
      marginTop: 4,
    },
    statusPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainer,
      borderColor: colors.outlineVariant,
      borderRadius: radius.full,
      borderWidth: 1,
      flexDirection: "row",
      gap: 6,
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    statusDot: {
      backgroundColor: colors.success,
      borderRadius: radius.full,
      height: 7,
      width: 7,
    },
    statusText: {
      ...typography.labelMd,
      color: colors.onSurfaceVariant,
      fontSize: 10,
    },
    sectionHeader: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.xs,
      marginTop: spacing.xs,
    },
    sectionIcon: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.md,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    sectionTitle: {
      ...typography.bodyLg,
      color: colors.onSurface,
      fontWeight: "700",
    },
    sectionDescription: {
      ...typography.bodySm,
      color: colors.outline,
      fontSize: 12,
      marginTop: 1,
    },
    section: {
      marginBottom: spacing.sm,
    },
    securityNote: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerLow,
      borderColor: colors.outlineVariant,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.xs,
      marginTop: spacing.xs,
      padding: spacing.sm,
    },
    securityText: {
      ...typography.bodySm,
      color: colors.onSurfaceVariant,
      flex: 1,
      lineHeight: 19,
    },
    logoutCard: {
      marginTop: spacing.md,
    },
    version: {
      ...typography.labelMd,
      color: colors.outline,
      marginTop: spacing.md,
      textAlign: "center",
    },
  });
