import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ShieldCheck } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { KapotaLogo } from "@/features/auth/components/KapotaLogo";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const handleAgreeAndContinue = () => {
    router.push("/(auth)/signup");
  };

  const handleLoginRedirect = () => {
    router.push("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom", "left", "right"]}>
      {/* BRAND & LOGO SECTION */}
      <View style={styles.centerContainer}>
        <View style={styles.logoWrapper}>
          <KapotaLogo size={160} />
        </View>

        <Text style={styles.title}>Welcome to Kapota</Text>

        <Text style={styles.subtitle}>
          Simple. Reliable. Private messaging and community sharing for everyone.
        </Text>
      </View>

      {/* BOTTOM ACTIONS SECTION */}
      <View style={styles.bottomContainer}>
        <Text style={styles.legalNotice}>
          Read our{" "}
          <Text style={styles.legalLink}>Privacy Policy</Text>. Tap
          "Agree and continue" to accept the{" "}
          <Text style={styles.legalLink}>Terms of Service</Text>.
        </Text>

        <PrimaryButton
          label="Agree and continue"
          variant="primary"
          onPress={handleAgreeAndContinue}
          fullWidth
        />

        <Pressable
          onPress={handleLoginRedirect}
          style={({ pressed }) => [styles.loginLinkWrap, pressed && styles.pressed]}
        >
          <Text style={styles.loginPromptText}>
            Already have an account?{" "}
            <Text style={styles.loginHighlightText}>Log in</Text>
          </Text>
        </Pressable>

        <View style={styles.footerBrand}>
          <Text style={styles.footerBrandText}>from KAPOTA</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "space-between",
    },
    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    logoWrapper: {
      marginBottom: spacing.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...typography.headlineLgMobile,
      fontWeight: "800",
      color: colors.onSurface,
      textAlign: "center",
    },
    subtitle: {
      ...typography.bodySm,
      color: colors.outline,
      textAlign: "center",
      marginTop: spacing.xs,
      lineHeight: 22,
      maxWidth: 320,
    },
    securityPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      marginTop: spacing.lg,
    },
    securityText: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.onSurfaceVariant,
      fontWeight: "600",
    },
    bottomContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      alignItems: "center",
      gap: spacing.sm,
    },
    legalNotice: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.outline,
      textAlign: "center",
      lineHeight: 18,
      marginBottom: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    legalLink: {
      color: colors.primaryContainer,
      fontWeight: "600",
    },
    loginLinkWrap: {
      paddingVertical: spacing.xs,
      marginTop: spacing.xs,
    },
    loginPromptText: {
      ...typography.bodySm,
      color: colors.outline,
    },
    loginHighlightText: {
      color: colors.primaryContainer,
      fontWeight: "700",
    },
    footerBrand: {
      marginTop: spacing.sm,
      alignItems: "center",
    },
    footerBrandText: {
      ...typography.labelMd,
      fontSize: 10,
      color: colors.outlineVariant,
      letterSpacing: 3,
      fontWeight: "700",
    },
    pressed: {
      opacity: 0.7,
    },
  });
