import { MessageCircle } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatPreview from "@/features/settings/components/ChatPreview";
import SectionShell from "@/features/settings/components/SectionShell";
import ThemePicker from "@/features/settings/components/ThemePicker";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

export default function ChatsSectionScreen() {
  const { theme, setTheme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <SectionShell
        icon={MessageCircle}
        title="Chats"
        description="Theme, wallpaper, chat settings"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Theme</Text>
            <Text style={styles.cardDescription}>
              Choose a theme for your chat interface.
            </Text>
            <ThemePicker
              selectedTheme={theme.name}
              onSelect={setTheme}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preview</Text>
            <Text style={styles.cardDescription}>
              A quick look at how chats feel with the current theme.
            </Text>
            <ChatPreview theme={theme.name} />
          </View>
        </ScrollView>
      </SectionShell>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  cardTitle: {
    ...typography.titleMd,
    color: colors.onSurface,
  },
  cardDescription: {
    ...typography.bodySm,
    color: colors.outline,
    lineHeight: 20,
    marginBottom: spacing.sm,
    marginTop: 4,
  },
  });
