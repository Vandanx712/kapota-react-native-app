import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/theme/tokens";
import { ScreenWrapper } from "./ScreenWrapper";

type Props = {
  eyebrow: string;
  title: string;
};

export function PagePlaceholder({ eyebrow, title }: Props) {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.labelMd,
    color: colors.primary,
    textTransform: "uppercase",
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
});
