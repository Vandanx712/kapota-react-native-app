import { Tabs } from "expo-router";
import {
  Compass,
  MessageSquare,
  PlusCircle,
  UserRound,
} from "lucide-react-native";

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
          height: 76,
          borderTopWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderRadius: radius.xl,
          backgroundColor: "rgba(18, 33, 49, 0.9)",
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size }) => (
            <MessageSquare color={color} size={size + 3} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size + 3} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ color, size }) => (
            <PlusCircle color={color} size={size + 4} strokeWidth={2.4} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size + 3} strokeWidth={2.4} />
          ),
        }}
      />
    </Tabs>
  );
}
