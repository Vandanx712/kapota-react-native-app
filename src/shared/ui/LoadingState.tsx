import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
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
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
  },
});
