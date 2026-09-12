import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={styles.container}>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View style={styles.actionWrap}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 2,
  },
  actionWrap: {
    marginLeft: 8,
  },
});
