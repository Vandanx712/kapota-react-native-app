import type { LucideIcon } from "lucide-react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { elevation, radius, spacing, typography } from "@/theme/tokens";

export type PopupMenuItem = {
  danger?: boolean;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

type Props = {
  items: PopupMenuItem[];
  onClose: () => void;
  visible: boolean;
};

export default function PopupMenu({ items, onClose, visible }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();

  const selectItem = (item: PopupMenuItem) => {
    onClose();
    item.onPress();
  };

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
          accessibilityLabel="Close menu"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.menu, { top: insets.top + 50 }]}>
          {items.map((item) => {
            const Icon = item.icon;
            const color = item.danger ? colors.error : colors.onSurface;
            return (
              <Pressable
                key={item.label}
                onPress={() => selectItem(item)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Icon color={color} size={19} strokeWidth={2} />
                <Text style={[styles.menuLabel, { color }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    menu: {
      backgroundColor: colors.surfaceContainerHigh,
      borderColor: colors.outlineVariant,
      borderRadius: radius.default,
      borderWidth: 1,
      minWidth: 236,
      paddingVertical: 5,
      position: "absolute",
      right: spacing.xs,
      ...elevation.level3,
    },
    menuItem: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.sm,
    },
    menuItemPressed: {
      backgroundColor: colors.surfaceContainerHighest,
    },
    menuLabel: {
      ...typography.bodyLg,
      flex: 1,
      fontSize: 15,
    },
    overlay: {
      flex: 1,
    },
  });
