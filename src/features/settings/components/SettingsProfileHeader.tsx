import { ChevronRight } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

export default function SettingsProfileHeader() {
  const router = useRouter();
  const { authUser } = useAuthStore();

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
        <Text numberOfLines={2} style={styles.bio}>
          {authUser?.bio || "Edit your profile details"}
        </Text>
      </View>

      <ChevronRight size={18} color={darkColors.outline} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  avatar: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.full,
    height: 64,
    width: 64,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    ...typography.headlineLgMobile,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  bio: {
    ...typography.bodySm,
    color: darkColors.outline,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.85,
  },
});
