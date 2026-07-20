import type { LucideIcon } from "lucide-react-native";
import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { darkColors, radius, spacing, typography } from "@/theme/tokens";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

export default function SectionShell({
  icon: Icon,
  title,
  description,
  children,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon
            size={22}
            color={darkColors.primaryContainer}
            strokeWidth={2.2}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    borderBottomColor: "rgba(255,255,255,0.06)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.full,
    height: 40,
    justifyContent: "center",
    marginTop: 4,
    width: 40,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(140,128,255,0.14)",
    borderRadius: radius.lg,
    height: 52,
    justifyContent: "center",
    marginTop: 2,
    width: 52,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...typography.titleMd,
    color: darkColors.onSurface,
  },
  description: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
