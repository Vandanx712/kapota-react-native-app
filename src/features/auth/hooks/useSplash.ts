import { useState, useEffect } from "react";
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const statuses = [
  "Initializing Secure\nProtocol",
  "Connecting Servers",
  "Loading Messages",
  "Synchronizing Data",
  "Ready",
];

export const useSplash = () => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });

    scale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
    });

    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      true,
    );
    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev >= statuses.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [opacity, scale, translateY]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return {
    logoStyle,
    status: statuses[statusIndex],
    progress: ((statusIndex + 1) / statuses.length) * 100,
  };
};
