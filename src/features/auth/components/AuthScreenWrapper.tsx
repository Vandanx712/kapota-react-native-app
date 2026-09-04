import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import { ReactNode } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "@/assets/images/kapota-splash-logo.png";

type Props = {
  children: ReactNode;
  showHeader?: boolean;
  onHelpPress?: () => void;
};

export function AuthScreenWrapper({
  children,
  showHeader = true,
  onHelpPress,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.screen}>
      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoSection}>
              <Image
                resizeMode="contain"
                accessibilityLabel="Kapota logo"
                source={logo}
                style={styles.logo}
              />
              <Text style={styles.logoText}>Kapota</Text>
            </View>
            <TouchableOpacity style={styles.helpIcon} onPress={onHelpPress}>
              <Text style={styles.helpIconText}>?</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logo: {
    width: 30,
    height: 30,
  },
  logoText: {
    ...typography.headlineLgMobile,
    color: colors.onSecondaryContainer,
    fontWeight: "800",
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "center",
    alignItems: "center",
  },
  helpIconText: {
    ...typography.labelMd,
    color: colors.onSurface,
  },
  });
