import { MessageCircle } from "lucide-react-native";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ChatPreview from "@/features/settings/components/ChatPreview";
import SectionShell from "@/features/settings/components/SectionShell";
import ThemePicker from "@/features/settings/components/ThemePicker";
import { useThemeStore } from "@/features/settings/store/theme.store";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

export default function ChatsSectionScreen() {
  const { chatTheme, hydrateChatTheme, setChatTheme } = useThemeStore();

  useEffect(() => {
    hydrateChatTheme();
  }, []);

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
              selectedTheme={chatTheme}
              onSelect={setChatTheme}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preview</Text>
            <Text style={styles.cardDescription}>
              A quick look at how chats feel with the current theme.
            </Text>
            <ChatPreview theme={chatTheme} />
          </View>
        </ScrollView>
      </SectionShell>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: darkColors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  cardTitle: {
    ...typography.titleMd,
    color: darkColors.onSurface,
  },
  cardDescription: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginBottom: spacing.sm,
    marginTop: 4,
  },
});
