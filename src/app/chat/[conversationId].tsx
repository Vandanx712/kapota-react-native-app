import { SafeAreaView } from "react-native-safe-area-context";

import ConversationScreen from "@/features/chat/screens/ConversationScreen";

export default function ChatConversationRoute() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ConversationScreen />
    </SafeAreaView>
  );
}
