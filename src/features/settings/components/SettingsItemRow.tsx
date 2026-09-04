import { ChevronRight } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  icon: LucideIcon;
  label: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
};

export default function SettingsItemRow({
  icon: Icon,
  label,
  description,
  onPress,
  danger = false,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, danger && styles.dangerIconWrap]}>
        <Icon
          size={20}
          color={danger ? colors.error : colors.primaryContainer}
          strokeWidth={2.2}
        />
      </View>

      <View style={styles.body}>
        <Text style={[styles.label, danger && styles.dangerLabel]}>{label}</Text>
        <Text numberOfLines={1} style={styles.description}>
          {description}
        </Text>
      </View>

      <ChevronRight size={18} color={colors.outline} strokeWidth={2.4} />
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    row: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainer,
      borderColor: colors.outlineVariant,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.xs,
      padding: spacing.sm,
    },
    iconWrap: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.md,
      height: 44,
      justifyContent: "center",
      width: 44,
    },
    dangerIconWrap: {
      backgroundColor: colors.errorContainer,
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    label: {
      ...typography.bodyLg,
      color: colors.onSurface,
      fontWeight: "700",
    },
    dangerLabel: {
      color: colors.error,
    },
    description: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 2,
    },
    pressed: {
      opacity: 0.76,
    },
  });
