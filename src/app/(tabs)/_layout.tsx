import { Tabs } from "expo-router";
import {
  Compass,
  MessageSquare,
  PlusCircle,
  UserRound,
} from "lucide-react-native";
import { colors, radius, spacing, typography } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 24,
          height: 72,
          borderRadius: 36,
          backgroundColor: "rgba(18,33,49,0.85)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
          marginHorizontal: 10,
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles(focused).iconcontainer}>
              <MessageSquare color={focused ? "#fff" : color} size={30} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles(focused).iconcontainer}>
              <Compass color={focused ? "#fff" : color} size={30} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles(focused).iconcontainer}>
              <PlusCircle color={focused ? "#fff" : color} size={30} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <View style={styles(focused).iconcontainer}>
              <UserRound color={focused ? "#fff" : color} size={30} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = (focused: any) =>
  StyleSheet.create({
    iconcontainer: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: focused ? "#7662F8" : "transparent",
      justifyContent: "center",
      alignItems: "center",
      transform: [{ translateY: spacing.sm }],
    },
  });
