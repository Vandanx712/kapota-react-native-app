import { StyleSheet, View } from "react-native";
import { AlertCircle, Check, CheckCheck, Clock } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface MessageStatusProps {
  status?: "pending" | "sent" | "delivered" | "seen" | "failed";
  isSeen?: boolean;
  size?: number;
  color?: string;
  activeColor?: string;
}

export function MessageStatus({
  status,
  isSeen = false,
  size = 15,
  color,
  activeColor,
}: MessageStatusProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const defaultInactive = color ?? colors.outline;
  const defaultActive = activeColor ?? colors.primary;

  const effectiveStatus = status ?? (isSeen ? "seen" : "delivered");

  if (effectiveStatus === "failed") {
    return (
      <View style={styles.container}>
        <AlertCircle
          size={size}
          color={colors.error || "#EF4444"}
          strokeWidth={2.4}
        />
      </View>
    );
  }

  if (effectiveStatus === "pending") {
    return (
      <View style={styles.container}>
        <Clock size={size - 2} color={defaultInactive} strokeWidth={2} />
      </View>
    );
  }

  if (effectiveStatus === "sent") {
    return (
      <View style={styles.container}>
        <Check size={size} color={defaultInactive} strokeWidth={2.4} />
      </View>
    );
  }

  // Delivered or Seen
  const isRead = effectiveStatus === "seen" || isSeen;

  return (
    <View style={styles.container}>
      <CheckCheck
        size={size + 1}
        color={isRead ? defaultActive : defaultInactive}
        strokeWidth={2.4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },
});
