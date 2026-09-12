import { useEffect, useState, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
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
  Globe,
  Key,
  Laptop,
  LogOut,
  QrCode,
  RefreshCw,
  Smartphone,
  Sparkles,
  Trash2,
  X,
  Zap,
  ZapOff,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { scanQrLoginApi } from "@/features/auth/api/authApi";
import { AppHeader } from "@/shared/ui/AppHeader";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { ConfirmationDialog } from "@/shared/ui/ConfirmationDialog";
import { EmptyState } from "@/shared/ui/EmptyState";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import dayjs from "dayjs";

export default function LinkedDevicesSectionScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    activeSessions,
    fetchActiveSessions,
    isSessionsLoading,
    isLoggingOutOthers,
    logoutOneSession,
    logoutOtherSessions,
    sessionActionId,
  } = useAuthStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [manualInputVisible, setManualInputVisible] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  const [sessionToLogout, setSessionToLogout] = useState<any | null>(null);

  const scannedLockRef = useRef(false);

  useEffect(() => {
    void fetchActiveSessions();
  }, [fetchActiveSessions]);

  const linkedDevices = useMemo(
    () => activeSessions.filter((s: any) => !s.isCurrent),
    [activeSessions],
  );

  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        showErrorToast("Camera permission required to scan QR code");
        setManualInputVisible(true);
        return;
      }
    }
    scannedLockRef.current = false;
    setScannerVisible(true);
  };

  const processQrCodeString = async (rawCode: string) => {
    const raw = rawCode.trim();
    if (!raw) {
      showErrorToast("Empty QR code");
      return;
    }

    let parsed = { requestId: "", qrToken: "" };
    try {
      if (raw.startsWith("{")) {
        const json = JSON.parse(raw);
        parsed.requestId = json.requestId || "";
        parsed.qrToken = json.qrToken || "";
      } else if (raw.includes(":")) {
        const [rId, qTok] = raw.split(":");
        parsed.requestId = rId || "";
        parsed.qrToken = qTok || "";
      } else if (raw.includes("=")) {
        // e.g. URL query params: https://web.kapota.app/login?req=...&tok=...
        const url = new URL(raw);
        parsed.requestId = url.searchParams.get("requestId") || url.searchParams.get("req") || "";
        parsed.qrToken = url.searchParams.get("qrToken") || url.searchParams.get("tok") || "";
      }
    } catch {
      // raw format fallback
      parsed.requestId = raw;
      parsed.qrToken = raw;
    }

    if (!parsed.requestId || !parsed.qrToken) {
      showErrorToast("Invalid QR code format for Kapota Web");
      return;
    }

    setIsProcessingCode(true);
    try {
      const res = await scanQrLoginApi({
        requestId: parsed.requestId,
        qrToken: parsed.qrToken,
      });
      showSuccessToast(res?.message || "Web session connected successfully!");
      setScannerVisible(false);
      setManualInputVisible(false);
      setManualCode("");
      void fetchActiveSessions();
    } catch (err: any) {
      showErrorToast(err?.response?.data?.message || "Failed to link device");
      scannedLockRef.current = false;
    } finally {
      setIsProcessingCode(false);
    }
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scannedLockRef.current || isProcessingCode) return;
    scannedLockRef.current = true;
    void processQrCodeString(data);
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      showErrorToast("Please enter the pairing token");
      return;
    }
    await processQrCodeString(manualCode);
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
      <AppHeader title="Linked Devices" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* WhatsApp Web Style Hero Section */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View
            style={[
              styles.heroIconWrap,
              { backgroundColor: colors.surfaceContainerHigh },
            ]}
          >
            <Laptop size={44} color={colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
            Use Kapota on Web & Desktop
          </Text>
          <Text
            style={[styles.heroSubtitle, { color: colors.onSurfaceVariant }]}
          >
            Open web.kapota.app on your computer and scan the QR code to link your account seamlessly.
          </Text>

          <View style={styles.heroButtonWrap}>
            <PrimaryButton
              label="Link a device"
              icon={QrCode}
              onPress={handleOpenScanner}
              fullWidth
            />
          </View>
        </View>

        {/* Device Status Banner */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
            LINKED DEVICES ({linkedDevices.length})
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

        {isSessionsLoading && linkedDevices.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : linkedDevices.length === 0 ? (
          <EmptyState
            icon={Laptop}
            title="No devices linked"
            description="Tap 'Link a device' to scan the QR code on your computer screen."
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
            {linkedDevices.map((session: any, idx: number) => {
              const DeviceIcon = getDeviceIcon(session.deviceName);
              const lastActive = session.lastUsedAt || session.createdAt;
              const formattedTime = lastActive
                ? dayjs(lastActive).format("MMM D [at] h:mm A")
                : "Active now";

              return (
                <View
                  key={session._id || idx}
                  style={[
                    styles.sessionRow,
                    idx < linkedDevices.length - 1 && {
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
                    <DeviceIcon size={22} color={colors.primary} />
                  </View>

                  <View style={styles.sessionInfo}>
                    <Text
                      numberOfLines={1}
                      style={[styles.deviceName, { color: colors.onSurface }]}
                    >
                      {session.deviceName || "Web Browser"}
                    </Text>
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
                </View>
              );
            })}
          </View>
        )}

        {/* Log Out From All Devices */}
        {linkedDevices.length > 0 && (
          <View style={styles.logoutOthersWrap}>
            <PrimaryButton
              label="Log out from all linked devices"
              variant="outline"
              loading={isLoggingOutOthers}
              onPress={async () => {
                await logoutOtherSessions();
              }}
              fullWidth
            />
          </View>
        )}
      </ScrollView>

      {/* FULL CAMERA QR SCANNER MODAL */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setScannerVisible(false)}
      >
        <View style={styles.scannerScreen}>
          {/* Real Camera View */}
          <CameraView
            style={StyleSheet.absoluteFill}
            enableTorch={torchEnabled}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
          />

          {/* Scanner Overlay UI */}
          <View style={[styles.scannerOverlay, { paddingTop: insets.top + 10 }]}>
            {/* Top Bar */}
            <View style={styles.scannerTopBar}>
              <Pressable
                onPress={() => setScannerVisible(false)}
                style={styles.scannerCircleBtn}
              >
                <X size={24} color="#FFFFFF" />
              </Pressable>

              <Text style={styles.scannerTitle}>Scan QR Code</Text>

              <Pressable
                onPress={() => setTorchEnabled((prev) => !prev)}
                style={styles.scannerCircleBtn}
              >
                {torchEnabled ? (
                  <Zap size={22} color="#FFD700" />
                ) : (
                  <ZapOff size={22} color="#FFFFFF" />
                )}
              </Pressable>
            </View>

            {/* Viewfinder Target Frame */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinderFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />

                {isProcessingCode && (
                  <View style={styles.processingWrap}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.processingText}>Linking device...</Text>
                  </View>
                )}
              </View>
              <Text style={styles.scanInstruction}>
                Point camera at the QR code on web.kapota.app
              </Text>
            </View>

            {/* Bottom Actions Bar */}
            <View style={[styles.scannerBottomBar, { paddingBottom: insets.bottom + 20 }]}>
              <Pressable
                onPress={() => {
                  setScannerVisible(false);
                  setManualInputVisible(true);
                }}
                style={styles.manualEntryBtn}
              >
                <Key size={18} color="#FFFFFF" />
                <Text style={styles.manualEntryText}>Enter pairing code manually</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MANUAL CODE FALLBACK MODAL */}
      <Modal
        visible={manualInputVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setManualInputVisible(false)}
      >
        <View style={styles.manualOverlay}>
          <View
            style={[
              styles.manualCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.manualHeader}>
              <Text style={[styles.manualHeading, { color: colors.onSurface }]}>
                Pair with code
              </Text>
              <Pressable onPress={() => setManualInputVisible(false)}>
                <X size={20} color={colors.outline} />
              </Pressable>
            </View>

            <Text
              style={[
                styles.manualDescription,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Paste the QR code token or pairing code from web.kapota.app.
            </Text>

            <TextInput
              placeholder="requestId:qrToken or JSON"
              placeholderTextColor={colors.outline}
              value={manualCode}
              onChangeText={setManualCode}
              style={[
                styles.manualInput,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant,
                },
              ]}
            />

            <View style={styles.manualActions}>
              <View style={styles.modalBtnHalf}>
                <PrimaryButton
                  label="Cancel"
                  variant="outline"
                  onPress={() => {
                    setManualInputVisible(false);
                    setManualCode("");
                  }}
                  fullWidth
                />
              </View>
              <View style={styles.modalBtnHalf}>
                <PrimaryButton
                  label="Connect"
                  loading={isProcessingCode}
                  onPress={handleManualSubmit}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disconnect Single Session Confirmation */}
      <ConfirmationDialog
        visible={Boolean(sessionToLogout)}
        title="Disconnect device?"
        message={`Are you sure you want to disconnect ${
          sessionToLogout?.deviceName || "this linked device"
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
  heroCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: "center",
    marginTop: 16,
    textAlign: "center",
  },
  heroIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 320,
  },
  heroButtonWrap: {
    width: "100%",
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
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
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
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
    marginTop: 16,
  },
  scannerScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  scannerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  scannerCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  viewfinderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  viewfinderFrame: {
    width: 260,
    height: 260,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  processingWrap: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
    borderRadius: 16,
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  scanInstruction: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 24,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  scannerBottomBar: {
    alignItems: "center",
  },
  manualEntryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  manualEntryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  manualOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  manualCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
  },
  manualHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  manualHeading: {
    fontSize: 18,
    fontWeight: "700",
  },
  manualDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  manualInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 18,
  },
  manualActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalBtnHalf: {
    flex: 1,
  },
});
