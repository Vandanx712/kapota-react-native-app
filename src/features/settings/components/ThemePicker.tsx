import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  CHAT_THEME_PALETTES,
  type ChatThemeName,
} from "../constants/settings.constants";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  selectedTheme: ChatThemeName;
  onSelect: (theme: ChatThemeName) => void;
};

export default function ThemePicker({ selectedTheme, onSelect }: Props) {
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
              isSelected && styles.itemSelected,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.swatchRow}>
              <View style={[styles.swatch, { backgroundColor: palette.incoming }]} />
              <View style={[styles.swatch, { backgroundColor: palette.outgoing }]} />
              <View style={[styles.swatch, { backgroundColor: palette.accent }]} />
              <View style={[styles.swatch, { backgroundColor: palette.background }]} />
            </View>
            <Text numberOfLines={1} style={styles.label}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Text>
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
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xs,
    width: "30%",
  },
  itemSelected: {
    backgroundColor: "rgba(140,128,255,0.12)",
    borderColor: darkColors.primaryContainer,
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
    color: darkColors.onSurfaceVariant,
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.85,
  },
});
