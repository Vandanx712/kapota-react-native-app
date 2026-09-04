import { Send } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import {
  CHAT_THEME_PALETTES,
  PREVIEW_MESSAGES,
  type ChatThemeName,
} from "../constants/settings.constants";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";

type Props = {
  theme: ChatThemeName;
};

export default function ChatPreview({ theme }: Props) {
  const { theme: appTheme } = useTheme();
  const colors = appTheme.colors;
  const styles = createStyles(colors);
  const palette = CHAT_THEME_PALETTES[theme];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.header, { backgroundColor: palette.outgoing }]}>
        <View style={[styles.avatar, { backgroundColor: palette.incoming }]}>
          <Text style={styles.avatarText}>J</Text>
        </View>
        <View>
          <Text style={[styles.name, { color: palette.accent }]}>John Doe</Text>
          <Text style={[styles.status, { color: palette.accent, opacity: 0.7 }]}>
            Online
          </Text>
        </View>
      </View>

      <View style={styles.messages}>
        {PREVIEW_MESSAGES.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              message.isSent ? styles.sentRow : styles.receivedRow,
            ]}
          >
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor: message.isSent
                    ? palette.incoming
                    : palette.outgoing,
                },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: message.isSent ? colors.onSurface : palette.accent },
                ]}
              >
                {message.content}
              </Text>
              <Text style={[styles.time, { opacity: 0.65 }]}>
                12:00 PM
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.inputBar, { backgroundColor: palette.outgoing }]}>
        <View style={[styles.input, { backgroundColor: palette.background }]}>
          <Text style={[styles.inputText, { color: palette.accent, opacity: 0.6 }]}>
            This is a preview
          </Text>
        </View>
        <View style={[styles.sendButton, { backgroundColor: palette.incoming }]}>
          <Send size={14} color={colors.onSurface} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  container: {
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.06)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  avatar: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  avatarText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
  },
  name: {
    ...typography.bodySm,
    fontWeight: "700",
  },
  status: {
    ...typography.labelMd,
    fontSize: 10,
  },
  messages: {
    gap: spacing.xs,
    padding: spacing.sm,
  },
  messageRow: {
    flexDirection: "row",
  },
  sentRow: {
    justifyContent: "flex-end",
  },
  receivedRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    borderRadius: radius.lg,
    maxWidth: "82%",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  messageText: {
    ...typography.bodySm,
    lineHeight: 18,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  inputBar: {
    alignItems: "center",
    borderTopColor: "rgba(255,255,255,0.06)",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.sm,
  },
  input: {
    borderRadius: radius.full,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
  },
  inputText: {
    ...typography.bodySm,
  },
  sendButton: {
    alignItems: "center",
    borderRadius: radius.full,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  });
