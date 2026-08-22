import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  elevation,
  radius,
  spacing,
  typography,
} from "@/theme/tokens";
import { useTheme } from "@/theme/ThemeProvider";

type Props = {
  imageUri?: string | null;
  name?: string;
  onImageChange: (uri: string) => void;
};

export default function ProfileAvatar({ imageUri, name, onImageChange }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const initial = name?.charAt(0).toUpperCase() ?? "?";

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onImageChange(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primaryContainer, colors.primary]}
        style={styles.ring}
      >
        <Pressable
          onPress={pickImage}
          style={({ pressed }) => [styles.avatarPressable, pressed && styles.pressed]}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.initial}>{initial}</Text>
            </View>
          )}

          <View style={styles.editBadge}>
            <Camera size={16} color={colors.onPrimary} strokeWidth={2.4} />
          </View>
        </Pressable>
      </LinearGradient>

      <Text style={styles.hint}>Tap to change photo</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  ring: {
    borderRadius: radius.full,
    padding: 3,
    ...elevation.level2,
  },
  avatarPressable: {
    position: "relative",
  },
  avatar: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    height: 112,
    width: 112,
  },
  avatarFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    ...typography.headlineLg,
    color: colors.onSurface,
    fontSize: 40,
    fontWeight: "700",
  },
  editBadge: {
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    borderColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 3,
    bottom: 4,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    width: 34,
    ...elevation.level1,
  },
  hint: {
    ...typography.bodySm,
    color: colors.outline,
    marginTop: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  });
