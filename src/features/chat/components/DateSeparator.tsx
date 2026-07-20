import { StyleSheet, Text, View } from "react-native";

import { darkColors, spacing, typography } from "@/theme/tokens";

type Props = {
  label: string;
};

export default function DateSeparator({ label }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.bodySm,
    color: darkColors.outline,
    fontSize: 12,
  },
});
