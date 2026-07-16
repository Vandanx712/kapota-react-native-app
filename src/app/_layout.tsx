import { Stack } from "expo-router";
import { colors } from "@/theme/tokens";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { toastConfig } from "@/shared/components/toast/toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useEffect } from "react";
import SaplahScreen from "@/features/auth/screens/SplashScreen";

export default function RootLayout() {
  const {
    checkAuth,
    authUser,
    token,
    isCheckingAuth,
    connectSocket,
    disconnectSocket,
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [authUser]);

  if (isCheckingAuth) {
    return <SaplahScreen />;
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        {authUser ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
