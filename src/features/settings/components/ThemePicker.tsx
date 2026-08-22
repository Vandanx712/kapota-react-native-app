import { Check } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  CHAT_THEME_PALETTES,
  type ChatThemeName,
} from "../constants/settings.constants";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  selectedTheme: ChatThemeName;
  onSelect: (theme: ChatThemeName) => void;
};

export default function ThemePicker({ selectedTheme, onSelect }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const themes = Object.keys(CHAT_THEME_PALETTES) as ChatThemeName[];

  return (
    <View style={styles.grid}>
      {themes.map((theme) => {
        const palette = CHAT_THEME_PALETTES[theme];
        const isSelected = selectedTheme === theme;

        return (
          <Pressable
            key={theme}
            onPress={() => onSelect(theme)}
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: colors.surfaceContainer },
              isSelected && styles.itemSelected,
              isSelected && { borderColor: colors.primaryContainer },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.swatchRow}>
              <View style={[styles.swatch, { backgroundColor: palette.incoming }]} />
              <View style={[styles.swatch, { backgroundColor: palette.outgoing }]} />
              <View style={[styles.swatch, { backgroundColor: palette.accent }]} />
              <View style={[styles.swatch, { backgroundColor: palette.background }]} />
            </View>
            <Text numberOfLines={1} style={[styles.label, { color: colors.onSurfaceVariant }]}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>
            {isSelected && (
              <View style={[styles.check, { backgroundColor: colors.primaryContainer }]}>
                <Check size={12} color={colors.onPrimary} strokeWidth={3} />
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  item: {
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 72,
    padding: spacing.xs,
    position: "relative",
    width: "48%",
  },
  itemSelected: {
    backgroundColor: "rgba(140,128,255,0.10)",
  },
  swatchRow: {
    flexDirection: "row",
    gap: 3,
  },
  swatch: {
    borderRadius: 4,
    flex: 1,
    height: 28,
  },
  label: {
    ...typography.labelMd,
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
  check: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 20,
  },
  pressed: {
    opacity: 0.85,
  },
});
