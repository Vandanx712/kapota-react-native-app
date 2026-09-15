import { useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Users } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface AvatarProps {
  uri?: string | null;
  name?: string | null;
  size?: number;
  isOnline?: boolean;
  showStatusIndicator?: boolean;
  isGroup?: boolean;
  onPress?: () => void;
  borderWidth?: number;
}

export function Avatar({
  uri,
  name = "User",
  size = 48,
  isOnline = false,
  showStatusIndicator = false,
  isGroup = false,
  onPress,
  borderWidth = 0,
}: AvatarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  const hasValidUri = Boolean(uri && failedUri !== uri);
  const statusSize = Math.max(10, Math.round(size * 0.24));
  const indicatorOffset = Math.round(size * 0.02);

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: borderWidth > 0 ? colors.outlineVariant : "transparent",
          borderWidth,
        },
      ]}
    >
      {hasValidUri ? (
        <Image
          source={{ uri: uri! }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
          recyclingKey={uri!}
          priority="high"
          onError={() => setFailedUri(uri ?? null)}
        />
      ) : isGroup ? (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surfaceContainerHighest,
            },
          ]}
        >
          <Users size={Math.round(size * 0.48)} color={colors.primary} />
        </View>
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.surfaceContainerHighest,
            },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                fontSize: Math.max(11, Math.round(size * 0.38)),
                color: colors.primary,
              },
            ]}
          >
            {initials}
          </Text>
        </View>
      )}

      {showStatusIndicator && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
              backgroundColor: isOnline ? colors.success : colors.outline,
              borderColor: colors.surface,
              bottom: indicatorOffset,
              right: indicatorOffset,
            },
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => pressed && styles.pressed}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusIndicator: {
    position: "absolute",
    borderWidth: 2,
    zIndex: 2,
  },
  pressed: {
    opacity: 0.8,
  },
});
