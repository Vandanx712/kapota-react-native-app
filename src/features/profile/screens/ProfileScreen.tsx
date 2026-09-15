import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Camera,
  Check,
  Edit2,
  Image as ImageIcon,
  Info,
  Lock,
  Mail,
  Smile,
  Sparkles,
  User,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getAvatars, updatePic, updateProfile } from "@/features/auth/api/authApi";
import { Avatar } from "@/shared/ui/Avatar";
import { ActionSheet } from "@/shared/ui/ActionSheet";
import { EmojiPickerModal } from "@/shared/ui/EmojiPickerModal";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { uriToDataUri } from "@/utils/imageUtils";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  const authUser = useAuthStore((state) => state.authUser);

  const [fullname, setFullname] = useState(authUser?.fullname || "");
  const [bio, setBio] = useState(authUser?.bio || "Available");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [avatarPresetModalVisible, setAvatarPresetModalVisible] = useState(false);
  const [presetAvatars, setPresetAvatars] = useState<string[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(false);
  const [emojiTarget, setEmojiTarget] = useState<"name" | "bio" | null>(null);

  const handleSelectEmoji = (emoji: string) => {
    if (emojiTarget === "name") {
      setFullname((prev) => prev + emoji);
    } else if (emojiTarget === "bio") {
      setBio((prev) => prev + emoji);
    }
  };

  const [prevAuthUser, setPrevAuthUser] = useState(authUser);
  if (authUser !== prevAuthUser) {
    setPrevAuthUser(authUser);
    setFullname(authUser?.fullname || "");
    setBio(authUser?.bio || "Available");
  }

  const handlePickImage = async (fromCamera = false) => {
    setPhotoSheetVisible(false);
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
          aspect: [1, 1],
          quality: 0.75,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
        });
      }

      if (!result.canceled && result.assets[0]?.uri) {
        setIsSaving(true);
        const base64Data = await uriToDataUri(result.assets[0].uri, "image/jpeg");
        const currentKey =
          typeof authUser?.profilePic === "object" && authUser?.profilePic?.key
            ? authUser.profilePic.key
            : "";
        // Never send oldkey if it points to a shared system avatar
        const oldkey =
          currentKey.includes("avatar") || currentKey.includes("avatars")
            ? ""
            : currentKey;

        const res = await updatePic({
          profilePic: base64Data,
          oldkey,
        });
        if (res?.user?.profilePic) {
          const normalizedPic =
            typeof res.user.profilePic === "string"
              ? { url: res.user.profilePic }
              : res.user.profilePic;
          useAuthStore.setState((state) => ({
            authUser: state.authUser
              ? { ...state.authUser, profilePic: normalizedPic }
              : null,
          }));
        }
        showSuccessToast(res?.message || "Profile photo updated");
      }
    } catch (err: any) {
      console.warn("Update profile photo error:", err);
      showErrorToast(err?.response?.data?.message || "Could not update photo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPresetAvatar = async (avatarUrl: string) => {
    setAvatarPresetModalVisible(false);
    setIsSaving(true);
    try {
      const currentKey =
        typeof authUser?.profilePic === "object" && authUser?.profilePic?.key
          ? authUser.profilePic.key
          : "";
      // Never send oldkey if it points to a shared system avatar
      const oldkey =
        currentKey.includes("avatar") || currentKey.includes("avatars")
          ? ""
          : currentKey;

      const res = await updatePic({
        picUrl: avatarUrl,
        oldkey,
      });
      if (res?.user?.profilePic) {
        const normalizedPic =
          typeof res.user.profilePic === "string"
            ? { url: res.user.profilePic }
            : res.user.profilePic;
        useAuthStore.setState((state) => ({
          authUser: state.authUser
            ? { ...state.authUser, profilePic: normalizedPic }
            : null,
        }));
      }
      showSuccessToast(res?.message || "Avatar updated");
    } catch (err: any) {
      console.warn("Update avatar error:", err);
      showErrorToast(err?.response?.data?.message || "Could not update avatar");
    } finally {
      setIsSaving(false);
    }
  };

  const openPresets = async () => {
    setPhotoSheetVisible(false);
    setAvatarPresetModalVisible(true);
    setLoadingAvatars(true);
    try {
      const gender = authUser?.gender || "male";
      const res = await getAvatars({ gender });
      const rawList = res?.avatars || res?.data || [];
      const urls: string[] = rawList
        .map((item: any) => (typeof item === "string" ? item : item?.url))
        .filter(Boolean);
      setPresetAvatars(urls);
    } catch (err: any) {
      console.warn("Load avatars error:", err);
      showErrorToast(err?.response?.data?.message || "Could not load avatars");
    } finally {
      setLoadingAvatars(false);
    }
  };

  const handleCancelEditName = () => {
    setFullname(authUser?.fullname || "");
    setIsEditingName(false);
  };

  const handleCancelEditBio = () => {
    setBio(authUser?.bio || "Available");
    setIsEditingBio(false);
  };

  const handleSaveDetails = async () => {
    if (!fullname.trim()) {
      showErrorToast("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({
        fullname: fullname.trim(),
        bio: bio.trim(),
      });
      if (res?.user) {
        useAuthStore.setState((state) => ({
          authUser: state.authUser
            ? { ...state.authUser, ...res.user }
            : null,
        }));
      }
      showSuccessToast("Profile updated");
      setIsEditingName(false);
      setIsEditingBio(false);
    } catch {
      showErrorToast("Could not update profile details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
          Profile
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Big WhatsApp Avatar with Camera Button */}
        <View style={styles.avatarSection}>
          <Pressable
            onPress={() => setPhotoSheetVisible(true)}
            style={styles.avatarWrap}
          >
            <Avatar
              uri={
                typeof authUser?.profilePic === "string"
                  ? authUser.profilePic
                  : authUser?.profilePic?.url
              }
              name={authUser?.fullname}
              size={120}
            />
            <View
              style={[
                styles.cameraBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Camera size={20} color={colors.onPrimary} strokeWidth={2.4} />
              )}
            </View>
          </Pressable>
        </View>

        {/* Name Item Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.itemHeader}>
            <User size={20} color={colors.primary} />
            <Text style={[styles.itemTitle, { color: colors.onSurfaceVariant }]}>
              Name
            </Text>
          </View>

          {isEditingName ? (
            <View style={styles.editRow}>
              <TextInput
                value={fullname}
                onChangeText={setFullname}
                maxLength={25}
                autoFocus
                style={[
                  styles.input,
                  {
                    color: colors.onSurface,
                    borderBottomColor: colors.primary,
                  },
                ]}
              />
              <View style={styles.editActions}>
                <Pressable
                  onPress={() => setEmojiTarget("name")}
                  accessibilityLabel="Add emoji to name"
                  style={[
                    styles.emojiBtn,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                >
                  <Smile size={18} color={colors.onSurfaceVariant} strokeWidth={2.4} />
                </Pressable>
                <Pressable
                  onPress={handleCancelEditName}
                  disabled={isSaving}
                  accessibilityLabel="Cancel editing name"
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                >
                  <X size={18} color={colors.onSurfaceVariant} strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  onPress={handleSaveDetails}
                  disabled={isSaving}
                  accessibilityLabel="Save name"
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Check size={18} color={colors.onPrimary} strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsEditingName(true)}
              style={styles.displayRow}
            >
              <Text style={[styles.displayText, { color: colors.onSurface }]}>
                {fullname || "Your Name"}
              </Text>
              <Edit2 size={18} color={colors.primary} />
            </Pressable>
          )}
          <Text style={[styles.helpText, { color: colors.outline }]}>
            This is not your username. This name will be visible to your Kapota contacts.
          </Text>
        </View>

        {/* Bio / About Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.itemHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={[styles.itemTitle, { color: colors.onSurfaceVariant }]}>
              About
            </Text>
          </View>

          {isEditingBio ? (
            <View style={styles.editRow}>
              <TextInput
                value={bio}
                onChangeText={setBio}
                maxLength={40}
                autoFocus
                style={[
                  styles.input,
                  {
                    color: colors.onSurface,
                    borderBottomColor: colors.primary,
                  },
                ]}
              />
              <View style={styles.editActions}>
                <Pressable
                  onPress={() => setEmojiTarget("bio")}
                  accessibilityLabel="Add emoji to about"
                  style={[
                    styles.emojiBtn,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                >
                  <Smile size={18} color={colors.onSurfaceVariant} strokeWidth={2.4} />
                </Pressable>
                <Pressable
                  onPress={handleCancelEditBio}
                  disabled={isSaving}
                  accessibilityLabel="Cancel editing about"
                  style={[
                    styles.cancelBtn,
                    { backgroundColor: colors.surfaceContainerHighest },
                  ]}
                >
                  <X size={18} color={colors.onSurfaceVariant} strokeWidth={2.5} />
                </Pressable>
                <Pressable
                  onPress={handleSaveDetails}
                  disabled={isSaving}
                  accessibilityLabel="Save about"
                  style={[
                    styles.saveBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Check size={18} color={colors.onPrimary} strokeWidth={2.5} />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setIsEditingBio(true)}
              style={styles.displayRow}
            >
              <Text style={[styles.displayText, { color: colors.onSurface }]}>
                {bio}
              </Text>
              <Edit2 size={18} color={colors.primary} />
            </Pressable>
          )}
        </View>

        {/* Email Card (Read-only) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceContainer,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.itemHeader}>
            <Mail size={20} color={colors.outline} />
            <Text style={[styles.itemTitle, { color: colors.onSurfaceVariant }]}>
              Email
            </Text>
          </View>
          <View style={styles.displayRow}>
            <Text style={[styles.displayText, { color: colors.onSurface }]}>
              {authUser?.email || "Not set"}
            </Text>
            <Lock size={16} color={colors.outline} />
          </View>
        </View>
      </ScrollView>

      {/* Photo Picker Action Sheet */}
      <ActionSheet
        visible={photoSheetVisible}
        title="Profile photo"
        options={[
          {
            id: "camera",
            label: "Take photo",
            icon: Camera,
            onPress: () => handlePickImage(true),
          },
          {
            id: "gallery",
            label: "Choose from gallery",
            icon: ImageIcon,
            onPress: () => handlePickImage(false),
          },
          {
            id: "presets",
            label: "Choose avatar preset",
            icon: Sparkles,
            onPress: openPresets,
          },
        ]}
        onClose={() => setPhotoSheetVisible(false)}
      />

      {/* Preset Avatars Modal */}
      <Modal
        visible={avatarPresetModalVisible}
        animationType="slide"
        onRequestClose={() => setAvatarPresetModalVisible(false)}
      >
        <View
          style={[
            styles.presetContainer,
            {
              backgroundColor: colors.background,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View style={styles.presetHeader}>
            <Text style={[styles.presetTitle, { color: colors.onSurface }]}>
              Choose Avatar
            </Text>
            <Pressable
              hitSlop={8}
              onPress={() => setAvatarPresetModalVisible(false)}
              style={styles.closeBtn}
            >
              <X size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          {loadingAvatars ? (
            <View style={styles.presetLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.presetGrid}>
              {presetAvatars.map((url, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => handleSelectPresetAvatar(url)}
                  style={styles.presetThumbWrap}
                >
                  <Image source={{ uri: url }} style={styles.presetThumb} />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        visible={emojiTarget !== null}
        onClose={() => setEmojiTarget(null)}
        onSelectEmoji={handleSelectEmoji}
        title={
          emojiTarget === "name"
            ? "Add Emoji to Name"
            : "Add Emoji to About"
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrap: {
    position: "relative",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  displayText: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    borderBottomWidth: 2,
    paddingVertical: 6,
  },
  editActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  navCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: 8,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  navText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
  },
  presetContainer: {
    flex: 1,
  },
  presetHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  presetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 6,
  },
  presetLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
    justifyContent: "center",
  },
  presetThumbWrap: {
    borderRadius: 40,
    overflow: "hidden",
  },
  presetThumb: {
    width: 80,
    height: 80,
  },
});
