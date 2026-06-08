import { darkColors, spacing, typography } from "@/theme/tokens";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  onPress: () => void;
  label: string;
  loading?: boolean;
};

export function PrimaryButton({ onPress, label, loading = false }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 1200 }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.25 + pulse.value * 0.35,
      transform: [
        {
          scale: 1 + pulse.value * 0.04,
        },
      ],
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: 1 + pulse.value * 0.015,
        },
      ],
    };
  });

  return (
    <View style={styles.wrapper}>
      {/* Glow layer */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Button */}
      <Animated.View style={[buttonStyle]}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginBottom: spacing.sm,
  },

  button: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: darkColors.primary,
    zIndex: 2,
  },

  text: {
    ...typography.titleMd,
    color: darkColors.onPrimary,
  },

  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,

    backgroundColor: darkColors.primaryContainer,

    shadowColor: darkColors.primaryContainer,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 0,
    },

    elevation: 14,
  },
});
