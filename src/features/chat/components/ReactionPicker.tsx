import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing } from "@/theme/tokens";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

type Props = {
  onClose: () => void;
  onSelect: (emoji: string) => void;
  visible: boolean;
};

export default function ReactionPicker({ onClose, onSelect, visible }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close reactions"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.picker}>
          {reactions.map((emoji) => (
            <Pressable
              accessibilityLabel={`React with ${emoji}`}
              key={emoji}
              onPress={() => onSelect(emoji)}
              style={({ pressed }) => [
                styles.emojiButton,
                pressed && styles.emojiPressed,
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    emoji: {
      fontSize: 26,
      lineHeight: 34,
    },
    emojiButton: {
      alignItems: "center",
      borderRadius: radius.full,
      height: 42,
      justifyContent: "center",
      width: 42,
    },
    emojiPressed: {
      backgroundColor: colors.surfaceContainerHighest,
      transform: [{ scale: 1.08 }],
    },
    overlay: {
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.18)",
      flex: 1,
      justifyContent: "center",
    },
    picker: {
      backgroundColor: colors.surfaceContainerHigh,
      borderColor: colors.outlineVariant,
      borderRadius: radius.full,
      borderWidth: 1,
      flexDirection: "row",
      gap: 2,
      paddingHorizontal: spacing.xs,
      paddingVertical: 5,
      ...elevation.level3,
    },
  });
