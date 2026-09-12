import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ChevronRight,
  HardDrive,
  HelpCircle,
  Key,
  Laptop,
  LogOut,
  MessageCircle,
  Settings2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { AppHeader } from "@/shared/ui/AppHeader";
import { Avatar } from "@/shared/ui/Avatar";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { authUser, logout } = useAuthStore();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const SETTINGS_SECTIONS = [
    {
      id: "account",
      title: "Account",
      subtitle: "Active sessions, security, delete account",
      icon: Key,
      iconBg: colors.primary,
      onPress: () => router.push("/settings/account"),
    },
    {
      id: "linked_devices",
      title: "Linked devices",
      subtitle: "Pair with web & desktop, camera QR scanner",
      icon: Laptop,
      iconBg: colors.secondary,
      onPress: () => router.push("/settings/linked-devices"),
    },
    {
      id: "chats",
      title: "Chats",
      subtitle: "Theme and conversation preview",
      icon: MessageCircle,
      iconBg: colors.success,
      onPress: () => router.push("/settings/chats"),
    },
    {
      id: "media",
      title: "Media & Storage",
      subtitle: "Auto-download rules and cached storage",
      icon: HardDrive,
      iconBg: colors.primaryContainer,
      onPress: () => router.push("/settings/media"),
    },
    {
      id: "posts",
      title: "Posts & Community",
      subtitle: "My posts summary, post privacy controls",
      icon: Settings2,
      iconBg: colors.tertiary,
      onPress: () => router.push("/settings/post"),
    },
    {
      id: "help",
      title: "Help and feedback",
      subtitle: "Help centre, contact support, privacy",
      icon: HelpCircle,
      iconBg: colors.highlight,
      onPress: () => router.push("/settings/help"),
    },
  ];

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <AppHeader title="Settings" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          style={({ pressed }) => [
            styles.profileCard,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.outlineVariant,
            },
            pressed && { backgroundColor: colors.surfaceContainerHigh },
          ]}
        >
          <Avatar
            uri={authUser?.profilePic?.url}
            name={authUser?.fullname}
            size={60}
          />
          <View style={styles.profileText}>
            <Text
              numberOfLines={1}
              style={[styles.profileName, { color: colors.onSurface }]}
            >
              {authUser?.fullname || "User"}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.profileBio, { color: colors.onSurfaceVariant }]}
            >
              {authUser?.bio || "Available"}
            </Text>
          </View>
          <ChevronRight size={20} color={colors.outline} />
        </Pressable>

        {/* Section List */}
        <View style={styles.sectionContainer}>
          {SETTINGS_SECTIONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.itemRow,
                  { backgroundColor: colors.surface },
                  pressed && { backgroundColor: colors.surfaceContainerHigh },
                ]}
              >
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.iconBg },
                  ]}
                >
                  <Icon size={20} color="#FFFFFF" strokeWidth={2.2} />
                </View>

                <View
                  style={[
                    styles.itemTextContainer,
                    {
                      borderBottomColor: colors.outlineVariant,
                      borderBottomWidth:
                        index === SETTINGS_SECTIONS.length - 1
                          ? 0
                          : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Text
                    style={[styles.itemTitle, { color: colors.onSurface }]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.itemSubtitle,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                <ChevronRight size={18} color={colors.outline} style={styles.itemChevron} />
              </Pressable>
            );
          })}
        </View>

        {/* Log Out Row */}
        <View style={styles.logoutContainer}>
          <Pressable
            onPress={() => setLogoutModalVisible(true)}
            style={({ pressed }) => [
              styles.logoutRow,
              { backgroundColor: colors.surface },
              pressed && { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.error },
              ]}
            >
              <LogOut size={20} color={colors.onError} strokeWidth={2.2} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={[styles.logoutTitle, { color: colors.error }]}>
                Log out
              </Text>
              <Text
                style={[
                  styles.logoutSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Sign out from this device
              </Text>
            </View>
          </Pressable>
        </View>

        <Text style={[styles.versionText, { color: colors.outline }]}>
          Kapota Mobile v1.0.0
        </Text>
      </ScrollView>

      {/* Log out dialog */}
      <ConfirmationDialog
        visible={logoutModalVisible}
        title="Log out?"
        message="Are you sure you want to log out of your Kapota account on this device?"
        confirmLabel="Log out"
        isDestructive
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={async () => {
          setLogoutModalVisible(false);
          await logout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
  },
  profileBio: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: 18,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: 64,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  itemChevron: {
    marginLeft: 8,
  },
  logoutContainer: {
    marginTop: 20,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  logoutTextContainer: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  logoutSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 32,
    fontWeight: "500",
  },
});
