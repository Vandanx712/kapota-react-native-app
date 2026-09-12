import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing } from "@/theme/tokens";
import { EmojiPickerModal } from "@/shared/ui/EmojiPickerModal";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

type Props = {
  onClose: () => void;
  onSelect: (emoji: string) => void;
  visible: boolean;
};

export default function ReactionPicker({ onClose, onSelect, visible }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleSelectQuick = (emoji: string) => {
    onSelect(emoji);
    onClose();
  };

  const handleSelectFull = (emoji: string) => {
    setShowFullPicker(false);
    onSelect(emoji);
    onClose();
  };

  const handleCloseAll = () => {
    setShowFullPicker(false);
    onClose();
  };

  return (
    <>
      <Modal
        animationType="fade"
        onRequestClose={handleCloseAll}
        statusBarTranslucent
        transparent
        visible={visible && !showFullPicker}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityLabel="Close reactions"
            onPress={handleCloseAll}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.picker}>
            {QUICK_REACTIONS.map((emoji) => (
              <Pressable
                accessibilityLabel={`React with ${emoji}`}
                key={emoji}
                onPress={() => handleSelectQuick(emoji)}
                style={({ pressed }) => [
                  styles.emojiButton,
                  pressed && styles.emojiPressed,
                ]}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}

            {/* Separator */}
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.outlineVariant },
              ]}
            />

            {/* More / Add Emoji Button */}
            <Pressable
              accessibilityLabel="Choose other emoji reaction"
              onPress={() => setShowFullPicker(true)}
              style={({ pressed }) => [
                styles.emojiButton,
                styles.plusButton,
                { backgroundColor: colors.surfaceContainerHighest },
                pressed && styles.emojiPressed,
              ]}
            >
              <Plus size={20} color={colors.onSurface} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>
      </Modal>

      <EmojiPickerModal
        closeOnSelect
        onClose={handleCloseAll}
        onSelectEmoji={handleSelectFull}
        title="React with Emoji"
        visible={visible && showFullPicker}
      />
    </>
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
      transform: [{ scale: 1.15 }],
    },
    overlay: {
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.35)",
      flex: 1,
      justifyContent: "center",
    },
    picker: {
      alignItems: "center",
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
    plusButton: {
      height: 36,
      marginLeft: 2,
      width: 36,
    },
    separator: {
      height: 24,
      marginHorizontal: 4,
      width: 1,
    },
  });
