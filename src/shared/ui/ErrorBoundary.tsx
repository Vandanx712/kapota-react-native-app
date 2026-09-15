import React, { Component, type ErrorInfo, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an unhandled exception:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const colors = darkColors;

      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.content}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceContainerHighest }]}>
              <AlertTriangle size={36} color={colors.error} />
            </View>

            <Text style={[styles.title, { color: colors.onSurface }]}>
              Something went wrong
            </Text>

            <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
              An unexpected error occurred. You can try reloading this screen or restarting the application.
            </Text>

            {__DEV__ && this.state.error?.message && (
              <ScrollView style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {this.state.error.message}
                </Text>
              </ScrollView>
            )}

            <Pressable
              onPress={this.handleReset}
              style={({ pressed }) => [
                styles.retryButton,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <RefreshCw size={18} color={colors.onPrimary} />
              <Text style={[styles.retryButtonText, { color: colors.onPrimary }]}>
                Try Again
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  content: {
    alignItems: "center",
    maxWidth: 380,
    width: "100%",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    ...typography.titleMd,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.bodySm,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  errorBox: {
    maxHeight: 120,
    width: "100%",
    backgroundColor: "rgba(255, 100, 100, 0.1)",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#FF8080",
    fontSize: 12,
    fontFamily: "monospace",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minWidth: 160,
  },
  retryButtonText: {
    ...typography.labelMd,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
