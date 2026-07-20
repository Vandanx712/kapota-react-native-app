import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { darkColors, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  icon: LucideIcon;
  label: string;
  description: string;
  onPress: () => void;
};

export default function SettingsItemRow({
  icon: Icon,
  label,
  description,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Icon size={20} color={darkColors.onSurface} strokeWidth={2.2} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>{label}</Text>
        <Text numberOfLines={1} style={styles.description}>
          {description}
        </Text>
      </View>

      <ChevronRight size={18} color={darkColors.outline} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  description: {
    ...typography.bodySm,
    color: darkColors.outline,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.85,
  },
});
