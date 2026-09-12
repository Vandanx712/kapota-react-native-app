import { StyleSheet, Text, View, Pressable } from "react-native";
import { AlertCircle, RotateCcw } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please check your connection and try again.",
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.container,
        fullScreen && {
          flex: 1,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceContainerHigh },
        ]}
      >
        <AlertCircle size={36} color={colors.error} strokeWidth={1.8} />
      </View>
      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
        {message}
      </Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: colors.surfaceContainerHigh },
            pressed && styles.pressed,
          ]}
        >
          <RotateCcw size={16} color={colors.primary} strokeWidth={2.2} />
          <Text style={[styles.retryText, { color: colors.primary }]}>
            Try again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 20,
    marginTop: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
