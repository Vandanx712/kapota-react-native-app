import { Camera, Mic, Plus, Send } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  onSend: (text: string) => Promise<boolean>;
  onTypingChange?: (isTyping: boolean) => void;
};

export default function ChatInputBar({
  onSend,
  onTypingChange,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();
  const isTypingRef = useRef(false);
  const onTypingChangeRef = useRef(onTypingChange);
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTypingChangeRef.current = onTypingChange;
  }, [onTypingChange]);

  const stopTyping = () => {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
      stopTypingTimerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChangeRef.current?.(false);
    }
  };

  useEffect(
    () => () => {
      if (stopTypingTimerRef.current) {
        clearTimeout(stopTypingTimerRef.current);
      }
      if (isTypingRef.current) {
        onTypingChangeRef.current?.(false);
      }
    },
    [],
  );

  const handleChangeText = (value: string) => {
    setMessage(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChangeRef.current?.(true);
    }
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }
    stopTypingTimerRef.current = setTimeout(stopTyping, 1200);
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    const didSend = await onSend(trimmed);
    setIsSending(false);
    if (didSend) {
      setMessage("");
      stopTyping();
    }
  };

  const hasMessage = Boolean(message.trim());

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, spacing.xs) },
      ]}
    >
      <View style={styles.inputPill}>
        <Pressable
          accessibilityLabel="Add attachment"
          hitSlop={8}
          style={styles.pillIcon}
        >
          <Plus size={22} color={colors.onSurface} strokeWidth={2.2} />
        </Pressable>

        <TextInput
          maxLength={1000}
          multiline
          onBlur={stopTyping}
          onChangeText={handleChangeText}
          placeholder="Message..."
          placeholderTextColor={colors.outline}
          style={styles.input}
          value={message}
        />

        <Pressable
          accessibilityLabel="Open camera"
          hitSlop={8}
          style={styles.pillIcon}
        >
          <Camera size={22} color={colors.onSurface} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Pressable
        accessibilityLabel={
          hasMessage ? "Send message" : "Record voice message"
        }
        disabled={!hasMessage || isSending}
        onPress={() => void handleSend()}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <LinearGradient
          colors={[colors.primaryContainer, colors.primary]}
          style={styles.actionButton}
        >
          {hasMessage ? (
            <Send size={21} color={colors.onPrimary} strokeWidth={2.2} />
          ) : (
            <Mic size={22} color={colors.onPrimary} strokeWidth={2.2} />
          )}
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    actionButton: {
      alignItems: "center",
      borderRadius: radius.full,
      height: 48,
      justifyContent: "center",
      width: 48,
      ...elevation.level2,
    },
    container: {
      alignItems: "flex-end",
      flexDirection: "row",
      gap: spacing.xs,
      paddingTop: spacing.xs,
    },
    input: {
      ...typography.bodyLg,
      color: colors.onSurface,
      flex: 1,
      fontSize: 15,
      maxHeight: 100,
      paddingVertical: spacing.xs,
    },
    inputPill: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainerHigh,
      borderColor: colors.outlineVariant,
      borderRadius: radius.full,
      borderWidth: 1,
      flex: 1,
      flexDirection: "row",
      minHeight: 48,
      paddingHorizontal: spacing.xs,
    },
    pillIcon: {
      alignItems: "center",
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    pressed: {
      opacity: 0.72,
    },
  });
