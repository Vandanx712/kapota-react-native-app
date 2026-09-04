import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
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
  const isAuthenticated = Boolean(authUser && token);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;

    void connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, isAuthenticated]);

  if (isCheckingAuth) {
    return (
      <ThemeProvider>
        <SaplahScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <RootNavigator isAuthenticated={isAuthenticated} />
    </ThemeProvider>
  );
}

function RootNavigator({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { theme } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          headerShown: false,
        }}
      >
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="chat/[conversationId]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/account"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/post"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/chats"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="settings/help"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="profile/edit"
            options={{ headerShown: false }}
          />
        </Stack.Protected>
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}
