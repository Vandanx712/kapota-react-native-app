import { darkColors, spacing, typography } from "@/theme/tokens";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function AuthInput({
  value,
  onChangeText,
  placeholder = "Email or password",
}: Props) {
  const [isFocused, setIsFocused] = useState(false);

  const glow = useSharedValue(0);

  const onFocus = () => {
    setIsFocused(true);
    glow.value = withTiming(1, { duration: 220 });
  };

  const onBlur = () => {
    setIsFocused(false);
    glow.value = withTiming(0, { duration: 220 });
  };

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glow.value,
      transform: [
        {
          scale: 0.98 + glow.value * 0.02,
        },
      ],
    };
  });

  return (
    <View style={styles.wrapper}>
      {/* Glow layer */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Input */}
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused]}
        placeholder={placeholder}
        placeholderTextColor={darkColors.outlineVariant}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
    position: "relative",
  },

  input: {
    borderWidth: 1,
    borderColor: darkColors.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyLg,
    color: darkColors.onSurface,
    backgroundColor: darkColors.surfaceContainer,
  },

  inputFocused: {
    borderWidth:2,
    borderColor: darkColors.primary,
  },

  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,

    // 🔥 core glow color from your splash theme
    backgroundColor: darkColors.primary,

    opacity: 0,

    // soft halo
    shadowColor: darkColors.primaryContainer,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    // Android glow
    elevation: 12,

    transform: [{ scale: 1.02 }],
  },
});
