import { StyleSheet, Switch, Text, View } from "react-native";

import { darkColors, radius, spacing, typography } from "@/theme/tokens";

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
          false: darkColors.surfaceContainerHighest,
          true: darkColors.primaryContainer,
        }}
        thumbColor={darkColors.onSurface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
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
    color: darkColors.onSurface,
    fontWeight: "600",
  },
  description: {
    ...typography.bodySm,
    color: darkColors.outline,
    marginTop: 2,
  },
});
