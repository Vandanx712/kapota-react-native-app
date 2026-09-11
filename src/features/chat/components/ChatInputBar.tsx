import { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  Send,
  Smile,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import type { ChatMessage } from "../types/chat.types";
import { ActionSheet } from "@/shared/ui/ActionSheet";
import { EmojiPickerModal } from "@/shared/ui/EmojiPickerModal";
import { showErrorToast } from "@/utils/toast";
import { uriToDataUri } from "@/utils/imageUtils";

export interface ChatInputBarProps {
  onSend: (data: {
    text?: string;
    image?: string;
    imageUri?: string;
    replyTo?: string;
  }) => Promise<boolean>;
  onTypingChange?: (isTyping: boolean) => void;
  replyMessage?: ChatMessage | null;
  onCancelReply?: () => void;
}

export default function ChatInputBar({
  onSend,
  onTypingChange,
  replyMessage,
  onCancelReply,
}: ChatInputBarProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();

  const [message, setMessage] = useState("");
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [attachmentSheetVisible, setAttachmentSheetVisible] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  const handleSelectEmoji = (emoji: string) => {
    handleChangeText(message + emoji);
  };

  const isTypingRef = useRef(false);
  const onTypingChangeRef = useRef(onTypingChange);
  const stopTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTypingChangeRef.current = onTypingChange;
  }, [onTypingChange]);

  const stopTyping = () => {
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
      stopTypingTimerRef.current = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChangeRef.current?.(false);
    }
  };

  useEffect(
    () => () => {
      if (stopTypingTimerRef.current) {
        clearTimeout(stopTypingTimerRef.current);
      }
      if (isTypingRef.current) {
        onTypingChangeRef.current?.(false);
      }
    },
    [],
  );

  const handleChangeText = (value: string) => {
    setMessage(value);
    if (!value.trim()) {
      stopTyping();
      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChangeRef.current?.(true);
    }
    if (stopTypingTimerRef.current) {
      clearTimeout(stopTypingTimerRef.current);
    }
    stopTypingTimerRef.current = setTimeout(stopTyping, 1200);
  };

  const pickImage = async (fromCamera = false) => {
    try {
      let result;
      if (fromCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          showErrorToast("Camera permission required");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setPickedImageUri(result.assets[0].uri);
      }
    } catch {
      showErrorToast("Unable to pick image");
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed && !pickedImageUri) return;
    if (isSending) return;

    setIsSending(true);

    let imageBase64: string | undefined;
    if (pickedImageUri) {
      try {
        imageBase64 = await uriToDataUri(pickedImageUri, "image/jpeg");
      } catch (err) {
        console.warn("Failed to encode image on-demand:", err);
      }
    }

    const didSend = await onSend({
      text: trimmed || undefined,
      image: imageBase64,
      imageUri: pickedImageUri || undefined,
      replyTo: replyMessage?._id,
    });
    setIsSending(false);

    if (didSend) {
      setMessage("");
      setPickedImageUri(null);
      stopTyping();
      if (onCancelReply) onCancelReply();
    }
  };

  const hasContent = Boolean(message.trim() || pickedImageUri);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {/* Quoted reply preview bar */}
      {replyMessage && (
        <View
          style={[
            styles.replyBar,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderLeftColor: colors.primary,
            },
          ]}
        >
          <View style={styles.replyContent}>
            <Text style={[styles.replyAuthor, { color: colors.primary }]}>
              Replying to message
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.replySnippet, { color: colors.onSurfaceVariant }]}
            >
              {replyMessage.text || (replyMessage.image ? "Photo" : "Message")}
            </Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={onCancelReply}
            style={styles.cancelReplyBtn}
          >
            <X size={18} color={colors.onSurfaceVariant} strokeWidth={2.4} />
          </Pressable>
        </View>
      )}

      {/* Selected photo preview bar */}
      {pickedImageUri && (
        <View
          style={[
            styles.imagePreviewBar,
            { backgroundColor: colors.surfaceContainerHigh },
          ]}
        >
          <Image source={{ uri: pickedImageUri }} style={styles.imageThumb} />
          <Text style={[styles.imageLabel, { color: colors.onSurfaceVariant }]}>
            Photo attached
          </Text>
          <Pressable
            hitSlop={8}
            onPress={() => {
              setPickedImageUri(null);
            }}
            style={styles.cancelReplyBtn}
          >
            <X size={18} color={colors.onSurfaceVariant} strokeWidth={2.4} />
          </Pressable>
        </View>
      )}

      {/* Main input controls */}
      <View style={styles.inputRow}>
        <View
          style={[
            styles.inputPill,
            {
              backgroundColor: colors.surfaceContainerHigh,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Pressable
            hitSlop={8}
            onPress={() => setAttachmentSheetVisible(true)}
            style={styles.pillIconBtn}
          >
            <Plus size={22} color={colors.onSurfaceVariant} strokeWidth={2.4} />
          </Pressable>

          <TextInput
            multiline
            maxLength={1000}
            onBlur={stopTyping}
            onChangeText={handleChangeText}
            placeholder="Message"
            placeholderTextColor={colors.outline}
            style={[styles.input, { color: colors.onSurface }]}
            value={message}
          />

          <Pressable
            accessibilityLabel="Choose emoji"
            hitSlop={8}
            onPress={() => setEmojiPickerVisible(true)}
            style={styles.pillIconBtn}
          >
            <Smile size={21} color={colors.onSurfaceVariant} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            accessibilityLabel="Take photo"
            hitSlop={8}
            onPress={() => pickImage(true)}
            style={styles.pillIconBtn}
          >
            <Camera size={21} color={colors.onSurfaceVariant} strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Send / Mic button */}
        <Pressable
          disabled={!hasContent || isSending}
          onPress={() => void handleSend()}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: colors.primary,
              opacity: !hasContent ? 0.65 : pressed ? 0.8 : 1,
            },
          ]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Send size={19} color={colors.onPrimary} strokeWidth={2.4} />
          )}
        </Pressable>
      </View>

      {/* Attachment Action Sheet */}
      <ActionSheet
        visible={attachmentSheetVisible}
        title="Share"
        options={[
          {
            id: "gallery",
            label: "Photos & Videos",
            icon: ImageIcon,
            onPress: () => pickImage(false),
          },
          {
            id: "camera",
            label: "Camera",
            icon: Camera,
            onPress: () => pickImage(true),
          },
        ]}
        onClose={() => setAttachmentSheetVisible(false)}
      />

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onSelectEmoji={handleSelectEmoji}
        title="Emojis"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "700",
  },
  replySnippet: {
    fontSize: 13,
    marginTop: 2,
  },
  cancelReplyBtn: {
    padding: 4,
    marginLeft: 8,
  },
  imagePreviewBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  imageThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  imageLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  inputPill: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  pillIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
