import { useEffect, useState, useMemo } from "react";
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
  Check,
  Globe,
  Key,
  Laptop,
  LogOut,
  RefreshCw,
  Shield,
  Smartphone,
  Trash2,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { AppHeader } from "@/shared/ui/AppHeader";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { EmptyState } from "@/shared/ui/EmptyState";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import dayjs from "dayjs";

export default function AccountSectionScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    activeSessions,
    canManageDevices,
    fetchActiveSessions,
    isSessionsLoading,
    isLoggingOutOthers,
    logoutOneSession,
    logoutOtherSessions,
    sessionActionId,
    deleteAccount,
    isDeletingAccount,
  } = useAuthStore();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [sessionToLogout, setSessionToLogout] = useState<any | null>(null);

  useEffect(() => {
    void fetchActiveSessions();
  }, [fetchActiveSessions]);

  const otherSessionsCount = useMemo(
    () => activeSessions.filter((s: any) => !s.isCurrent).length,
    [activeSessions],
  );

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      showErrorToast("Please enter your password");
      return;
    }

    await deleteAccount({ password: deletePassword });
    setDeleteModalVisible(false);
    setDeletePassword("");
  };

  const getDeviceIcon = (deviceName = "") => {
    const lower = deviceName.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("ios")) {
      return Smartphone;
    }
    if (lower.includes("mac") || lower.includes("windows") || lower.includes("linux")) {
      return Laptop;
    }
    return Globe;
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
      <AppHeader title="Account" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Sessions Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
            ACTIVE SESSIONS ({activeSessions.length})
          </Text>
          <Pressable
            disabled={isSessionsLoading}
            onPress={() => void fetchActiveSessions()}
            style={styles.refreshBtn}
          >
            <RefreshCw
              size={16}
              color={colors.primary}
              style={isSessionsLoading ? styles.spin : undefined}
            />
          </Pressable>
        </View>

        {isSessionsLoading && activeSessions.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : activeSessions.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="No other sessions"
            description="You are currently logged in only on this mobile device."
          />
        ) : (
          <View
            style={[
              styles.sessionsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            {activeSessions.map((session: any, idx: number) => {
              const DeviceIcon = getDeviceIcon(session.deviceName);
              const isCurrent = Boolean(session.isCurrent);
              const lastActive = session.lastUsedAt || session.createdAt;
              const formattedTime = lastActive
                ? dayjs(lastActive).format("MMM D [at] h:mm A")
                : "Active now";

              return (
                <View
                  key={session._id || idx}
                  style={[
                    styles.sessionRow,
                    idx < activeSessions.length - 1 && {
                      borderBottomColor: colors.outlineVariant,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.deviceIconBox,
                      { backgroundColor: colors.surfaceContainerHigh },
                    ]}
                  >
                    <DeviceIcon
                      size={22}
                      color={isCurrent ? colors.primary : colors.onSurface}
                    />
                  </View>

                  <View style={styles.sessionInfo}>
                    <View style={styles.sessionNameRow}>
                      <Text
                        numberOfLines={1}
                        style={[styles.deviceName, { color: colors.onSurface }]}
                      >
                        {session.deviceName || "Unknown Device"}
                      </Text>
                      {isCurrent && (
                        <View
                          style={[
                            styles.currentBadge,
                            { backgroundColor: `${colors.primary}18` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.currentBadgeText,
                              { color: colors.primary },
                            ]}
                          >
                            This device
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.sessionMeta,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {session.ipAddress ? `${session.ipAddress} • ` : ""}
                      {formattedTime}
                    </Text>
                  </View>

                  {!isCurrent && (
                    <Pressable
                      disabled={sessionActionId === session._id}
                      onPress={() => setSessionToLogout(session)}
                      style={({ pressed }) => [
                        styles.sessionActionBtn,
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      {sessionActionId === session._id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <LogOut size={18} color={colors.error} />
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Log Out From All Other Devices */}
        {otherSessionsCount > 0 && (
          <View style={styles.logoutOthersWrap}>
            <PrimaryButton
              label={`Log out from other ${otherSessionsCount} ${
                otherSessionsCount === 1 ? "device" : "devices"
              }`}
              variant="outline"
              loading={isLoggingOutOthers}
              onPress={async () => {
                await logoutOtherSessions();
              }}
              fullWidth
            />
          </View>
        )}

        {/* Danger Zone: Delete Account */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>
            DANGER ZONE
          </Text>
        </View>

        <View
          style={[
            styles.dangerCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.error,
            },
          ]}
        >
          <View style={styles.dangerHeader}>
            <Trash2 size={22} color={colors.error} />
            <Text style={[styles.dangerTitle, { color: colors.onSurface }]}>
              Delete Account
            </Text>
          </View>
          <Text
            style={[styles.dangerDesc, { color: colors.onSurfaceVariant }]}
          >
            Permanently delete your Kapota account, conversation history, and profile data. This action is irreversible.
          </Text>
          <View style={styles.dangerBtnWrap}>
            <PrimaryButton
              label="Delete account"
              variant="outline"
              onPress={() => setDeleteModalVisible(true)}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>

      {/* Logout Single Session Confirmation */}
      <ConfirmationDialog
        visible={Boolean(sessionToLogout)}
        title="Disconnect session?"
        message={`Are you sure you want to log out ${
          sessionToLogout?.deviceName || "this device"
        }?`}
        confirmLabel="Log out"
        isDestructive
        onCancel={() => setSessionToLogout(null)}
        onConfirm={async () => {
          if (!sessionToLogout) return;
          const sId = sessionToLogout._id;
          setSessionToLogout(null);
          await logoutOneSession(sId);
        }}
      />

      {/* Delete Account Password Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.modalTop}>
              <View
                style={[
                  styles.modalIconBox,
                  { backgroundColor: `${colors.error}18` },
                ]}
              >
                <Trash2 size={24} color={colors.error} />
              </View>
              <Text style={[styles.modalHeading, { color: colors.onSurface }]}>
                Delete your account
              </Text>
              <Text
                style={[
                  styles.modalText,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Please enter your password to confirm permanent account deletion.
              </Text>
            </View>

            <TextInput
              secureTextEntry
              placeholder="Enter your password to confirm"
              placeholderTextColor={colors.outline}
              value={deletePassword}
              onChangeText={setDeletePassword}
              style={[
                styles.passwordInput,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                },
              ]}
            />

            <View style={styles.modalActions}>
              <View style={styles.modalBtnHalf}>
                <PrimaryButton
                  label="Cancel"
                  variant="outline"
                  onPress={() => {
                    setDeleteModalVisible(false);
                    setDeletePassword("");
                  }}
                  fullWidth
                />
              </View>
              <View style={styles.modalBtnHalf}>
                <PrimaryButton
                  label="Delete"
                  loading={isDeletingAccount}
                  onPress={handleDeleteAccount}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  refreshBtn: {
    padding: 6,
  },
  spin: {
    transform: [{ rotate: "45deg" }],
  },
  loaderWrap: {
    paddingVertical: 32,
    alignItems: "center",
  },
  sessionsCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  deviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sessionMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  sessionActionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  logoutOthersWrap: {
    marginTop: 14,
  },
  dangerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  dangerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  dangerDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  dangerBtnWrap: {
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  modalTop: {
    alignItems: "center",
    marginBottom: 18,
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  modalText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },
  passwordInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtnHalf: {
    flex: 1,
  },
});
