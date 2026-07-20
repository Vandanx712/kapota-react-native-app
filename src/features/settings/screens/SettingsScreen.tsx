import { LogOut, Settings } from "lucide-react-native";
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
import { ScreenWrapper } from "@/shared/components/ScreenWrapper";
import { darkColors, spacing, typography } from "@/theme/tokens";

export default function SettingsScreen() {
  const router = useRouter();
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
          <View style={styles.heroIcon}>
            <Settings size={28} color={darkColors.primaryContainer} />
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage account, posts, chat theme, and support in one place.
          </Text>
        </View>

        <SettingsProfileHeader />

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

        <View style={styles.logoutCard}>
          <SettingsItemRow
            icon={LogOut}
            label="Log out"
            description="Sign out from this device"
            onPress={handleLogout}
          />
        </View>

        <Text style={styles.version}>{APP_VERSION}</Text>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 140,
  },
  hero: {
    marginBottom: spacing.md,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(140,128,255,0.14)",
    borderRadius: 20,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 56,
  },
  title: {
    ...typography.headlineLgMobile,
    color: darkColors.onSurface,
  },
  subtitle: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 22,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.sm,
  },
  logoutCard: {
    marginTop: spacing.xs,
  },
  version: {
    ...typography.labelMd,
    color: darkColors.outline,
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
