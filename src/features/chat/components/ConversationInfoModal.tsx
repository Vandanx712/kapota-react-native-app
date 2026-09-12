import React, { useEffect, useState, useRef } from "react";
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
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  Check,
  ChevronRight,
  CircleSlash2,
  Edit2,
  Eraser,
  Image as ImageIcon,
  LogOut,
  Mail,
  MoreVertical,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useChatStore } from "../store/chat.store";
import type { Conversation, ChatUser } from "../types/chat.types";
import { EmojiPickerModal } from "@/shared/ui/EmojiPickerModal";
import {
  clearChat,
  contactDetail,
  deleteConversation,
  exitGroup,
  getMessageImages,
  getOtherUsers,
  updateGroupDetail,
  updateMembers,
} from "../api/chatApi";
import { Avatar } from "@/shared/ui/Avatar";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export interface ConversationInfoModalProps {
  conversation: Conversation;
  visible: boolean;
  onClose: () => void;
  onCleared?: () => void;
  onDeleted?: () => void;
}

interface ParticipantItem {
  userId: string;
  role: "admin" | "member";
  fullname?: string;
  profilePic?: { url: string };
}

export default function ConversationInfoModal({
  conversation,
  visible,
  onClose,
  onCleared,
  onDeleted,
}: ConversationInfoModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const authUser = useAuthStore((state) => state.authUser);
  const setClearChatStore = useChatStore((state) => state.setClearChat);
  const refreshGroupMemberStore = useChatStore((state) => state.refreshGroupMember);

  const isGroup = Boolean(conversation.isgroup);
  const groupDetail = conversation.groupdetail;

  // Direct contact state
  const [contactBio, setContactBio] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState<string | null>(null);
  const [isContactLoading, setIsContactLoading] = useState(false);

  // Group editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(
    groupDetail?.groupname || conversation.name || ""
  );
  const [groupIconUri, setGroupIconUri] = useState<string | null>(
    groupDetail?.groupIcon?.url || null
  );
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // Members state
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [isUpdatingMembers, setIsUpdatingMembers] = useState(false);

  // Add members modal state
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoadingOtherUsers, setIsLoadingOtherUsers] = useState(false);

  // Shared media
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }>({
    visible: false,
    title: "",
    message: "",
    confirmLabel: "",
    action: async () => {},
  });
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  // Current user's role in group
  const myRole = isGroup && authUser?._id && groupDetail?.membersDetail?.[authUser._id]
    ? groupDetail.membersDetail[authUser._id].role
    : "member";
  const isAdmin = myRole === "admin";

  // Initialize group data or direct contact data
  useEffect(() => {
    if (!visible) return;

    if (isGroup && groupDetail?.membersDetail) {
      setGroupNameInput(groupDetail.groupname || conversation.name || "");
      setGroupIconUri(groupDetail.groupIcon?.url || null);

      const mapped: ParticipantItem[] = Object.entries(groupDetail.membersDetail).map(
        ([id, data]) => ({
          userId: id,
          role: (data.role as "admin" | "member") || "member",
          fullname: data.fullname,
          profilePic: data.profilePic,
        })
      );
      // Sort admins first
      mapped.sort((a, b) => (a.role === "admin" ? -1 : 1));
      setParticipants(mapped);
    } else if (!isGroup && conversation.oruserId) {
      setIsContactLoading(true);
      contactDetail(conversation.oruserId)
        .then((res) => {
          if (res?.user) {
            setContactBio(res.user.bio || "No bio yet");
            setContactEmail(res.user.email || null);
          }
        })
        .catch(() => {})
        .finally(() => setIsContactLoading(false));
    }

    // Fetch media
    if (conversation.conversationId) {
      setIsLoadingMedia(true);
      getMessageImages(conversation.conversationId)
        .then((res) => {
          const imgs = res?.messages || res?.media || [];
          setMediaList(Array.isArray(imgs) ? imgs : []);
        })
        .catch(() => {})
        .finally(() => setIsLoadingMedia(false));
    }
  }, [visible, conversation, isGroup, groupDetail]);

  // Handle Pick Group Icon
  const handlePickGroupIcon = async () => {
    if (!isAdmin) {
      showErrorToast("Only group admins can update the group icon");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const selectedUri = result.assets[0].uri;
        setGroupIconUri(selectedUri);
        setIsSavingGroup(true);

        const formData = new FormData();
        formData.append("conversationId", conversation.conversationId);
        formData.append("groupname", groupNameInput);
        formData.append("image", {
          uri: selectedUri,
          type: "image/jpeg",
          name: "group-icon.jpg",
        } as any);

        await updateGroupDetail(formData);
        showSuccessToast("Group icon updated");
      }
    } catch {
      showErrorToast("Failed to update group icon");
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Handle Save Group Name
  const handleSaveGroupName = async () => {
    if (!groupNameInput.trim()) {
      showErrorToast("Group name cannot be empty");
      return;
    }
    setIsSavingGroup(true);
    try {
      await updateGroupDetail({
        conversationId: conversation.conversationId,
        groupname: groupNameInput.trim(),
      });
      setIsEditingName(false);
      showSuccessToast("Group name updated");
    } catch {
      showErrorToast("Failed to update group name");
    } finally {
      setIsSavingGroup(false);
    }
  };

  // Toggle Admin Role
  const handleToggleAdminRole = async (targetUserId: string, currentRole: "admin" | "member") => {
    const newRole: "admin" | "member" = currentRole === "admin" ? "member" : "admin";
    const updated = participants.map((p) =>
      p.userId === targetUserId ? { ...p, role: newRole } : p
    );
    setParticipants(updated);
    setIsUpdatingMembers(true);
    try {
      await updateMembers({
        id: conversation.conversationId,
        participants: updated.map((p) => ({ userId: p.userId, role: p.role })),
      });
      showSuccessToast(newRole === "admin" ? "Promoted to Admin" : "Dismissed as Admin");
    } catch {
      showErrorToast("Failed to update member role");
      // Revert
      setParticipants(participants);
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  // Remove Member from Group
  const handleRemoveMember = (targetUserId: string, memberName: string) => {
    setConfirmDialog({
      visible: true,
      title: `Remove ${memberName}?`,
      message: "This person will be removed from the group.",
      confirmLabel: "Remove",
      isDestructive: true,
      action: async () => {
        const updated = participants.filter((p) => p.userId !== targetUserId);
        setParticipants(updated);
        try {
          await updateMembers({
            id: conversation.conversationId,
            participants: updated.map((p) => ({ userId: p.userId, role: p.role })),
          });
          showSuccessToast(`${memberName} removed`);
        } catch {
          showErrorToast("Failed to remove member");
          setParticipants(participants);
        }
      },
    });
  };

  // Load other users for add members modal
  const handleOpenAddMembers = async () => {
    setShowAddMembersModal(true);
    setIsLoadingOtherUsers(true);
    try {
      const res = await getOtherUsers(conversation.conversationId);
      const userList: ChatUser[] = res?.otherUsers || res?.users || [];
      // Filter out users already in participants
      const participantIdSet = new Set(participants.map((p) => p.userId));
      setAvailableUsers(userList.filter((u) => !participantIdSet.has(u._id)));
    } catch {
      showErrorToast("Failed to load users");
    } finally {
      setIsLoadingOtherUsers(false);
    }
  };

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddSelectedUsers = async () => {
    if (selectedUserIds.length === 0) return;
    const newParticipants: ParticipantItem[] = selectedUserIds.map((id) => {
      const user = availableUsers.find((u) => u._id === id);
      return {
        userId: id,
        role: "member",
        fullname: user?.fullname || "Member",
        profilePic: user?.profilePic,
      };
    });

    const merged = [...participants, ...newParticipants];
    setParticipants(merged);
    setShowAddMembersModal(false);
    setSelectedUserIds([]);
    setIsUpdatingMembers(true);

    try {
      await updateMembers({
        id: conversation.conversationId,
        participants: merged.map((p) => ({ userId: p.userId, role: p.role })),
      });
      showSuccessToast("Members added to group");
    } catch {
      showErrorToast("Failed to add members");
      setParticipants(participants);
    } finally {
      setIsUpdatingMembers(false);
    }
  };

  // Exit Group
  const handleExitGroup = () => {
    setConfirmDialog({
      visible: true,
      title: "Exit group?",
      message: "You will no longer be able to send or receive messages in this group.",
      confirmLabel: "Exit Group",
      isDestructive: true,
      action: async () => {
        try {
          await exitGroup(conversation.conversationId);
          showSuccessToast("You have left the group");
          onClose();
          router.replace("/(tabs)/chat");
        } catch {
          showErrorToast("Failed to exit group");
        }
      },
    });
  };

  // Clear Chat
  const handleClearChat = () => {
    setConfirmDialog({
      visible: true,
      title: "Clear all messages?",
      message: "Messages in this conversation will be permanently cleared on your account.",
      confirmLabel: "Clear Messages",
      isDestructive: true,
      action: async () => {
        try {
          await clearChat(conversation.conversationId);
          setClearChatStore({ conversationId: conversation.conversationId });
          showSuccessToast("Chat cleared");
          onCleared?.();
          onClose();
        } catch {
          showErrorToast("Failed to clear chat");
        }
      },
    });
  };

  // Delete Chat
  const handleDeleteChat = () => {
    setConfirmDialog({
      visible: true,
      title: isGroup ? "Delete group?" : "Delete conversation?",
      message: isGroup
        ? "This group will be deleted from your chats."
        : "This entire conversation will be permanently deleted.",
      confirmLabel: "Delete",
      isDestructive: true,
      action: async () => {
        try {
          await deleteConversation(conversation.conversationId);
          refreshGroupMemberStore("DELETE_CONVERSATION", conversation);
          showSuccessToast("Conversation deleted");
          onDeleted?.();
          onClose();
          router.replace("/(tabs)/chat");
        } catch {
          showErrorToast("Failed to delete conversation");
        }
      },
    });
  };

  // Profile navigation for direct contact
  const handleGoToProfile = () => {
    if (!conversation.oruserId) return;
    onClose();
    router.push({
      pathname: "/profile/edit", // or view profile
      params: { userId: conversation.oruserId },
    });
  };

  const displayName = isGroup
    ? groupDetail?.groupname || conversation.name || "Group"
    : conversation.name || "Contact";
  const avatarUrl = isGroup
    ? groupIconUri || groupDetail?.groupIcon?.url
    : conversation.profilePic?.url;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[styles.sheetContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Header Bar */}
          <View style={styles.topBar}>
            <Pressable hitSlop={12} onPress={onClose} style={styles.closeIconBtn}>
              <X size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.topBarTitle}>
              {isGroup ? "Group info" : "Contact info"}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* HERO PROFILE CARD */}
            <View style={styles.heroCard}>
              <View style={styles.avatarWrapper}>
                <Avatar
                  uri={avatarUrl}
                  name={displayName}
                  size={88}
                  isGroup={isGroup}
                />
                {isGroup && isAdmin && (
                  <Pressable
                    hitSlop={8}
                    onPress={handlePickGroupIcon}
                    style={[styles.avatarCameraBtn, { backgroundColor: colors.primary }]}
                  >
                    {isSavingGroup ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <Camera size={16} color={colors.onPrimary} />
                    )}
                  </Pressable>
                )}
              </View>

              {/* Title / Name Row */}
              {isGroup && isEditingName ? (
                <View style={styles.editNameRow}>
                  <TextInput
                    value={groupNameInput}
                    onChangeText={setGroupNameInput}
                    autoFocus
                    placeholder="Enter group name"
                    placeholderTextColor={colors.outline}
                    style={[
                      styles.nameInput,
                      { color: colors.onSurface, borderColor: colors.primary },
                    ]}
                  />
                  <Pressable
                    onPress={() => setEmojiPickerVisible(true)}
                    accessibilityLabel="Add emoji to group name"
                    style={[
                      styles.actionNameBtn,
                      { backgroundColor: colors.surfaceContainerHighest },
                    ]}
                  >
                    <Smile size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setGroupNameInput(groupDetail?.groupname || conversation.name || "");
                      setIsEditingName(false);
                    }}
                    disabled={isSavingGroup}
                    accessibilityLabel="Cancel editing group name"
                    style={[
                      styles.actionNameBtn,
                      { backgroundColor: colors.surfaceContainerHighest },
                    ]}
                  >
                    <X size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
                  </Pressable>
                  <Pressable
                    onPress={handleSaveGroupName}
                    disabled={isSavingGroup}
                    accessibilityLabel="Save group name"
                    style={[styles.saveNameBtn, { backgroundColor: colors.primary }]}
                  >
                    <Check size={16} color={colors.onPrimary} strokeWidth={2.4} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.titleRow}>
                  <Text numberOfLines={2} style={styles.heroName}>
                    {displayName}
                  </Text>
                  {isGroup && isAdmin && (
                    <Pressable
                      hitSlop={8}
                      onPress={() => setIsEditingName(true)}
                      style={styles.editIconBtn}
                    >
                      <Edit2 size={16} color={colors.primary} />
                    </Pressable>
                  )}
                </View>
              )}

              {/* Subtitle / Details */}
              {isGroup ? (
                <Text style={styles.heroSubtitle}>
                  Group · {participants.length} {participants.length === 1 ? "member" : "members"}
                </Text>
              ) : (
                <View style={styles.directDetails}>
                  {contactEmail && (
                    <View style={styles.detailRow}>
                      <Mail size={14} color={colors.outline} />
                      <Text style={styles.detailText}>{contactEmail}</Text>
                    </View>
                  )}
                  {contactBio && (
                    <View style={styles.detailRow}>
                      <User size={14} color={colors.outline} />
                      <Text style={styles.detailText}>{contactBio}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* SHARED MEDIA SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primaryContainer}20` }]}>
                  <ImageIcon size={18} color={colors.primaryContainer} />
                </View>
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Shared Media</Text>
                  <Text style={styles.sectionSubtitle}>
                    {mediaList.length} {mediaList.length === 1 ? "item" : "items"}
                  </Text>
                </View>
              </View>

              {isLoadingMedia ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : mediaList.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.mediaRow}
                >
                  {mediaList.map((media, idx) => {
                    const uri = media?.image?.url || media?.media?.url || media?.url;
                    if (!uri) return null;
                    return (
                      <View key={media._id || idx} style={styles.mediaThumbWrap}>
                        <Image source={{ uri }} style={styles.mediaThumb} contentFit="cover" />
                      </View>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.emptyMediaBox}>
                  <CircleSlash2 size={24} color={colors.outline} />
                  <Text style={styles.emptyMediaText}>No shared media yet</Text>
                </View>
              )}
            </View>

            {/* GROUP MEMBERS SECTION */}
            {isGroup && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.secondary}20` }]}>
                    <Users size={18} color={colors.secondary} />
                  </View>
                  <View style={styles.sectionTitleBlock}>
                    <Text style={styles.sectionTitle}>Group Members</Text>
                    <Text style={styles.sectionSubtitle}>
                      {participants.length} {participants.length === 1 ? "person" : "people"}
                    </Text>
                  </View>
                  {isAdmin && (
                    <Pressable
                      onPress={handleOpenAddMembers}
                      style={[styles.addMemberBtn, { backgroundColor: `${colors.primary}15` }]}
                    >
                      <UserPlus size={16} color={colors.primary} />
                      <Text style={[styles.addMemberBtnText, { color: colors.primary }]}>Add</Text>
                    </Pressable>
                  )}
                </View>

                <View style={styles.membersList}>
                  {participants.map((member) => {
                    const isMe = member.userId === authUser?._id;
                    const isMemberAdmin = member.role === "admin";

                    return (
                      <View key={member.userId} style={styles.memberRow}>
                        <Avatar
                          uri={member.profilePic?.url}
                          name={member.fullname || "Member"}
                          size={42}
                        />

                        <View style={styles.memberInfo}>
                          <View style={styles.memberNameRow}>
                            <Text numberOfLines={1} style={styles.memberName}>
                              {isMe ? "You" : member.fullname || "Member"}
                            </Text>
                            {isMemberAdmin && (
                              <View
                                style={[
                                  styles.adminBadge,
                                  { backgroundColor: `${colors.primary}18` },
                                ]}
                              >
                                <Text style={[styles.adminBadgeText, { color: colors.primary }]}>
                                  Admin
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Admin controls for other members */}
                        {isAdmin && !isMe && (
                          <View style={styles.memberActionsRow}>
                            <Pressable
                              hitSlop={6}
                              onPress={() =>
                                handleToggleAdminRole(member.userId, member.role)
                              }
                              style={styles.actionPill}
                            >
                              <Text style={[styles.actionPillText, { color: colors.primary }]}>
                                {isMemberAdmin ? "Dismiss" : "Make Admin"}
                              </Text>
                            </Pressable>

                            <Pressable
                              hitSlop={6}
                              onPress={() =>
                                handleRemoveMember(member.userId, member.fullname || "Member")
                              }
                              style={[styles.actionPill, styles.removePill]}
                            >
                              <UserMinus size={15} color={colors.error} />
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* CHAT ACTIONS SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.error}18` }]}>
                  <ShieldAlert size={18} color={colors.error} />
                </View>
                <View style={styles.sectionTitleBlock}>
                  <Text style={styles.sectionTitle}>Chat Actions</Text>
                  <Text style={styles.sectionSubtitle}>
                    Manage or clear this conversation
                  </Text>
                </View>
              </View>

              <View style={styles.cardBox}>
                {/* Clear Chat */}
                <Pressable
                  onPress={handleClearChat}
                  style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                >
                  <View style={[styles.actionIconWrap, { backgroundColor: `${colors.error}15` }]}>
                    <Eraser size={18} color={colors.error} />
                  </View>
                  <View style={styles.actionTextWrap}>
                    <Text style={[styles.actionLabel, { color: colors.error }]}>Clear chat</Text>
                    <Text style={styles.actionDesc}>Delete messages from this chat</Text>
                  </View>
                </Pressable>

                {/* Exit Group (if group member) */}
                {isGroup && (
                  <>
                    <View style={styles.separator} />
                    <Pressable
                      onPress={handleExitGroup}
                      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                    >
                      <View style={[styles.actionIconWrap, { backgroundColor: `${colors.error}15` }]}>
                        <LogOut size={18} color={colors.error} />
                      </View>
                      <View style={styles.actionTextWrap}>
                        <Text style={[styles.actionLabel, { color: colors.error }]}>Exit group</Text>
                        <Text style={styles.actionDesc}>Leave and stop receiving group messages</Text>
                      </View>
                    </Pressable>
                  </>
                )}

                {/* Delete Chat */}
                {(!isGroup || isAdmin) && (
                  <>
                    <View style={styles.separator} />
                    <Pressable
                      onPress={handleDeleteChat}
                      style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
                    >
                      <View style={[styles.actionIconWrap, { backgroundColor: `${colors.error}15` }]}>
                        <Trash2 size={18} color={colors.error} />
                      </View>
                      <View style={styles.actionTextWrap}>
                        <Text style={[styles.actionLabel, { color: colors.error }]}>
                          {isGroup ? "Delete group" : "Delete conversation"}
                        </Text>
                        <Text style={styles.actionDesc}>Permanently remove from chat list</Text>
                      </View>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ADD MEMBERS MODAL */}
      <Modal
        visible={showAddMembersModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddMembersModal(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowAddMembersModal(false)} />
          <View style={[styles.addMembersSheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.addMembersHeader}>
              <View>
                <Text style={styles.addMembersTitle}>Add members</Text>
                <Text style={styles.addMembersSubtitle}>Select users to join this group</Text>
              </View>
              <Pressable
                hitSlop={8}
                onPress={() => setShowAddMembersModal(false)}
                style={styles.closeIconBtn}
              >
                <X size={20} color={colors.onSurface} />
              </Pressable>
            </View>

            {isLoadingOtherUsers ? (
              <View style={styles.modalLoadingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : availableUsers.length === 0 ? (
              <View style={styles.emptyMembersBox}>
                <Text style={styles.emptyMembersText}>No additional users available to add</Text>
              </View>
            ) : (
              <FlatList
                data={availableUsers}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.usersListContent}
                renderItem={({ item }) => {
                  const isSelected = selectedUserIds.includes(item._id);
                  return (
                    <Pressable
                      onPress={() => handleToggleSelectUser(item._id)}
                      style={[
                        styles.userItemRow,
                        isSelected && { backgroundColor: `${colors.primary}12` },
                      ]}
                    >
                      <Avatar uri={item.profilePic?.url} name={item.fullname} size={44} />
                      <View style={styles.userItemInfo}>
                        <Text style={styles.userItemName}>{item.fullname}</Text>
                        {item.email && <Text style={styles.userItemEmail}>{item.email}</Text>}
                      </View>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        {isSelected && <Check size={14} color={colors.onPrimary} strokeWidth={3} />}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}

            <View style={styles.addMembersFooter}>
              <PrimaryButton
                label={`Add ${selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""} members`}
                disabled={selectedUserIds.length === 0 || isUpdatingMembers}
                loading={isUpdatingMembers}
                onPress={handleAddSelectedUsers}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* CONFIRMATION DIALOG */}
      <ConfirmationDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        loading={isConfirmLoading}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, visible: false }))}
        onConfirm={async () => {
          setIsConfirmLoading(true);
          try {
            await confirmDialog.action();
          } finally {
            setIsConfirmLoading(false);
            setConfirmDialog((prev) => ({ ...prev, visible: false }));
          }
        }}
      />

      <EmojiPickerModal
        visible={emojiPickerVisible}
        onClose={() => setEmojiPickerVisible(false)}
        onSelectEmoji={(emoji) => setGroupNameInput((prev) => prev + emoji)}
        title="Group Name Emoji"
      />
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheetContainer: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: 44,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      overflow: "hidden",
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
      backgroundColor: colors.surface,
    },
    closeIconBtn: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    topBarTitle: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontWeight: "700",
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    heroCard: {
      alignItems: "center",
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.md,
    },
    avatarWrapper: {
      position: "relative",
      marginBottom: spacing.sm,
    },
    avatarCameraBtn: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.surfaceContainer,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingHorizontal: spacing.sm,
    },
    heroName: {
      ...typography.titleMd,
      fontSize: 18,
      fontWeight: "700",
      color: colors.onSurface,
      textAlign: "center",
    },
    editIconBtn: {
      padding: 4,
    },
    editNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      width: "100%",
      paddingHorizontal: spacing.sm,
    },
    nameInput: {
      flex: 1,
      borderWidth: 1.5,
      borderRadius: radius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
      fontSize: 15,
      fontWeight: "600",
    },
    actionNameBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    saveNameBtn: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    heroSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      marginTop: 4,
    },
    directDetails: {
      marginTop: 6,
      gap: 4,
      alignItems: "center",
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    detailText: {
      ...typography.bodySm,
      color: colors.outline,
      fontSize: 13,
    },
    section: {
      marginTop: spacing.md,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    sectionIconWrap: {
      width: 34,
      height: 34,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitleBlock: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.titleMd,
      fontSize: 15,
      fontWeight: "700",
      color: colors.onSurface,
    },
    sectionSubtitle: {
      ...typography.bodySm,
      fontSize: 11,
      color: colors.outline,
    },
    addMemberBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.full,
    },
    addMemberBtnText: {
      ...typography.labelMd,
      fontSize: 12,
      fontWeight: "700",
    },
    loadingBox: {
      padding: spacing.md,
      alignItems: "center",
    },
    mediaRow: {
      gap: spacing.xs,
      paddingVertical: spacing.xs,
    },
    mediaThumbWrap: {
      width: 76,
      height: 76,
      borderRadius: radius.md,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    mediaThumb: {
      width: "100%",
      height: "100%",
    },
    emptyMediaBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      padding: spacing.sm,
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.md,
      marginTop: 4,
    },
    emptyMediaText: {
      ...typography.bodySm,
      color: colors.outline,
      fontSize: 12,
    },
    membersList: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: "hidden",
      marginTop: 4,
    },
    memberRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
    },
    memberInfo: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    memberNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    memberName: {
      ...typography.titleMd,
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
      maxWidth: "75%",
    },
    adminBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: radius.full,
    },
    adminBadgeText: {
      ...typography.labelMd,
      fontSize: 10,
      fontWeight: "700",
    },
    memberActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionPill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    actionPillText: {
      ...typography.labelMd,
      fontSize: 11,
      fontWeight: "600",
    },
    removePill: {
      borderColor: `${colors.error}40`,
      backgroundColor: `${colors.error}10`,
      paddingHorizontal: 6,
    },
    cardBox: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.sm,
      marginTop: 4,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
    },
    actionIconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTextWrap: {
      flex: 1,
    },
    actionLabel: {
      ...typography.titleMd,
      fontSize: 14,
      fontWeight: "700",
    },
    actionDesc: {
      ...typography.bodySm,
      fontSize: 11,
      color: colors.outline,
      marginTop: 1,
    },
    separator: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: spacing.xs,
    },
    addMembersSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: "80%",
      paddingTop: spacing.md,
    },
    addMembersHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    addMembersTitle: {
      ...typography.titleMd,
      fontSize: 16,
      fontWeight: "700",
      color: colors.onSurface,
    },
    addMembersSubtitle: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.outline,
      marginTop: 2,
    },
    modalLoadingBox: {
      padding: spacing.xl,
      alignItems: "center",
    },
    emptyMembersBox: {
      padding: spacing.xl,
      alignItems: "center",
    },
    emptyMembersText: {
      ...typography.bodySm,
      color: colors.outline,
    },
    usersListContent: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    userItemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.xs + 2,
      paddingHorizontal: spacing.xs,
      borderRadius: radius.md,
    },
    userItemInfo: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    userItemName: {
      ...typography.titleMd,
      fontSize: 14,
      fontWeight: "600",
      color: colors.onSurface,
    },
    userItemEmail: {
      ...typography.bodySm,
      fontSize: 11,
      color: colors.outline,
      marginTop: 1,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: radius.sm,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      alignItems: "center",
      justifyContent: "center",
    },
    addMembersFooter: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    pressed: {
      opacity: 0.8,
    },
  });
