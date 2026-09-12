import { useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import {
  Laptop,
  MoreVertical,
  PlusCircle,
  Search,
  Settings,
  Users,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/theme/ThemeProvider";
import { ActionSheet } from "@/shared/ui/ActionSheet";

export interface HeaderProps {
  onSearchPress: () => void;
  onNewGroupPress?: () => void;
}

export default function Header({ onSearchPress, onNewGroupPress }: HeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [menuOpen, setMenuOpen] = useState(false);

  const menuOptions = [
    {
      id: "new_group",
      label: "New group",
      icon: Users,
      onPress: () => {
        if (onNewGroupPress) onNewGroupPress();
      },
    },
    {
      id: "linked_devices",
      label: "Linked devices",
      icon: Laptop,
      onPress: () => {
        router.push("/settings/linked-devices");
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      onPress: () => {
        router.push("/settings");
      },
    },
  ];

  return (
    <>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Text style={[styles.brandTitle, { color: colors.primary }]}>
          Kapota
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            hitSlop={8}
            onPress={onSearchPress}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            accessibilityLabel="Search"
          >
            <Search size={22} color={colors.onSurface} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            hitSlop={8}
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            accessibilityLabel="More options"
          >
            <MoreVertical size={22} color={colors.onSurface} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      <ActionSheet
        visible={menuOpen}
        options={menuOptions}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
