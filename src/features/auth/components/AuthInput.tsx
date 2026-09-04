import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
};

export function AuthInput({
  value,
  onChangeText,
  placeholder = "Email or password",
  error = "",
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
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
        placeholderTextColor={colors.outlineVariant}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="none"
      />

      {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xs,
    position: "relative",
  },

  input: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyLg,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainer,
  },

  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },

  errorText: {
    marginVertical: 5,
    marginHorizontal: 10,
    color: "red",
  },

  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,

    // 🔥 core glow color from your splash theme
    backgroundColor: colors.primary,

    opacity: 0,

    // soft halo
    shadowColor: colors.primaryContainer,
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
