import { Camera, Mic, Plus } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  darkColors,
  elevation,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";

type Props = {
  onSend?: (text: string) => void;
};

export default function ChatInputBar({ onSend }: Props) {
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setMessage("");
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
      <View style={styles.inputPill}>
        <Pressable style={styles.pillIcon} hitSlop={8}>
          <Plus size={22} color={darkColors.onSurface} strokeWidth={2.2} />
        </Pressable>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message..."
          placeholderTextColor={darkColors.outline}
          style={styles.input}
          multiline
          maxLength={1000}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <Pressable style={styles.pillIcon} hitSlop={8}>
          <Camera size={22} color={darkColors.onSurface} strokeWidth={2.2} />
        </Pressable>
      </View>

      <Pressable onPress={handleSend}>
        <LinearGradient
          colors={[darkColors.primaryContainer, "#725EFF"]}
          style={styles.micButton}
        >
          <Mic size={22} color={darkColors.onSurface} strokeWidth={2.2} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  inputPill: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
    borderColor: "rgba(255,255,255,0.06)",
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
  input: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: spacing.xs,
  },
  micButton: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 48,
    justifyContent: "center",
    width: 48,
    ...elevation.level2,
  },
});
