import { ChevronRight, Pencil } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export default function SettingsProfileHeader() {
  const router = useRouter();
  const { authUser } = useAuthStore();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={() => router.push("/profile/edit")}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {authUser?.profilePic?.url ? (
        <Image source={{ uri: authUser.profilePic.url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.initial}>
            {authUser?.fullname?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
      )}

      <View style={styles.body}>
        <Text numberOfLines={1} style={styles.name}>
          {authUser?.fullname ?? "Your profile"}
        </Text>
        <Text numberOfLines={1} style={styles.bio}>
          {authUser?.bio || "Add a short bio to your profile"}
        </Text>
      </View>

      <ChevronRight size={19} color={colors.outline} strokeWidth={2.4} />
    </Pressable>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    card: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainer,
      borderColor: colors.outlineVariant,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.lg,
      padding: spacing.sm,
    },
    avatar: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.md,
      height: 72,
      width: 72,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    initial: {
      ...typography.headlineLgMobile,
      color: colors.primaryContainer,
      fontSize: 30,
      fontWeight: "800",
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontSize: 19,
      fontWeight: "800",
    },
    bio: {
      ...typography.bodySm,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    pressed: {
      opacity: 0.8,
    },
  });
