import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { darkColors, spacing } from "@/theme/tokens";
import ChatInputBar from "@/features/chat/components/ChatInputBar";
import ConversationHeader from "@/features/chat/components/ConversationHeader";
import DateSeparator from "@/features/chat/components/DateSeparator";
import MessageBubble from "@/features/chat/components/MessageBubble";
import { mockMessages } from "@/features/chat/data/mockMessages";
import { useChatStore } from "@/features/chat/store/chat.store";
import type { ChatMessage, conversation } from "@/features/chat/types/chat.types";

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { conversations } = useChatStore();
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);

  const contact = useMemo(
    () => conversations.find((c:conversation) => c.conversationId === conversationId),
    [conversations, conversationId],
  );

  const fallbackContact = useMemo(
    () => ({
      conversationId: conversationId ?? "demo",
      name: "Julian Vance",
      profilePic: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
        key: "demo-avatar",
      },
    }),
    [conversationId],
  );

  const handleSend = (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      senderId: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      isOwn: true,
      status: "sent",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.headerArea}>
        <ConversationHeader contact={contact ?? fallbackContact} />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<DateSeparator label="Today" />}
          renderItem={({ item }) => <MessageBubble message={item} />}
        />

        <View style={styles.inputArea}>
          <ChatInputBar onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: darkColors.background,
    flex: 1,
  },
  headerArea: {
    borderBottomColor: "rgba(255,255,255,0.06)",
    borderBottomWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  body: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  inputArea: {
    paddingHorizontal: spacing.sm,
  },
});
