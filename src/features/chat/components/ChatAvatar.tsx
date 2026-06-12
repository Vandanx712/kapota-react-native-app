import { Image, StyleSheet, View } from "react-native";
import { conversation } from "../types/chat.types";
import { UsersRound } from "lucide-react-native";
import { darkColors, radius } from "@/theme/tokens";

export default function Avatar({ item }: { item: conversation }) {
  const imageUri = item.isgroup
    ? item.groupdetail?.groupIcon?.url
    : item.profilePic?.url;
  return (
    <View style={styles.avatarFrame}>
      {item.profilePic?.url ? (
        <Image
          source={{
            uri: imageUri,
          }}
          style={styles.avatarImage}
        />
      ) : (
        <UsersRound size={24} color={darkColors.onSurface} />
      )}
      {/* {item.online && <View style={styles.smallOnlineDot} />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarFrame: {
    height: 60,
    width: 60,
  },
  avatarImage: {
    backgroundColor: darkColors.surfaceContainer,
    borderRadius: 25,
    height: 60,
    width: 60,
  },
  smallOnlineDot: {
    backgroundColor: darkColors.success,
    borderColor: "#081121",
    borderRadius: radius.full,
    borderWidth: 4,
    bottom: -4,
    height: 24,
    position: "absolute",
    right: -4,
    width: 24,
  },
});
