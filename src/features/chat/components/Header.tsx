import { Search, Settings } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import logo from "@/assets/images/kapota-splash-logo.png";
import { useTheme } from "@/theme/ThemeProvider";
import { elevation, spacing, typography } from "@/theme/tokens";
import { router } from "expo-router";

type Props = {
  onSearchPress: () => void;
};

export default function Header({ onSearchPress }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.brand}>Kapota</Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel="Search conversations"
          hitSlop={8}
          onPress={onSearchPress}
          style={styles.iconButton}
        >
          <Search size={22} color={colors.outline} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityLabel="Search conversations"
          hitSlop={8}
          onPress={()=> router.push("/settings/index")}
          style={styles.iconButton}
        >
          <Settings size={22} color={colors.outline} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  logo: {
    height: 42,
    width: 42,
    ...elevation.level2,
  },
  brand: {
    ...typography.headlineLg,
    color: colors.onSurface,
    fontSize: spacing.md,
    fontWeight: "800",
    lineHeight: 45,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  iconButton: {
    alignItems: "center",
    height: 25,
    justifyContent: "center",
    width: 25,
  },
});
