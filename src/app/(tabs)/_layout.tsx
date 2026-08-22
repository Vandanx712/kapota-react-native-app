import { Tabs } from "expo-router";
import {
  Compass,
  MessageSquare,
  PlusCircle,
  UserRound,
} from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          ...typography.titleMd,
          fontSize: 12,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },

        tabBarStyle: {
          position: "absolute",
          left: spacing.md,
          right: spacing.md,
          bottom: spacing.md,
          height: 78,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceContainer,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused, color }) => (
            <View>
              <MessageSquare color={focused ? colors.primary : color} size={24} strokeWidth={2.4} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused, color }) => (
            <View>
              <Compass color={focused ? colors.primary : color} size={24} strokeWidth={2.4} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ focused, color }) => (
            <View>
              <PlusCircle color={focused ? colors.primary : color} size={24} strokeWidth={2.4} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <View>
              <UserRound color={focused ? colors.primary : color} size={24} strokeWidth={2.4} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
