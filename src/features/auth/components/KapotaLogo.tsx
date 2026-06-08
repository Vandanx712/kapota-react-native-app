import { useEffect } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import logoSource from "../../../../assets/images/kapota-splash-logo.png";

type Props = {
  size?: number;
};

export function KapotaLogo({ size = 216 }: Props) {
  const enter = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    enter.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });
    float.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [enter, float]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: [
      { translateY: (1 - enter.value) * 10 + float.value * -7 },
      { scale: 0.92 + enter.value * 0.08 },
    ],
  }));

  return (
    <View style={{ height: size, width: size }}>
      <Animated.View
        style={[
          styles.logoShadow,
          { height: size, width: size },
          animatedStyle,
        ]}
      >
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Kapota logo"
          resizeMode="contain"
          source={logoSource}
          style={{ height: size, width: size }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoShadow: {
    shadowColor: "#8C80FF",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: Platform.OS === "ios" ? 0.45 : 0,
    shadowRadius: 32,
    elevation: 14,
  },
});
