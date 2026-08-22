import { StyleSheet, Switch, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

export default function SettingSwitchRow({
  title,
  description,
  value,
  disabled = false,
  onValueChange,
}: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.surfaceContainerHighest,
          true: colors.primaryContainer,
        }}
        thumbColor={colors.onSurface}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.sm,
  },
  copy: {
    flex: 1,
  },
  title: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
  },
  description: {
    ...typography.bodySm,
    color: colors.outline,
    marginTop: 2,
  },
  });
