import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";
import { UsersRound } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { conversation } from "../types/chat.types";

export default function Avatar({
  item,
  isOnline,
}: {
  item: conversation;
  isOnline: boolean;
}) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const imageUri = item.isgroup
    ? item.groupdetail?.groupIcon?.url
    : item.profilePic?.url;
  const displayName = item.isgroup
    ? (item.groupdetail?.groupname ?? item.name)
    : item.name;

  return (
    <View style={styles.avatarFrame}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.avatarImage} />
      ) : item.isgroup ? (
        <View style={[styles.avatarImage, styles.avatarFallback]}>
          <UsersRound size={24} color={colors.onSurface} />
        </View>
      ) : (
        <View style={[styles.avatarImage, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      {isOnline && <View style={styles.smallOnlineDot} />}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    avatarFrame: {
      height: 60,
      width: 60,
    },
    avatarImage: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: 25,
      height: 60,
      width: 60,
    },
    avatarFallback: {
      alignItems: "center",
      justifyContent: "center",
    },
    avatarInitial: {
      color: colors.onSurface,
      fontSize: 20,
      fontWeight: "800",
    },
    smallOnlineDot: {
      backgroundColor: colors.success,
      borderColor: colors.background,
      borderRadius: radius.full,
      borderWidth: 4,
      bottom: -4,
      height: 24,
      position: "absolute",
      right: -4,
      width: 24,
    },
  });
