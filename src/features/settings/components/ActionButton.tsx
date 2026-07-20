import { Pressable, StyleSheet, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Loader } from "lucide-react-native";

import { darkColors, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "outline" | "danger" | "primary";
  fullWidth?: boolean;
};

export default function ActionButton({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  loading = false,
  variant = "outline",
  fullWidth = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <Loader size={16} color={darkColors.onSurface} />
      ) : (
        Icon && <Icon size={16} color={variant === "danger" ? darkColors.error : darkColors.onSurface} />
      )}
      <Text
        style={[
          styles.label,
          variant === "danger" && styles.dangerLabel,
          variant === "primary" && styles.primaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.full,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  outline: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
  },
  danger: {
    backgroundColor: "rgba(255,180,171,0.1)",
    borderColor: "rgba(255,180,171,0.3)",
    borderWidth: 1,
  },
  primary: {
    backgroundColor: darkColors.primaryContainer,
  },
  fullWidth: {
    width: "100%",
  },
  label: {
    ...typography.bodySm,
    color: darkColors.onSurface,
    fontWeight: "600",
  },
  dangerLabel: {
    color: darkColors.error,
  },
  primaryLabel: {
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
});
