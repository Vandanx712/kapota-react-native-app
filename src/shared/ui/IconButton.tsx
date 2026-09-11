import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface IconButtonProps {
  icon: ComponentType<LucideProps>;
  onPress?: () => void;
  size?: number;
  buttonSize?: number;
  color?: string;
  backgroundColor?: string;
  badge?: number | string;
  disabled?: boolean;
  variant?: "ghost" | "tonal" | "filled" | "surface";
  accessibilityLabel?: string;
}

export function IconButton({
  icon: Icon,
  onPress,
  size = 22,
  buttonSize = 40,
  color,
  backgroundColor,
  badge,
  disabled = false,
  variant = "ghost",
  accessibilityLabel,
}: IconButtonProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const defaultBg = {
    ghost: "transparent",
    tonal: colors.surfaceContainerHigh,
    filled: colors.primary,
    surface: colors.surfaceContainer,
  }[variant];

  const defaultColor = {
    ghost: colors.onSurface,
    tonal: colors.onSurface,
    filled: colors.onPrimary,
    surface: colors.onSurface,
  }[variant];

  const activeBg = backgroundColor ?? defaultBg;
  const activeColor = color ?? defaultColor;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: activeBg,
          opacity: disabled ? 0.4 : pressed ? 0.72 : 1,
        },
      ]}
    >
      <Icon size={size} color={activeColor} strokeWidth={2} />
      {badge !== undefined && badge !== 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.badgeText, { color: colors.onPrimary }]}>
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
});
