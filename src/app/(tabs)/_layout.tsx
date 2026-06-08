import { Tabs } from "expo-router";

import { colors, radius, spacing, typography } from "@/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarLabelStyle: {
          ...typography.labelMd,
        },
        tabBarStyle: {
          position: "absolute",
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
          height: 64,
          borderTopWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderRadius: radius.xl,
          backgroundColor: "rgba(18, 33, 49, 0.9)",
        },
      }}
    >
      <Tabs.Screen name="chat" options={{ title: "Chats" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
