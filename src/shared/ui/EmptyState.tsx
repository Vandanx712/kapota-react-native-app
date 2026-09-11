import type { ComponentType, ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { LucideProps } from "lucide-react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface EmptyStateProps {
  icon: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconColor,
  iconBgColor,
}: EmptyStateProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconBgColor ?? colors.surfaceContainerHigh,
          },
        ]}
      >
        <Icon
          size={36}
          color={iconColor ?? colors.primary}
          strokeWidth={1.8}
        />
      </View>
      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: colors.onSurfaceVariant }]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },
  actionWrap: {
    marginTop: 20,
  },
});
