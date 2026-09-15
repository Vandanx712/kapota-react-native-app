import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AppState, type AppStateStatus } from "react-native";
import * as Network from "expo-network";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { toastConfig } from "@/shared/components/toast/toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useChatStore } from "@/features/chat/store/chat.store";
import { useEffect } from "react";
import SplashScreen from "@/features/auth/screens/SplashScreen";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { OfflineNotice } from "@/shared/ui/OfflineNotice";
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "@/services/notifications/notificationService";

configureNotificationHandler();

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider statusBarTranslucent>
            <ThemeProvider>
              <RootApp />
              <OfflineNotice />
            </ThemeProvider>
          </KeyboardProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

function RootApp() {
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
    void registerForPushNotificationsAsync();
    void useChatStore.getState().syncPendingOutbox();
    const cleanupNotifications = setupNotificationListeners();

    const networkSubscription = Network.addNetworkStateListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        void connectSocket();
        void useChatStore.getState().getConversation();
        void useChatStore.getState().syncPendingOutbox();
      }
    });

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          void connectSocket();
          void useChatStore.getState().getConversation();
          void useChatStore.getState().syncPendingOutbox();
        }
      },
    );

    return () => {
      cleanupNotifications();
      networkSubscription.remove();
      subscription.remove();
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, isAuthenticated]);

  if (isCheckingAuth) {
    return <SplashScreen />;
  }

  return <RootNavigator isAuthenticated={isAuthenticated} />;
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
            name="settings/linked-devices"
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
            name="settings/media"
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
