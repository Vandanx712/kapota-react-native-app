import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  title: string;
  value: string | number;
  description: string;
};

export default function StatCard({ title, value, description }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surfaceContainer,
      borderColor: colors.outlineVariant,
      borderRadius: radius.md,
      borderWidth: 1,
      flex: 1,
      minWidth: "46%",
      padding: spacing.sm,
    },
    title: {
      ...typography.labelMd,
      color: colors.outline,
      textTransform: "uppercase",
    },
    value: {
      ...typography.headlineLgMobile,
      color: colors.onSurface,
      marginTop: spacing.xs,
    },
    description: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 4,
    },
  });
