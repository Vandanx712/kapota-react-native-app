import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Check,
  CheckCheck,
  Palette,
  Sparkles,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { themeNames, themePalettes, radius, spacing, typography } from "@/theme/tokens";
import { AppHeader } from "@/shared/ui/AppHeader";

export default function ChatsSectionScreen() {
  const { theme, setTheme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppHeader
        title="Chats"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* SECTION: THEMES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primaryContainer}20` }]}>
              <Palette size={18} color={colors.primaryContainer} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Appearance & Theme</Text>
              <Text style={styles.sectionSubtitle}>
                Choose from 10 curated color schemes designed for day and night.
              </Text>
            </View>
          </View>

          <View style={styles.themesGrid}>
            {themeNames.map((name) => {
              const palette = themePalettes[name];
              const isSelected = theme.name === name;

              return (
                <Pressable
                  key={name}
                  onPress={() => setTheme(name)}
                  style={({ pressed }) => [
                    styles.themeCard,
                    isSelected && styles.themeCardSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  {/* Theme swatch row */}
                  <View style={[styles.themeSwatchContainer, { backgroundColor: palette.background }]}>
                    <View style={[styles.miniIncomingBubble, { backgroundColor: palette.surfaceContainerHigh }]}>
                      <View style={[styles.miniBubbleDot, { backgroundColor: palette.primary }]} />
                    </View>
                    <View style={[styles.miniOutgoingBubble, { backgroundColor: palette.primaryContainer }]}>
                      <View style={[styles.miniBubbleLine, { backgroundColor: palette.onPrimary }]} />
                    </View>
                  </View>

                  <View style={styles.themeCardBottom}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.themeCardName,
                        isSelected && { color: colors.primaryContainer, fontWeight: "700" },
                      ]}
                    >
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectedCheckBadge, { backgroundColor: colors.primaryContainer }]}>
                        <Check size={11} color={colors.onPrimary} strokeWidth={3} />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* SECTION: LIVE CHAT PREVIEW */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.secondary}20` }]}>
              <Sparkles size={18} color={colors.secondary} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Chat Experience Preview</Text>
              <Text style={styles.sectionSubtitle}>
                Active theme: <Text style={{ color: colors.primaryContainer, fontWeight: "700" }}>{theme.name}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.previewBox}>
            <View style={styles.previewDatePill}>
              <Text style={styles.previewDateText}>Today</Text>
            </View>

            {/* Incoming Message Bubble */}
            <View style={styles.previewBubbleIncoming}>
              <Text style={styles.previewIncomingSender}>Alex Chen</Text>
              <Text style={styles.previewIncomingText}>
                Hey! How do you like the new WhatsApp interface for Kapota? 🚀
              </Text>
              <View style={styles.previewMeta}>
                <Text style={styles.previewTime}>10:42 AM</Text>
              </View>
            </View>

            {/* Outgoing Message Bubble */}
            <View style={styles.previewBubbleOutgoing}>
              <Text style={styles.previewOutgoingText}>
                It feels fast, responsive, and completely native! Loving the themes! ✨
              </Text>
              <View style={styles.previewMetaOutgoing}>
                <Text style={styles.previewTimeOutgoing}>10:43 AM</Text>
                <CheckCheck size={14} color={colors.secondary} strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xl,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    sectionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitleBlock: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontWeight: "700",
    },
    sectionSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 2,
    },
    themesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    themeCard: {
      width: "48.5%",
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
    },
    themeCardSelected: {
      borderColor: colors.primaryContainer,
      backgroundColor: `${colors.primaryContainer}12`,
    },
    themeSwatchContainer: {
      height: 64,
      padding: spacing.xs,
      justifyContent: "space-between",
    },
    miniIncomingBubble: {
      alignSelf: "flex-start",
      width: "55%",
      height: 20,
      borderRadius: radius.sm,
      padding: 4,
      justifyContent: "center",
    },
    miniBubbleDot: {
      width: 14,
      height: 6,
      borderRadius: radius.full,
    },
    miniOutgoingBubble: {
      alignSelf: "flex-end",
      width: "60%",
      height: 22,
      borderRadius: radius.sm,
      padding: 4,
      justifyContent: "center",
    },
    miniBubbleLine: {
      width: 22,
      height: 6,
      borderRadius: radius.full,
    },
    themeCardBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    themeCardName: {
      ...typography.labelMd,
      color: colors.onSurface,
      fontSize: 13,
    },
    selectedCheckBadge: {
      width: 18,
      height: 18,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    previewBox: {
      backgroundColor: colors.background,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
      minHeight: 180,
      overflow: "hidden",
      position: "relative",
    },
    previewDatePill: {
      alignSelf: "center",
      backgroundColor: colors.surfaceContainerHigh,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.full,
      marginBottom: spacing.md,
    },
    previewDateText: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.outline,
      fontWeight: "600",
    },
    previewBubbleIncoming: {
      alignSelf: "flex-start",
      maxWidth: "80%",
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.lg,
      borderTopLeftRadius: 2,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
    },
    previewIncomingSender: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.primary,
      fontWeight: "700",
      marginBottom: 2,
    },
    previewIncomingText: {
      ...typography.bodySm,
      color: colors.onSurface,
      lineHeight: 19,
    },
    previewMeta: {
      alignSelf: "flex-end",
      marginTop: 2,
    },
    previewTime: {
      ...typography.labelMd,
      fontSize: 10,
      color: colors.outline,
    },
    previewBubbleOutgoing: {
      alignSelf: "flex-end",
      maxWidth: "82%",
      backgroundColor: colors.primaryContainer,
      borderRadius: radius.lg,
      borderTopRightRadius: 2,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    previewOutgoingText: {
      ...typography.bodySm,
      color: colors.onPrimary,
      lineHeight: 19,
    },
    previewMetaOutgoing: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-end",
      gap: 4,
      marginTop: 2,
    },
    previewTimeOutgoing: {
      ...typography.labelMd,
      fontSize: 10,
      color: `${colors.onPrimary}99`,
    },
    pressed: {
      opacity: 0.8,
    },
  });
