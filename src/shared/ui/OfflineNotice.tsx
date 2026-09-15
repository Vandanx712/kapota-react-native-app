import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Network from "expo-network";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Wifi, WifiOff } from "lucide-react-native";
import { typography } from "@/theme/tokens";

export function OfflineNotice() {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    void Network.getNetworkStateAsync().then((state) => {
      const offline =
        state.isConnected === false || state.isInternetReachable === false;
      if (offline) {
        setIsOffline(true);
        translateY.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(1, { duration: 300 });
      }
    });

    const subscription = Network.addNetworkStateListener((state) => {
      const offline =
        state.isConnected === false || state.isInternetReachable === false;

      setIsOffline((prevOffline) => {
        if (offline) {
          setShowRestored(false);
          if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
          translateY.value = withTiming(0, { duration: 300 });
          opacity.value = withTiming(1, { duration: 300 });
          return true;
        }

        if (prevOffline && !offline) {
          setShowRestored(true);
          translateY.value = withTiming(0, { duration: 300 });
          opacity.value = withTiming(1, { duration: 300 });

          if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
          restoreTimerRef.current = setTimeout(() => {
            translateY.value = withTiming(-60, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 });
            setShowRestored(false);
          }, 2500);
        }
        return false;
      });
    });

    return () => {
      subscription.remove();
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    };
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!isOffline && !showRestored) {
    return null;
  }

  const isRestored = showRestored && !isOffline;

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 8) + 4 },
        isRestored ? styles.restoredBg : styles.offlineBg,
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        {isRestored ? (
          <>
            <Wifi size={15} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.text}>Back online</Text>
          </>
        ) : (
          <>
            <WifiOff size={15} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.text}>
              Offline mode — Viewing cached data
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 0,
    paddingBottom: 8,
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 9999,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  offlineBg: {
    backgroundColor: "#DC2626",
  },
  restoredBg: {
    backgroundColor: "#16A34A",
  },
  text: {
    color: "#FFFFFF",
    fontSize: typography.labelMd.fontSize,
    fontWeight: "600",
  },
});
