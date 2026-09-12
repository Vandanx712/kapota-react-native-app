import type { ComponentType } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { LucideProps } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "tonal" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ComponentType<LucideProps>;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
}: PrimaryButtonProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const bgColors = {
    primary: colors.primary,
    secondary: colors.surfaceContainerHighest,
    danger: colors.error,
    tonal: colors.surfaceContainerHigh,
    outline: "transparent",
  };

  const textColors = {
    primary: colors.onPrimary,
    secondary: colors.onSurface,
    danger: colors.onError,
    tonal: colors.primary,
    outline: colors.primary,
  };

  const heights = {
    sm: 38,
    md: 48,
    lg: 54,
  };

  const fontSizes = {
    sm: 13,
    md: 15,
    lg: 16,
  };

  const borderColors = {
    primary: "transparent",
    secondary: "transparent",
    danger: "transparent",
    tonal: "transparent",
    outline: colors.primary,
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bgColors[variant],
          borderColor: borderColors[variant],
          borderWidth: variant === "outline" ? 1.5 : 0,
          height: heights[size],
          borderRadius: heights[size] / 2,
          opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <View style={styles.contentRow}>
          {Icon && iconPosition === "left" && (
            <Icon size={size === "sm" ? 16 : 18} color={textColors[variant]} />
          )}
          <Text
            style={[
              styles.text,
              {
                color: textColors[variant],
                fontSize: fontSizes[size],
              },
            ]}
          >
            {label}
          </Text>
          {Icon && iconPosition === "right" && (
            <Icon size={size === "sm" ? 16 : 18} color={textColors[variant]} />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
