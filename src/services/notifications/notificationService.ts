import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";

export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  try {
    await Notifications.setNotificationChannelAsync("messages", {
      description: "Incoming direct and group chat messages",
      importance: Notifications.AndroidImportance.MAX,
      lightColor: "#5B4CF0",
      name: "Chat Messages",
      showBadge: true,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync("default", {
      description: "Default notifications and system updates",
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: "#5B4CF0",
      name: "General",
      showBadge: true,
      sound: "default",
    });
  } catch (error) {
    console.warn("Failed to set up Android notification channels:", error);
  }
}

export type PushTokens = {
  expoPushToken: string | null;
  devicePushToken: string | null;
};

export async function registerForPushNotificationsAsync(): Promise<PushTokens> {
  let expoPushToken: string | null = null;
  let devicePushToken: string | null = null;

  try {
    await setupNotificationChannels();

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return { devicePushToken: null, expoPushToken: null };
    }

    // 1. Fetch native FCM / APNs device push token (for direct Firebase backend messaging)
    try {
      const deviceResult = await Notifications.getDevicePushTokenAsync();
      devicePushToken =
        typeof deviceResult.data === "string" ? deviceResult.data : null;
      if (__DEV__ && devicePushToken) {
        console.log("Native FCM/APNs Device Push Token:", devicePushToken);
      }
    } catch {
      // In simulator, emulators without Google Play, or web, native token might not be available
    }

    // 2. Fetch Expo Push Token (for Expo Push Service)
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (projectId) {
        const pushTokenResult = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        expoPushToken = pushTokenResult.data;
        if (__DEV__ && expoPushToken) {
          console.log("Expo Push Token:", expoPushToken);
        }
      }
    } catch {
      // EAS Project ID not configured yet in local environment
    }

    return { devicePushToken, expoPushToken };
  } catch (error) {
    console.warn("Error registering for push notifications:", error);
    return { devicePushToken: null, expoPushToken: null };
  }
}

export function setupNotificationListeners(): () => void {
  const foregroundSubscription =
    Notifications.addNotificationReceivedListener((notification) => {
      // Notification received while app is in foreground
      if (__DEV__) {
        console.log(
          "Foreground notification received:",
          notification.request.content.title,
        );
      }
    });

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      // User tapped or interacted with notification
      const data = response.notification.request.content.data as
        | { conversationId?: string; url?: string }
        | undefined;

      if (data?.conversationId) {
        router.push(`/chat/${data.conversationId}` as const);
      }
    });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      body,
      data,
      sound: "default",
      title,
    },
    trigger: {
      channelId: "messages",
    },
  });
}
