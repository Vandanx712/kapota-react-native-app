import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { darkColors, spacing, typography } from "@/theme/tokens";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
};

export default function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  error = "",
  autoCapitalize = "words",
  keyboardType = "default",
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

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.98 + glow.value * 0.02 }],
  }));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrapper}>
        <Animated.View style={[styles.glow, glowStyle]} />
        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={darkColors.outlineVariant}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
        />
      </View>

      {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelMd,
    color: darkColors.outline,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    ...typography.bodyLg,
    backgroundColor: darkColors.surfaceContainer,
    borderColor: darkColors.outlineVariant,
    borderRadius: 16,
    borderWidth: 1,
    color: darkColors.onSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputFocused: {
    borderColor: darkColors.primary,
    borderWidth: 2,
  },
  errorText: {
    color: darkColors.error,
    marginHorizontal: spacing.xs,
    marginTop: 4,
    ...typography.bodySm,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: darkColors.primary,
    borderRadius: 16,
    elevation: 12,
    opacity: 0,
    shadowColor: darkColors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    transform: [{ scale: 1.02 }],
  },
});
