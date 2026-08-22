import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={[styles.title, destructive && styles.titleDestructive]}>
            {title}
          </Text>
          <Text style={styles.message}>{message}</Text>
          {children}

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                destructive ? styles.destructiveButton : styles.confirmButton,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              <Text
                style={[
                  styles.confirmText,
                  destructive && styles.destructiveText,
                ]}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(1,15,31,0.72)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    maxWidth: 420,
    padding: spacing.md,
    width: "100%",
  },
  title: {
    ...typography.titleMd,
    color: colors.onSurface,
  },
  titleDestructive: {
    color: colors.error,
  },
  message: {
    ...typography.bodySm,
    color: colors.outline,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-end",
    marginTop: spacing.md,
  },
  button: {
    borderRadius: radius.lg,
    minWidth: 96,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cancelButton: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  confirmButton: {
    backgroundColor: colors.primaryContainer,
  },
  destructiveButton: {
    backgroundColor: "rgba(255,180,171,0.14)",
    borderColor: "rgba(255,180,171,0.35)",
    borderWidth: 1,
  },
  cancelText: {
    ...typography.bodySm,
    color: colors.onSurface,
    fontWeight: "600",
    textAlign: "center",
  },
  confirmText: {
    ...typography.bodySm,
    color: colors.onSurface,
    fontWeight: "700",
    textAlign: "center",
  },
  destructiveText: {
    color: colors.error,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  });
