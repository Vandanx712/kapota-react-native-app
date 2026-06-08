import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing, typography } from "@/theme/tokens";
import { toastTheme } from "@/theme/toastTheme";

type Props = {
  text1?: string;
  icon: React.ReactNode;
  type: keyof typeof toastTheme;
};

export function BaseToast({ text1, icon, type }: Props) {
  const theme = toastTheme[type];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderLeftColor: theme.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.icon}>{icon}</View>
        <Text style={styles.text}>{text1 ?? ""}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderLeftWidth: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
  },
  icon: {
    width: 24,
    alignItems: "center",
  },
  text: {
    ...typography.bodySm,
    flexShrink:1,
    color: "#FFFFFF",
    flex: 1,
  },
});