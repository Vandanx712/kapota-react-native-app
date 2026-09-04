import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";

type Props = {
  label: string;
};

export default function DateSeparator({ label }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.bodySm,
    color: colors.outline,
    fontSize: 12,
  },
  });
