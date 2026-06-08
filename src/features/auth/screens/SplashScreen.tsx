import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import SplashBackground from "@/features/auth/components/SplashBackground";
import { KapotaLogo } from "@/features/auth/components/KapotaLogo";
import { ProgressBar } from "@/features/auth/components/ProgressBar";

const SPLASH_DURATION_MS = 4000;
const LOGO_SIZE = 216;

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <StatusBar hidden />

      <SplashBackground />

      {/* CENTER BLOCK */}
      <View style={styles.brandBlock}>
        <KapotaLogo size={LOGO_SIZE} />

        <Text style={styles.wordmark}>Kapota</Text>

        <Text style={styles.tagline}>
          COMMUNICATION IN MOTION
        </Text>
      </View>

      {/* BOTTOM BLOCK */}
      <View style={styles.loadingBlock}>
        <ProgressBar />

        <Text
          style={styles.statusText}
          className="animate-pulse"
        >
          Initializing Secure Protocol
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#051424",
  },

  brandBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  wordmark: {
    marginTop: 24,
    color: "#D8D3F2",
    fontSize: 58,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 66,
  },

  tagline: {
    marginTop: 16,
    color: "#9C96BE",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 7,
    textAlign: "center",
  },

  loadingBlock: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 80 : 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  statusText: {
    marginTop: 28,
    color: "rgba(156, 148, 181, 0.58)",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 1.4,
    lineHeight: 28,
    textAlign: "center",
  },
});