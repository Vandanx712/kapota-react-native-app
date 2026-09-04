import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { isAxiosError } from "axios";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  clearChat,
  deleteConversation,
  deleteMessage,
  searchMessages,
  updateConBgimage,
  updateMessage,
} from "@/features/chat/api/chatApi";
import {
  ChatInfoModal,
  DeleteMessagesModal,
  MessageInfoModal,
} from "@/features/chat/components/ChatModals";
import ChatInputBar from "@/features/chat/components/ChatInputBar";
import ConversationHeader, {
  ConversationSearchHeader,
  SelectionHeader,
} from "@/features/chat/components/ConversationHeader";
import MessageBubble from "@/features/chat/components/MessageBubble";
import ReactionPicker from "@/features/chat/components/ReactionPicker";
import { useChatStore } from "@/features/chat/store/chat.store";
import type {
  ChatMessage,
  MediaAsset,
} from "@/features/chat/types/chat.types";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from "@/utils/toast";

const DELETE_FOR_EVERYONE_WINDOW_MS = 15 * 60 * 1000;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};

export default function ConversationScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const didInitialScrollRef = useRef(false);
  const searchRequestRef = useRef(0);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [chatInfoVisible, setChatInfoVisible] = useState(false);
  const [deleteEligibilityTime, setDeleteEligibilityTime] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [messageInfoVisible, setMessageInfoVisible] = useState(false);
  const [reactionMessage, setReactionMessage] =
    useState<ChatMessage | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const socket = useAuthStore((state) => state.socket);
  const clearSelectedConversation = useChatStore(
    (state) => state.clearSelectedConversation,
  );
  const conversations = useChatStore((state) => state.conversations);
  const getConversation = useChatStore((state) => state.getConversation);
  const getMessages = useChatStore((state) => state.getMessages);
  const hasMoreMessages = useChatStore((state) => state.hasMoreMessages);
  const isConversationLoading = useChatStore(
    (state) => state.isConversationLoading,
  );
  const isMessageLoading = useChatStore(
    (state) => state.isMessageLoading,
  );
  const isMoreMessagesLoading = useChatStore(
    (state) => state.isMoreMessagesLoading,
  );
  const loadOlderMessages = useChatStore(
    (state) => state.loadOlderMessages,
  );
  const messageError = useChatStore((state) => state.messageError);
  const messages = useChatStore((state) => state.messages);
  const selectedConversation = useChatStore(
    (state) => state.selectedConversation,
  );
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setClearChat = useChatStore((state) => state.setClearChat);
  const setConBgimage = useChatStore((state) => state.setConBgimage);
  const setDeletedMessage = useChatStore(
    (state) => state.setDeletedMessage,
  );
  const setDeletedMessageForSlider = useChatStore(
    (state) => state.setDeletedMessageForSlider,
  );
  const setIsTyping = useChatStore((state) => state.setIsTyping);
  const setReactedMsg = useChatStore((state) => state.setReactedMsg);
  const setSelectedConversation = useChatStore(
    (state) => state.setSelectedConversation,
  );
  const setStopTyping = useChatStore((state) => state.setStopTyping);
  const typing = useChatStore((state) => state.typing);

  const contact = useMemo(
    () =>
      selectedConversation?.conversationId === conversationId
        ? selectedConversation
        : conversations.find(
            (conversation) =>
              conversation.conversationId === conversationId,
          ),
    [conversationId, conversations, selectedConversation],
  );
  const contactId = contact?.conversationId;

  useEffect(() => {
    if (!contact && conversations.length === 0) {
      void getConversation();
    }
  }, [contact, conversations.length, getConversation]);

  useEffect(() => {
    if (!contactId || !conversationId) return;
    const store = useChatStore.getState();
    const currentContact =
      store.selectedConversation?.conversationId === contactId
        ? store.selectedConversation
        : store.conversations.find(
            (conversation) => conversation.conversationId === contactId,
          );
    if (!currentContact) return;

    didInitialScrollRef.current = false;
    setSelectedConversation(currentContact);
    void getMessages(conversationId);

    return () => {
      setStopTyping(currentContact);
      clearSelectedConversation(conversationId);
    };
  }, [
    clearSelectedConversation,
    contactId,
    conversationId,
    getMessages,
    setSelectedConversation,
    setStopTyping,
  ]);

  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    [],
  );

  const onlineUserSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);
  const isOnline = contact?.isgroup
    ? Object.keys(contact.groupdetail?.membersDetail ?? {}).some(
        (id) => id !== authUser?._id && onlineUserSet.has(id),
      )
    : Boolean(contact?.oruserId && onlineUserSet.has(contact.oruserId));
  const currentMember = authUser?._id
    ? contact?.groupdetail?.membersDetail?.[authUser._id]
    : undefined;
  const isGroupAdmin = currentMember?.role?.toLowerCase() === "admin";
  const canManageChat = !contact?.isgroup || isGroupAdmin;
  const displayedMessages =
    isSearchMode && searchQuery.trim() ? searchResults : messages;
  const selectionSource = useMemo(() => {
    const byId = new Map<string, ChatMessage>();
    [...messages, ...searchResults].forEach((message) =>
      byId.set(message._id, message),
    );
    return byId;
  }, [messages, searchResults]);
  const selectedMessages = selectedMessageIds
    .map((id) => selectionSource.get(id))
    .filter((message): message is ChatMessage => Boolean(message));
  const isSelectionMode = selectedMessageIds.length > 0;
  const canDeleteForEveryone =
    selectedMessages.length > 0 &&
    selectedMessages.every((message) => {
      const createdAt = message.createdAt
        ? new Date(message.createdAt).getTime()
        : Number.NaN;
      const age = deleteEligibilityTime - createdAt;
      const recipientHasSeen =
        Boolean(message.isSeen) ||
        Boolean(
          message.seenBy?.some((userId) => userId !== message.sender),
        );
      return (
        message.sender === authUser?._id &&
        Number.isFinite(createdAt) &&
        age >= 0 &&
        age < DELETE_FOR_EVERYONE_WINDOW_MS &&
        !recipientHasSeen
      );
    });

  const handleSend = async (text: string) => {
    const didSend = await sendMessage({ text });
    if (didSend) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    }
    return didSend;
  };

  const handleTypingChange = (isTyping: boolean) => {
    if (!contact) return;
    if (isTyping) setIsTyping(contact);
    else setStopTyping(contact);
  };

  const closeSearch = () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchRequestRef.current += 1;
    setIsSearchMode(false);
    setSearchLoading(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchText = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const query = value.trim();
    const requestId = ++searchRequestRef.current;

    if (!query || !conversationId) {
      setSearchLoading(false);
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const response = await searchMessages(conversationId, {
          limit: 25,
          q: query,
        });
        if (requestId === searchRequestRef.current) {
          setSearchResults(response.messages ?? []);
        }
      } catch (error) {
        if (requestId === searchRequestRef.current) {
          setSearchResults([]);
          showErrorToast(getErrorMessage(error, "Search failed"));
        }
      } finally {
        if (requestId === searchRequestRef.current) setSearchLoading(false);
      }
    }, 300);
  };

  const toggleMessageSelection = (message: ChatMessage) => {
    setSelectedMessageIds((current) =>
      current.includes(message._id)
        ? current.filter((id) => id !== message._id)
        : [...current, message._id],
    );
  };

  const handleMessageLongPress = (message: ChatMessage) => {
    setSelectedMessageIds((current) =>
      current.includes(message._id) ? current : [...current, message._id],
    );
    if (!message.deletedForEveryone) setReactionMessage(message);
  };

  const handleReaction = async (emoji: string) => {
    if (!reactionMessage || !contact) return;
    const previousReaction = reactionMessage.reacted ?? null;
    const nextReaction = previousReaction === emoji ? "" : emoji;
    const optimisticMessage = {
      ...reactionMessage,
      reacted: nextReaction || null,
    };

    setReactedMsg(optimisticMessage);
    setSearchResults((current) =>
      current.map((message) =>
        message._id === reactionMessage._id ? optimisticMessage : message,
      ),
    );
    setReactionMessage(null);
    setSelectedMessageIds([]);

    try {
      await updateMessage(reactionMessage._id, {
        conversationId: contact.conversationId,
        emoji: nextReaction,
        text: "",
      });
    } catch (error) {
      const reverted = { ...reactionMessage, reacted: previousReaction };
      setReactedMsg(reverted);
      showErrorToast(getErrorMessage(error, "Unable to add reaction"));
    }
  };

  const deleteSelectedMessages = async (
    deleteType: "deleteForEveryone" | "deleteForMe",
  ) => {
    if (!contact || selectedMessages.length === 0) return;

    try {
      await Promise.all(
        selectedMessages.map((message) =>
          deleteMessage(message._id, {
            conversationId: contact.conversationId,
            deleteType,
          }),
        ),
      );

      selectedMessages.forEach((message) => {
        const updatedMessage: ChatMessage =
          deleteType === "deleteForEveryone"
            ? { ...message, deletedForEveryone: true }
            : {
                ...message,
                deletedFor: authUser?._id
                  ? [...new Set([...(message.deletedFor ?? []), authUser._id])]
                  : message.deletedFor,
              };
        setDeletedMessage(updatedMessage);
        if (deleteType === "deleteForEveryone") {
          setDeletedMessageForSlider(updatedMessage);
        }
      });

      setSearchResults((current) =>
        deleteType === "deleteForMe"
          ? current.filter(
              (message) => !selectedMessageIds.includes(message._id),
            )
          : current.map((message) =>
              selectedMessageIds.includes(message._id)
                ? {
                    ...message,
                    deletedForEveryone: true,
                    text:
                      message.sender === authUser?._id
                        ? "You deleted this message"
                        : "This message was deleted",
                  }
                : message,
            ),
      );
      setDeleteModalVisible(false);
      setSelectedMessageIds([]);
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to delete message"));
    }
  };

  const copySelectedMessages = async () => {
    const text = selectedMessages
      .map((message) => message.text?.trim())
      .filter(Boolean)
      .join("\n");
    if (!text) {
      showInfoToast("No text to copy");
      return;
    }
    await Clipboard.setStringAsync(text);
    setSelectedMessageIds([]);
    showSuccessToast("Copied");
  };

  const clearCurrentChat = async () => {
    if (!contact) return;
    try {
      const response = await clearChat(contact.conversationId);
      setClearChat({ conversationId: contact.conversationId });
      showSuccessToast(response?.message ?? "Chat cleared");
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to clear chat"));
    }
  };

  const confirmClearChat = () => {
    Alert.alert(
      "Clear chat?",
      "Messages will be removed from this conversation on your device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          onPress: () => void clearCurrentChat(),
          style: "destructive",
          text: "Clear Chat",
        },
      ],
    );
  };

  const removeCurrentChat = async () => {
    if (!contact) return;
    try {
      const response = await deleteConversation(contact.conversationId);
      useChatStore
        .getState()
        .refreshGroupMember("DELETE_CONVERSATION", contact);
      showSuccessToast(response?.message ?? "Chat deleted");
      router.back();
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to delete chat"));
    }
  };

  const confirmDeleteChat = () => {
    Alert.alert(
      "Delete chat?",
      "This conversation will be removed from your chat list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          onPress: () => void removeCurrentChat(),
          style: "destructive",
          text: "Delete Chat",
        },
      ],
    );
  };

  const pickChatBackground = async () => {
    if (!contact) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 5],
      base64: true,
      mediaTypes: ["images"],
      quality: 0.78,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset?.base64) return;

    try {
      const image = `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`;
      const response = (await updateConBgimage({
        id: contact.conversationId,
        image,
        oldkey: contact.bgImage?.key ?? "",
      })) as { bgimage?: MediaAsset; message?: string };
      if (response.bgimage) {
        setConBgimage(contact.conversationId, response.bgimage);
        socket?.emit("changeBgimage", {
          bgImage: response.bgimage,
          conversation: contact,
        });
      }
      showSuccessToast(response.message ?? "Chat background updated");
    } catch (error) {
      showErrorToast(getErrorMessage(error, "Unable to update background"));
    }
  };

  if (!contact) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          {isConversationLoading ? (
            <ActivityIndicator color={colors.primaryContainer} size="large" />
          ) : (
            <>
              <Text style={styles.stateText}>Conversation unavailable</Text>
              <Pressable
                onPress={() => void getConversation()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.headerArea}>
        {isSelectionMode ? (
          <SelectionHeader
            onBack={() => setSelectedMessageIds([])}
            onCopy={() => void copySelectedMessages()}
            onDelete={() => {
              setDeleteEligibilityTime(Date.now());
              setDeleteModalVisible(true);
            }}
            onMessageInfo={() => setMessageInfoVisible(true)}
            selectedCount={selectedMessageIds.length}
          />
        ) : isSearchMode ? (
          <ConversationSearchHeader
            isLoading={searchLoading}
            onBack={closeSearch}
            onChangeText={handleSearchText}
            query={searchQuery}
          />
        ) : (
          <ConversationHeader
            canManageChat={canManageChat}
            contact={contact}
            isMuted={isMuted}
            isOnline={isOnline}
            onClearChat={confirmClearChat}
            onDeleteChat={confirmDeleteChat}
            onInfo={() => setChatInfoVisible(true)}
            onMuteChat={() => {
              setIsMuted((current) => !current);
              showSuccessToast(isMuted ? "Chat unmuted" : "Chat muted");
            }}
            onSearch={() => setIsSearchMode(true)}
            onSetBackground={() => void pickChatBackground()}
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
        style={styles.body}
      >
        <ImageBackground
          imageStyle={styles.wallpaperImage}
          resizeMode="cover"
          source={
            contact.bgImage?.url ? { uri: contact.bgImage.url } : undefined
          }
          style={styles.wallpaper}
        >
          {isMessageLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator
                color={colors.primaryContainer}
                size="large"
              />
            </View>
          ) : (
            <FlatList
              contentContainerStyle={[
                styles.messageListContent,
                displayedMessages.length === 0 && styles.emptyMessageContent,
              ]}
              data={displayedMessages}
              extraData={selectedMessageIds}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <View style={styles.centerState}>
                  <Text style={styles.stateText}>
                    {isSearchMode && searchQuery.trim()
                      ? searchLoading
                        ? "Searching..."
                        : "No messages found"
                      : messageError
                        ? "Messages unavailable"
                        : "Start the conversation"}
                  </Text>
                  {!!messageError && !isSearchMode && (
                    <Pressable
                      onPress={() => void getMessages(conversationId)}
                      style={styles.retryButton}
                    >
                      <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                  )}
                </View>
              }
              ListHeaderComponent={
                !isSearchMode && hasMoreMessages ? (
                  <Pressable
                    disabled={isMoreMessagesLoading}
                    onPress={() => void loadOlderMessages()}
                    style={styles.loadOlderButton}
                  >
                    {isMoreMessagesLoading ? (
                      <ActivityIndicator
                        color={colors.primaryContainer}
                        size="small"
                      />
                    ) : (
                      <Text style={styles.loadOlderText}>
                        Load older messages
                      </Text>
                    )}
                  </Pressable>
                ) : null
              }
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              onContentSizeChange={() => {
                if (
                  !isSearchMode &&
                  !didInitialScrollRef.current &&
                  messages.length > 0
                ) {
                  listRef.current?.scrollToEnd({ animated: false });
                  didInitialScrollRef.current = true;
                }
              }}
              ref={listRef}
              renderItem={({ item }) => (
                <MessageBubble
                  conversation={contact}
                  currentUserId={authUser?._id}
                  isSelected={selectedMessageIds.includes(item._id)}
                  message={item}
                  onLongPress={handleMessageLongPress}
                  onPress={toggleMessageSelection}
                  selectionMode={isSelectionMode}
                />
              )}
              showsVerticalScrollIndicator={false}
              style={styles.messageList}
            />
          )}

          {typing?.receiverId === conversationId &&
            typing.userId !== authUser?._id &&
            !isSelectionMode &&
            !isSearchMode && (
              <Text style={styles.typingText}>typing...</Text>
            )}
        </ImageBackground>

        {!isSelectionMode && !isSearchMode && (
          <View style={styles.inputArea}>
            <ChatInputBar
              onSend={handleSend}
              onTypingChange={handleTypingChange}
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <ReactionPicker
        onClose={() => setReactionMessage(null)}
        onSelect={(emoji) => void handleReaction(emoji)}
        visible={Boolean(reactionMessage)}
      />
      <DeleteMessagesModal
        canDeleteForEveryone={canDeleteForEveryone}
        messageCount={selectedMessages.length}
        onClose={() => setDeleteModalVisible(false)}
        onDeleteForEveryone={() =>
          void deleteSelectedMessages("deleteForEveryone")
        }
        onDeleteForMe={() => void deleteSelectedMessages("deleteForMe")}
        visible={deleteModalVisible}
      />
      <MessageInfoModal
        conversation={contact}
        currentUserId={authUser?._id}
        messages={selectedMessages}
        onClose={() => setMessageInfoVisible(false)}
        visible={messageInfoVisible}
      />
      <ChatInfoModal
        conversation={contact}
        onClose={() => setChatInfoVisible(false)}
        visible={chatInfoVisible}
      />
    </SafeAreaView>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    body: {
      flex: 1,
    },
    centerState: {
      alignItems: "center",
      flex: 1,
      gap: spacing.sm,
      justifyContent: "center",
    },
    emptyMessageContent: {
      flexGrow: 1,
    },
    headerArea: {
      borderBottomColor: colors.outlineVariant,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    inputArea: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.xs,
    },
    loadOlderButton: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: colors.surfaceContainerHighest,
      borderRadius: radius.full,
      minHeight: 34,
      justifyContent: "center",
      marginVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    loadOlderText: {
      ...typography.bodySm,
      color: colors.primaryContainer,
      fontSize: 12,
      fontWeight: "700",
    },
    messageList: {
      flex: 1,
    },
    messageListContent: {
      paddingBottom: spacing.xs,
      paddingTop: 6,
    },
    retryButton: {
      borderColor: colors.primaryContainer,
      borderRadius: radius.default,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    retryText: {
      ...typography.bodySm,
      color: colors.primaryContainer,
      fontWeight: "700",
    },
    screen: {
      backgroundColor: colors.background,
      flex: 1,
    },
    stateText: {
      ...typography.bodySm,
      color: colors.outline,
    },
    typingText: {
      ...typography.bodySm,
      color: colors.primaryContainer,
      paddingBottom: 3,
      paddingHorizontal: spacing.sm,
    },
    wallpaper: {
      backgroundColor: colors.background,
      flex: 1,
    },
    wallpaperImage: {
      opacity: 0.78,
    },
  });
