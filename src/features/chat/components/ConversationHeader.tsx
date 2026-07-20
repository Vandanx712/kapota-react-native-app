import {
  ChevronLeft,
  EllipsisVertical,
  Video,
} from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  darkColors,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import type { conversation } from "../types/chat.types";

type Props = {
  contact: conversation;
  isOnline?: boolean;
};

export default function ConversationHeader({ contact, isOnline = true }: Props) {
  const router = useRouter();

  const displayName = contact.isgroup
    ? contact.groupdetail?.groupname ?? contact.name
    : contact.name;

  const avatarUri = contact.isgroup
    ? contact.groupdetail?.groupIcon?.url
    : contact.profilePic?.url;

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          hitSlop={8}
        >
          <ChevronLeft
            size={24}
            color={darkColors.onSurface}
            strokeWidth={2.4}
          />
        </Pressable>

        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isOnline && !contact.isgroup && (
              <View style={styles.onlineDot} />
            )}
          </View>

          <View style={styles.nameBlock}>
            <Text numberOfLines={1} style={styles.name}>
              {displayName}
            </Text>
            {!contact.isgroup && (
              <Text style={styles.status}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Video size={22} color={darkColors.outline} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          hitSlop={8}
        >
          <EllipsisVertical
            size={22}
            color={darkColors.outline}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  leftSection: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  profileSection: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minWidth: 0,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.full,
    height: 44,
    width: 44,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  onlineDot: {
    backgroundColor: darkColors.success,
    borderColor: darkColors.background,
    borderRadius: radius.full,
    borderWidth: 2,
    bottom: 0,
    height: 12,
    position: "absolute",
    right: 0,
    width: 12,
  },
  nameBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  status: {
    ...typography.labelMd,
    color: darkColors.success,
    fontSize: 11,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  pressed: {
    opacity: 0.7,
  },
});
