import { Search } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import logo from "@/assets/images/kapota-splash-logo.png";
import { darkColors, elevation, spacing, typography } from "@/theme/tokens";

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.brand}>Kapota</Text>
      </View>

      <View style={styles.headerActions}>
        <Pressable style={styles.iconButton}>
          <Search size={22} color={darkColors.outline} strokeWidth={2.4} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: darkColors.onSurface,
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
