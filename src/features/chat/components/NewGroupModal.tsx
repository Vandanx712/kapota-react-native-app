import { useState, useMemo, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import {
  ArrowLeft,
  Camera,
  Check,
  Search,
  Smile,
  Users,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createGroup } from "../api/chatApi";
import type { ChatUser, Conversation } from "../types/chat.types";
import { Avatar } from "@/shared/ui/Avatar";
import { EmojiPickerModal } from "@/shared/ui/EmojiPickerModal";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { uriToDataUri } from "@/utils/imageUtils";

export interface NewGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated: (conversation: Conversation) => void;
}

export function NewGroupModal({
  visible,
  onClose,
  onGroupCreated,
}: NewGroupModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const authUser = useAuthStore((state) => state.authUser);

  const users = useChatStore((state) => state.users);
  const getSurroundingUsers = useChatStore((state) => state.getSurroundingUsers);
  const isUsersLoading = useChatStore((state) => state.isUsersLoading);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupIconPreview, setGroupIconPreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      void getSurroundingUsers();
      setStep(1);
      setSelectedUsers([]);
      setGroupName("");
      setGroupIconPreview(null);
      setSearchQuery("");
    }
  }, [visible, getSurroundingUsers]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      `${u.fullname} ${u.bio ?? ""}`.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const toggleUser = (user: ChatUser) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === user._id);
      if (exists) {
        return prev.filter((u) => u._id !== user._id);
      }
      return [...prev, user];
    });
  };

  const pickGroupIcon = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setGroupIconPreview(result.assets[0].uri);
      }
    } catch {
      showErrorToast("Could not pick image");
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      showErrorToast("Please enter a group subject");
      return;
    }

    if (selectedUsers.length === 0) {
      showErrorToast("Select at least one participant");
      return;
    }

    setIsCreating(true);
    try {
      const participants = [
        ...(authUser ? [{ userId: authUser._id, role: "admin" }] : []),
        ...selectedUsers.map((u) => ({ userId: u._id, role: "member" })),
      ];

      let groupIcon: string | undefined;
      if (groupIconPreview) {
        groupIcon = await uriToDataUri(groupIconPreview, "image/jpeg");
      }

      const res = await createGroup({
        groupname: groupName.trim(),
        groupIcon,
        participants,
      });

      showSuccessToast(res?.message || "Group created successfully");
      await useChatStore.getState().getConversation();

      // Find created group in updated conversations
      const created = useChatStore
        .getState()
        .conversations.find((c) => c.isgroup && c.groupdetail?.groupname === groupName.trim());

      onClose();
      if (created) {
        onGroupCreated(created);
      }
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.outlineVariant },
          ]}
        >
          <Pressable
            hitSlop={10}
            onPress={() => {
              if (step === 2) {
                setStep(1);
              } else {
                onClose();
              }
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={colors.onSurface} strokeWidth={2.2} />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
              {step === 1 ? "New group" : "New group details"}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
              {step === 1
                ? selectedUsers.length > 0
                  ? `${selectedUsers.length} selected`
                  : "Add participants"
                : `${selectedUsers.length} participants`}
            </Text>
          </View>

          {step === 1 && selectedUsers.length > 0 && (
            <Pressable
              onPress={() => setStep(2)}
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.nextButtonText, { color: colors.onPrimary }]}>
                Next
              </Text>
            </Pressable>
          )}

          {step === 2 && (
            <Pressable
              disabled={isCreating}
              onPress={handleCreate}
              style={[
                styles.createButton,
                { backgroundColor: colors.primary },
                isCreating && { opacity: 0.6 },
              ]}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Check size={20} color={colors.onPrimary} strokeWidth={2.5} />
              )}
            </Pressable>
          )}
        </View>

        {/* STEP 1: Select Participants */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            {/* Horizontal selected chips */}
            {selectedUsers.length > 0 && (
              <View
                style={[
                  styles.chipsBar,
                  { borderBottomColor: colors.outlineVariant },
                ]}
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsScroll}
                >
                  {selectedUsers.map((user) => (
                    <Pressable
                      key={user._id}
                      onPress={() => toggleUser(user)}
                      style={styles.chipItem}
                    >
                      <View style={styles.chipAvatarWrap}>
                        <Avatar
                          uri={user.profilePic?.url}
                          name={user.fullname}
                          size={40}
                        />
                        <View
                          style={[
                            styles.chipRemoveBadge,
                            { backgroundColor: colors.onSurfaceVariant },
                          ]}
                        >
                          <X size={10} color={colors.surface} strokeWidth={3} />
                        </View>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[styles.chipName, { color: colors.onSurface }]}
                      >
                        {user.fullname.split(" ")[0]}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Search */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <Search size={18} color={colors.outline} />
              <TextInput
                placeholder="Search name or bio"
                placeholderTextColor={colors.outline}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: colors.onSurface }]}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                  <X size={16} color={colors.outline} />
                </Pressable>
              )}
            </View>

            {/* Contact list */}
            {isUsersLoading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                  const isSelected = selectedUsers.some((u) => u._id === item._id);
                  return (
                    <Pressable
                      onPress={() => toggleUser(item)}
                      style={({ pressed }) => [
                        styles.contactRow,
                        pressed && { backgroundColor: colors.surfaceContainerHigh },
                      ]}
                    >
                      <Avatar
                        uri={item.profilePic?.url}
                        name={item.fullname}
                        size={46}
                      />
                      <View style={styles.contactInfo}>
                        <Text
                          style={[styles.contactName, { color: colors.onSurface }]}
                        >
                          {item.fullname}
                        </Text>
                        {item.bio ? (
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.contactBio,
                              { color: colors.onSurfaceVariant },
                            ]}
                          >
                            {item.bio}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: isSelected
                              ? colors.primary
                              : colors.outline,
                            backgroundColor: isSelected
                              ? colors.primary
                              : "transparent",
                          },
                        ]}
                      >
                        {isSelected && (
                          <Check
                            size={14}
                            color={colors.onPrimary}
                            strokeWidth={3}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: colors.outlineVariant },
                    ]}
                  />
                )}
              />
            )}
          </View>
        )}

        {/* STEP 2: Subject & Icon */}
        {step === 2 && (
          <ScrollView
            style={styles.stepContainer}
            contentContainerStyle={styles.step2Content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.subjectCard}>
              <Pressable
                onPress={pickGroupIcon}
                style={[
                  styles.iconPicker,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                {groupIconPreview ? (
                  <Image
                    source={{ uri: groupIconPreview }}
                    style={styles.pickedImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.iconPickerPlaceholder}>
                    <Camera size={26} color={colors.primary} />
                    <Text
                      style={[
                        styles.iconPickerLabel,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Icon
                    </Text>
                  </View>
                )}
              </Pressable>

              <View style={styles.subjectInputWrap}>
                <View style={styles.subjectRow}>
                  <TextInput
                    placeholder="Type group subject here..."
                    placeholderTextColor={colors.outline}
                    value={groupName}
                    onChangeText={setGroupName}
                    maxLength={30}
                    style={[
                      styles.subjectInput,
                      {
                        color: colors.onSurface,
                        borderBottomColor: colors.primary,
                      },
                    ]}
                    autoFocus
                  />
                  <Pressable
                    hitSlop={8}
                    onPress={() => setEmojiPickerVisible(true)}
                    accessibilityLabel="Add emoji to group name"
                    style={styles.emojiIconButton}
                  >
                    <Smile size={20} color={colors.onSurfaceVariant} strokeWidth={2.2} />
                  </Pressable>
                </View>
                <Text
                  style={[
                    styles.charCounter,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {30 - groupName.length}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.participantsSectionTitle,
                { color: colors.onSurfaceVariant },
              ]}
            >
              PARTICIPANTS: {selectedUsers.length}
            </Text>

            <View style={styles.participantsGrid}>
              {selectedUsers.map((user) => (
                <View key={user._id} style={styles.participantItem}>
                  <Avatar
                    uri={user.profilePic?.url}
                    name={user.fullname}
                    size={46}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.participantName,
                      { color: colors.onSurface },
                    ]}
                  >
                    {user.fullname.split(" ")[0]}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      <EmojiPickerModal
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onSelectEmoji={(emoji) => setGroupName((prev) => prev + emoji)}
        title="Group Name Emoji"
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
    marginRight: 6,
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  nextButton: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContainer: {
    flex: 1,
  },
  chipsBar: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  chipItem: {
    alignItems: "center",
    width: 56,
  },
  chipAvatarWrap: {
    position: "relative",
  },
  chipRemoveBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  chipName: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 14,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactBio: {
    fontSize: 13,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
  },
  step2Content: {
    padding: 16,
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 16,
  },
  iconPicker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
  },
  iconPickerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconPickerLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  subjectInputWrap: {
    flex: 1,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emojiIconButton: {
    padding: 6,
    marginLeft: 6,
  },
  subjectInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    borderBottomWidth: 2,
    paddingVertical: 8,
  },
  charCounter: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  participantsSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  participantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  participantItem: {
    alignItems: "center",
    width: 58,
  },
  participantName: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
});
