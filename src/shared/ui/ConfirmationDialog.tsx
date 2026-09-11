import type { ReactNode } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmationDialogProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>
          <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
            {message}
          </Text>

          {children && <View style={styles.childrenContainer}>{children}</View>}

          <View style={styles.buttonRow}>
            <Pressable
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.surfaceContainerHigh },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.onSurface }]}>
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: isDestructive
                    ? colors.error
                    : colors.primary,
                },
                pressed && styles.pressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={isDestructive ? colors.onError : colors.onPrimary}
                />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: isDestructive ? colors.onError : colors.onPrimary,
                      fontWeight: "700",
                    },
                  ]}
                >
                  {confirmLabel}
                </Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  childrenContainer: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },
});
