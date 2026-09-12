import { useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  CircleHelp,
  FileText,
  HeartHandshake,
  Lock,
  Mail,
  Share2,
  ShieldCheck,
  Smartphone,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { AppHeader } from "@/shared/ui/AppHeader";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { SUPPORT_EMAIL, APP_VERSION } from "@/features/settings/constants/settings.constants";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "checkmarks",
    category: "Chats",
    question: "What do the message checkmarks mean?",
    answer:
      "• Clock icon: Message is waiting to send from your device.\n• Single checkmark: Message successfully reached the Kapota server.\n• Double checkmark: Message delivered to recipient's device.\n• Colored double checkmark: Recipient opened and read the message.",
  },
  {
    id: "themes",
    category: "Chats",
    question: "How do I switch themes and wallpapers?",
    answer:
      "Go to Settings > Chats to select from 10 vibrant themes (including Default, Ocean, Emerald, Crimson, Sunset, and Cyberpunk). You can also upload your own custom photo wallpaper.",
  },
  {
    id: "linked_devices",
    category: "Account",
    question: "How do Linked Devices & QR Login work?",
    answer:
      "You can link your web browser or desktop by navigating to Settings > Account & Linked Devices, scanning the QR code or entering the login request token. You can view all active sessions and remotely disconnect them at any time.",
  },
  {
    id: "groups",
    category: "Chats",
    question: "How do I create a group chat?",
    answer:
      "From the main Chats screen, tap the floating chat action button (or the top header menu) and select 'New Group'. Select members, name your group, set an avatar, and start communicating.",
  },
  {
    id: "posts_privacy",
    category: "Posts",
    question: "Can I hide like counts or disable sharing on my posts?",
    answer:
      "Yes! When creating a post (or anytime in Settings > Posts), you can toggle 'Hide Likes', 'Disable Share', or 'Archive Post' to remove it from the explore feed while preserving it in your personal vault.",
  },
  {
    id: "account_security",
    category: "Privacy",
    question: "How is my account data secured?",
    answer:
      "Kapota uses authenticated session tokens and device fingerprinting to protect your communication and account privacy.",
  },
];

export default function HelpSectionScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [expandedId, setExpandedId] = useState<string | null>("checkmarks");

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleEmailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Kapota Mobile Support Request`);
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: "Join me on Kapota — Fast, private, and beautifully designed communication.",
      });
      showSuccessToast("Share link created");
    } catch {
      showErrorToast("Unable to share");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <AppHeader
        title="Help & Support"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HERO SUPPORT CARD */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconWrap, { backgroundColor: `${colors.primaryContainer}20` }]}>
            <HeartHandshake size={28} color={colors.primaryContainer} />
          </View>
          <Text style={styles.heroTitle}>How can we help you today?</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions about chats, themes, accounts, and privacy.
          </Text>

          <View style={styles.heroButtonsRow}>
            <PrimaryButton
              label="Contact Support"
              icon={Mail}
              variant="primary"
              onPress={handleEmailSupport}
            />
            <PrimaryButton
              label="Share App"
              icon={Share2}
              variant="tonal"
              onPress={handleShareApp}
            />
          </View>
        </View>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.secondary}20` }]}>
              <CircleHelp size={18} color={colors.secondary} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <Text style={styles.sectionSubtitle}>
                Tap any question to view instructions and details.
              </Text>
            </View>
          </View>

          <View style={styles.faqList}>
            {FAQ_ITEMS.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <View key={item.id} style={styles.faqCard}>
                  <Pressable
                    onPress={() => toggleExpand(item.id)}
                    style={({ pressed }) => [styles.faqHeader, pressed && styles.pressed]}
                  >
                    <View style={styles.faqCategoryPill}>
                      <Text style={styles.faqCategoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={colors.primaryContainer} />
                    ) : (
                      <ChevronDown size={20} color={colors.outline} />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.faqAnswerBox}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* SECURITY & PRIVACY CARD */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.accent}20` }]}>
              <ShieldCheck size={18} color={colors.accent} />
            </View>
            <View style={styles.sectionTitleBlock}>
              <Text style={styles.sectionTitle}>Privacy & Terms</Text>
              <Text style={styles.sectionSubtitle}>
                Your account privacy and settings are under your personal control.
              </Text>
            </View>
          </View>

          <View style={styles.cardBox}>
            <View style={styles.infoRow}>
              <Lock size={16} color={colors.primaryContainer} />
              <Text style={styles.infoText}>
                Messages, chats, and private media transmissions are strictly scoped to authenticated user sessions.
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Smartphone size={16} color={colors.secondary} />
              <Text style={styles.infoText}>
                Manage active device sessions anytime in Account & Linked Devices.
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <FileText size={16} color={colors.outline} />
              <Text style={styles.infoText}>
                Questions about data retention or account closure? Contact us directly at {SUPPORT_EMAIL}.
              </Text>
            </View>
          </View>
        </View>

        {/* APP VERSION FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Kapota Communication System</Text>
          <Text style={styles.footerVersion}>
            Version {APP_VERSION} (Expo SDK 56) • Modern WhatsApp Design System
          </Text>
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
    heroCard: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.lg,
      alignItems: "center",
      marginTop: spacing.md,
    },
    heroIconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    heroTitle: {
      ...typography.headlineLgMobile,
      fontWeight: "800",
      color: colors.onSurface,
      textAlign: "center",
    },
    heroSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      textAlign: "center",
      marginTop: spacing.xs,
      lineHeight: 20,
      maxWidth: 320,
    },
    heroButtonsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.md,
      width: "100%",
      justifyContent: "center",
    },
    section: {
      marginTop: spacing.xl,
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
      fontSize: 12,
      color: colors.outline,
      marginTop: 2,
    },
    faqList: {
      gap: spacing.xs,
    },
    faqCard: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      gap: spacing.sm,
    },
    faqCategoryPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh,
    },
    faqCategoryText: {
      ...typography.labelMd,
      color: colors.primaryContainer,
      fontWeight: "700",
      fontSize: 10,
    },
    faqQuestion: {
      ...typography.bodySm,
      color: colors.onSurface,
      fontWeight: "600",
      flex: 1,
      lineHeight: 20,
    },
    faqAnswerBox: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerHigh,
    },
    faqAnswerText: {
      ...typography.bodySm,
      color: colors.outline,
      lineHeight: 22,
    },
    cardBox: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    infoText: {
      ...typography.bodySm,
      fontSize: 13,
      color: colors.outline,
      flex: 1,
      lineHeight: 19,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: spacing.xs,
    },
    footer: {
      alignItems: "center",
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    footerBrand: {
      ...typography.labelMd,
      color: colors.onSurface,
      fontWeight: "700",
    },
    footerVersion: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.outline,
      marginTop: 4,
      textAlign: "center",
    },
    pressed: {
      opacity: 0.8,
    },
  });
