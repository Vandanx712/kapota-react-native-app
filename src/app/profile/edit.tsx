import ProfileScreen from "@/features/profile/screens/ProfileScreen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileEditRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ProfileScreen />
    </SafeAreaView>
  );
}
