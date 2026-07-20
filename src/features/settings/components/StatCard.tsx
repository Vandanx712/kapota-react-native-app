import { StyleSheet, Text, View } from "react-native";

import { darkColors, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  title: string;
  value: string | number;
  description: string;
};

export default function StatCard({ title, value, description }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    flex: 1,
    minWidth: "46%",
    padding: spacing.sm,
  },
  title: {
    ...typography.labelMd,
    color: darkColors.outline,
    textTransform: "uppercase",
  },
  value: {
    ...typography.headlineLgMobile,
    color: darkColors.onSurface,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.bodySm,
    color: darkColors.outline,
    marginTop: 4,
  },
});
