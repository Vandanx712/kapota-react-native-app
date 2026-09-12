import type { ReactNode } from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { Avatar } from "./Avatar";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  avatarUri?: string | null;
  avatarName?: string | null;
  isOnline?: boolean;
  showAvatar?: boolean;
  onAvatarPress?: () => void;
  onBackPress?: () => void;
  showBack?: boolean;
  rightActions?: ReactNode;
  borderBottom?: boolean;
  onTitlePress?: () => void;
}

export function AppHeader({
  title,
  subtitle,
  avatarUri,
  avatarName,
  isOnline = false,
  showAvatar = false,
  onAvatarPress,
  onBackPress,
  showBack = false,
  rightActions,
  borderBottom = true,
  onTitlePress,
}: AppHeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant,
          borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <View style={styles.leftContainer}>
        {showBack && (
          <Pressable
            hitSlop={10}
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <ArrowLeft size={24} color={colors.onSurface} strokeWidth={2.2} />
          </Pressable>
        )}

        {showAvatar && (
          <Pressable
            onPress={onAvatarPress ?? onTitlePress}
            style={styles.avatarWrap}
          >
            <Avatar
              uri={avatarUri}
              name={avatarName ?? title}
              size={38}
              isOnline={isOnline}
              showStatusIndicator={isOnline}
            />
          </Pressable>
        )}

        <Pressable
          onPress={onTitlePress}
          disabled={!onTitlePress}
          style={styles.titleContainer}
        >
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.onSurface }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                {
                  color:
                    subtitle.toLowerCase().includes("online") ||
                    subtitle.toLowerCase().includes("typing")
                      ? colors.success
                      : colors.onSurfaceVariant,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </Pressable>
      </View>

      {rightActions ? (
        <View style={styles.rightContainer}>{rightActions}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: Platform.OS === "ios" ? 54 : 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    zIndex: 10,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrap: {
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  pressed: {
    opacity: 0.65,
  },
});
