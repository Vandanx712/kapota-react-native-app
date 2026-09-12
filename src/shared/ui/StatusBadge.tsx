import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface StatusBadgeProps {
  label?: string | number;
  count?: number;
  variant?: "primary" | "success" | "neutral" | "warning" | "error";
  size?: "sm" | "md";
}

export function StatusBadge({
  label,
  count,
  variant = "primary",
  size = "md",
}: StatusBadgeProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const bgColors = {
    primary: colors.primary,
    success: colors.success,
    neutral: colors.surfaceContainerHigh,
    warning: colors.highlight,
    error: colors.error,
  };

  const textColors = {
    primary: colors.onPrimary,
    success: "#042F2E",
    neutral: colors.onSurface,
    warning: "#422006",
    error: colors.onError,
  };

  const displayText = count !== undefined ? (count > 99 ? "99+" : String(count)) : label;

  if (displayText === undefined || displayText === "" || displayText === 0) {
    return null;
  }

  const isCount = count !== undefined;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColors[variant],
          paddingHorizontal: isCount ? (size === "sm" ? 5 : 7) : 8,
          height: size === "sm" ? 18 : 22,
          minWidth: isCount ? (size === "sm" ? 18 : 22) : undefined,
          borderRadius: size === "sm" ? 9 : 11,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColors[variant],
            fontSize: size === "sm" ? 10 : 12,
          },
        ]}
      >
        {displayText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "700",
  },
});
