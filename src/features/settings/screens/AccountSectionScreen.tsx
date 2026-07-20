import { Key, Laptop2, LogOut, RefreshCw, ShieldCheck, Trash2 } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuthStore } from "@/features/auth/store/auth.store";
import ActionButton from "@/features/settings/components/ActionButton";
import ConfirmModal from "@/features/settings/components/ConfirmModal";
import SectionShell from "@/features/settings/components/SectionShell";
import SessionCard from "@/features/settings/components/SessionCard";
import { darkColors, radius, spacing, typography } from "@/theme/tokens";

export default function AccountSectionScreen() {
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const otherSessionsCount = useMemo(
    () => activeSessions.filter((session) => !session.isCurrent).length,
    [activeSessions],
  );

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    const deleted = await deleteAccount({ password: deletePassword });
    if (deleted) {
      setDeleteModalOpen(false);
      setDeletePassword("");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <SectionShell
        icon={Key}
        title="Account"
        description="Security notifications, account info"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <Laptop2 size={22} color={darkColors.primaryContainer} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>Active devices</Text>
                <Text style={styles.cardDescription}>
                  See where your account is currently logged in and remove
                  devices you no longer use.
                </Text>
              </View>
            </View>

            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                {canManageDevices
                  ? "Oldest non-primary devices are removed automatically when a new login goes over your device limit."
                  : "Device management is available from your primary device."}
              </Text>
            </View>

            <View style={styles.actions}>
              <ActionButton
                label="Refresh"
                icon={RefreshCw}
                onPress={fetchActiveSessions}
                disabled={isSessionsLoading}
                loading={isSessionsLoading}
                fullWidth
              />
              <ActionButton
                label="Log out other devices"
                icon={LogOut}
                variant="danger"
                onPress={logoutOtherSessions}
                disabled={
                  !canManageDevices ||
                  isLoggingOutOthers ||
                  otherSessionsCount === 0
                }
                loading={isLoggingOutOthers}
                fullWidth
              />
            </View>

            {isSessionsLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={darkColors.primaryContainer} />
                <Text style={styles.loadingText}>Loading sessions...</Text>
              </View>
            ) : activeSessions.length === 0 ? (
              <View style={styles.emptyState}>
                <ShieldCheck size={40} color={darkColors.outline} />
                <Text style={styles.emptyTitle}>No active devices</Text>
                <Text style={styles.emptyText}>
                  Once you log in, your current device sessions will appear here.
                </Text>
              </View>
            ) : (
              activeSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  canManageDevices={canManageDevices}
                  isActionLoading={sessionActionId === session._id}
                  onLogout={() => logoutOneSession(session._id)}
                />
              ))
            )}
          </View>

          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Delete account</Text>
            <Text style={styles.dangerDescription}>
              Permanently remove your account, your posts, and your direct
              conversations. This action cannot be undone.
            </Text>
            <View style={styles.dangerNotice}>
              <Text style={styles.dangerNoticeText}>
                You will be signed out immediately after the account is deleted.
              </Text>
            </View>
            <ActionButton
              label="Delete account"
              icon={Trash2}
              variant="danger"
              fullWidth
              onPress={() => setDeleteModalOpen(true)}
            />
          </View>
        </ScrollView>
      </SectionShell>

      <ConfirmModal
        visible={deleteModalOpen}
        title="Delete account?"
        message="Enter your password to permanently remove this account. Your posts and direct conversations will be deleted."
        confirmLabel="Delete account"
        destructive
        loading={isDeletingAccount}
        onCancel={() => {
          if (isDeletingAccount) return;
          setDeletePassword("");
          setDeleteModalOpen(false);
        }}
        onConfirm={handleDeleteAccount}
      >
        <TextInput
          value={deletePassword}
          onChangeText={setDeletePassword}
          placeholder="Enter your password"
          placeholderTextColor={darkColors.outlineVariant}
          secureTextEntry
          style={styles.passwordInput}
        />
      </ConfirmModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: darkColors.background,
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    alignItems: "center",
    backgroundColor: "rgba(140,128,255,0.14)",
    borderRadius: radius.lg,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    ...typography.titleMd,
    color: darkColors.onSurface,
  },
  cardDescription: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginTop: 4,
  },
  notice: {
    backgroundColor: darkColors.surfaceContainerHigh,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  noticeText: {
    ...typography.bodySm,
    color: darkColors.onSurfaceVariant,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  loadingBox: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.bodySm,
    color: darkColors.outline,
  },
  emptyState: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radius.xl,
    borderStyle: "dashed",
    borderWidth: 1,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.bodyLg,
    color: darkColors.onSurface,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  emptyText: {
    ...typography.bodySm,
    color: darkColors.outline,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  dangerCard: {
    backgroundColor: "rgba(255,180,171,0.06)",
    borderColor: "rgba(255,180,171,0.22)",
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  dangerTitle: {
    ...typography.titleMd,
    color: darkColors.error,
  },
  dangerDescription: {
    ...typography.bodySm,
    color: darkColors.onSurfaceVariant,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  dangerNotice: {
    backgroundColor: "rgba(255,180,171,0.08)",
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  dangerNoticeText: {
    ...typography.bodySm,
    color: darkColors.onSurfaceVariant,
    lineHeight: 20,
  },
  passwordInput: {
    ...typography.bodyLg,
    backgroundColor: darkColors.surfaceContainerHigh,
    borderColor: darkColors.outlineVariant,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: darkColors.onSurface,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
