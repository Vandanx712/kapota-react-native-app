import * as Linking from "expo-linking";
import {
  CircleHelp,
  Lock,
  MessageCircle,
  Send,
} from "lucide-react-native";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ActionButton from "@/features/settings/components/ActionButton";
import SectionShell from "@/features/settings/components/SectionShell";
import {
  HELP_TOPICS,
  SUPPORT_EMAIL,
} from "@/features/settings/constants/settings.constants";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

export default function HelpSectionScreen() {
  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Kapota support`);
  };

  const handleCopySupportEmail = async () => {
    try {
      await Share.share({ message: SUPPORT_EMAIL });
      showSuccessToast("Support email shared");
    } catch {
      showErrorToast("Unable to share support email");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <SectionShell
        icon={CircleHelp}
        title="Help and feedback"
        description="Help centre, contact us, privacy policy"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>We are here to help</Text>
            <Text style={styles.heroText}>
              Find quick guidance for common parts of Kapota, contact support,
              and share feedback that helps us improve the app.
            </Text>
            <View style={styles.heroActions}>
              <ActionButton
                label="Email support"
                icon={Send}
                variant="primary"
                onPress={handleEmailSupport}
                fullWidth
              />
              <ActionButton
                label="Copy support email"
                icon={CircleHelp}
                onPress={handleCopySupportEmail}
                fullWidth
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <CircleHelp size={20} color={darkColors.primaryContainer} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>Help centre</Text>
                <Text style={styles.cardDescription}>
                  Start with the most common areas users usually need help with.
                </Text>
              </View>
            </View>

            {HELP_TOPICS.map((topic) => (
              <View key={topic.title} style={styles.topicCard}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicDescription}>{topic.description}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, styles.secondaryIcon]}>
                <MessageCircle size={20} color={darkColors.secondary} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>Feedback and support</Text>
                <Text style={styles.cardDescription}>
                  Report bugs, request features, or send product feedback with a
                  little context so we can help faster.
                </Text>
              </View>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>
                Best things to include in your message
              </Text>
              <Text style={styles.tipItem}>- What you were trying to do</Text>
              <Text style={styles.tipItem}>- What happened instead</Text>
              <Text style={styles.tipItem}>
                - Device, OS version, and screenshots if available
              </Text>
            </View>

            <ActionButton
              label="Send feedback"
              icon={Send}
              onPress={handleEmailSupport}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, styles.accentIcon]}>
                <Lock size={20} color={darkColors.accent} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>Privacy policy</Text>
                <Text style={styles.cardDescription}>
                  A quick summary of the areas people usually look for before
                  reaching out.
                </Text>
              </View>
            </View>

            <View style={styles.privacyGrid}>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Account data</Text>
                <Text style={styles.privacyText}>
                  Profile information like name, bio, email, and profile photo.
                </Text>
              </View>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Chats and media</Text>
                <Text style={styles.privacyText}>
                  Messages, shared images, and conversation details inside the
                  app.
                </Text>
              </View>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Posts and activity</Text>
                <Text style={styles.privacyText}>
                  Posts, likes, shares, and related explore activity tied to
                  your account.
                </Text>
              </View>
            </View>

            <View style={styles.emailNote}>
              <Text style={styles.emailNoteText}>
                Need the full privacy details? Reach us at {SUPPORT_EMAIL}.
              </Text>
            </View>
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
  heroCard: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  heroTitle: {
    ...typography.titleMd,
    color: darkColors.onSurface,
  },
  heroText: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  heroActions: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(140,128,255,0.14)",
    borderRadius: radius.lg,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  secondaryIcon: {
    backgroundColor: "rgba(206,189,255,0.12)",
  },
  accentIcon: {
    backgroundColor: "rgba(255,122,144,0.12)",
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
  },
  cardDescription: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginTop: 4,
  },
  topicCard: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
    padding: spacing.sm,
  },
  topicTitle: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "600",
  },
  topicDescription: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginTop: 4,
  },
  tipBox: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.xl,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  tipTitle: {
    ...typography.bodySm,
    color: darkColors.onSurface,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  tipItem: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
  },
  privacyGrid: {
    gap: spacing.xs,
  },
  privacyItem: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  privacyTitle: {
    ...typography.bodySm,
    color: darkColors.onSurface,
    fontWeight: "600",
  },
  privacyText: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginTop: 4,
  },
  emailNote: {
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.lg,
    borderStyle: "dashed",
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  emailNoteText: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
  },
});
