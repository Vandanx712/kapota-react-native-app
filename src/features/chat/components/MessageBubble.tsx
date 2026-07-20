import { CheckCheck } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";

import {
  darkColors,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import type { ChatMessage } from "../types/chat.types";

type Props = {
  message: ChatMessage;
};

export default function MessageBubble({ message }: Props) {
  const isOwn = message.isOwn;

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        {message.image && (
          <Image
            source={{ uri: message.image.url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        {message.text ? (
          <Text style={[styles.text, message.image && styles.textWithImage]}>
            {message.text}
          </Text>
        ) : null}
      </View>

      <View style={[styles.meta, isOwn ? styles.metaOwn : styles.metaOther]}>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
        {isOwn && message.status === "read" && (
          <CheckCheck
            size={14}
            color={darkColors.primaryContainer}
            strokeWidth={2.4}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.xs,
    maxWidth: "82%",
  },
  rowOwn: {
    alignSelf: "flex-end",
  },
  rowOther: {
    alignSelf: "flex-start",
  },
  bubble: {
    borderRadius: radius.xl,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  bubbleOwn: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
  },
  bubbleOther: {
    backgroundColor: darkColors.primaryContainer,
  },
  image: {
    borderRadius: radius.lg,
    height: 160,
    width: 220,
  },
  text: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontSize: 15,
    lineHeight: 22,
  },
  textWithImage: {
    marginTop: spacing.xs,
  },
  meta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  metaOwn: {
    alignSelf: "flex-end",
  },
  metaOther: {
    alignSelf: "flex-end",
  },
  timestamp: {
    ...typography.bodySm,
    color: darkColors.outline,
    fontSize: 11,
  },
});
