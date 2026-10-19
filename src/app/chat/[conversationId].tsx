import { View } from "react-native";

import ConversationScreen from "@/features/chat/screens/ConversationScreen";

export default function ChatConversationRoute() {
  return (
    <View style={{ flex: 1 }}>
      <ConversationScreen />
    </View>
  );
}
