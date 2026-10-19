import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import {
  FlipHorizontal,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { Avatar } from "@/shared/ui/Avatar";
import { useCallStore } from "../store/call.store";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function VideoCallModal() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();

  const {
    activeCall,
    incomingCall,
    isCameraOff,
    isFrontCamera,
    isMicMuted,
    acceptIncomingCall,
    declineIncomingCall,
    endCall,
    flipCamera,
    toggleCamera,
    toggleMic,
    updateActiveCall,
  } = useCallStore();

  const [callDuration, setCallDuration] = useState(0);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  useEffect(() => {
    if (activeCall && !cameraPermission?.granted) {
      void requestCameraPermission();
    }
    if (activeCall && !micPermission?.granted) {
      void requestMicPermission();
    }
  }, [activeCall, cameraPermission?.granted, micPermission?.granted, requestCameraPermission, requestMicPermission]);

  // Duration timer
  useEffect(() => {
    if (!activeCall || activeCall.phase !== "active") {
      setCallDuration(0);
      return;
    }
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeCall?.phase]);

  // Auto transition to connecting/active after short delay for demonstration
  useEffect(() => {
    if (activeCall?.phase === "ringing" || activeCall?.phase === "connecting") {
      const timer = setTimeout(() => {
        updateActiveCall({ phase: "active", startedAt: Date.now() });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [activeCall?.phase, updateActiveCall]);

  if (!activeCall && !incomingCall) return null;

  // 1. INCOMING CALL MODAL
  if (!activeCall && incomingCall) {
    const callerName = incomingCall.caller?.fullname || "Kapota User";
    const avatarUri = incomingCall.caller?.profilePic?.url;

    return (
      <Modal
        animationType="slide"
        statusBarTranslucent
        transparent
        visible={Boolean(incomingCall)}
      >
        <View style={styles.incomingOverlay}>
          <View
            style={[
              styles.incomingCard,
              {
                backgroundColor: colors.surfaceContainerHigh,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.incomingAvatarWrap}>
              <Avatar uri={avatarUri} name={callerName} size={84} />
            </View>

            <Text style={[styles.incomingName, { color: colors.onSurface }]}>
              {callerName}
            </Text>
            <Text style={[styles.incomingLabel, { color: colors.primary }]}>
              Incoming video call...
            </Text>

            <View style={styles.incomingActions}>
              <Pressable
                accessibilityLabel="Decline call"
                onPress={declineIncomingCall}
                style={[styles.callBtn, styles.declineBtn]}
              >
                <PhoneOff color="#FFFFFF" size={26} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                accessibilityLabel="Answer call"
                onPress={() => void acceptIncomingCall()}
                style={[styles.callBtn, styles.answerBtn]}
              >
                <Phone color="#FFFFFF" size={26} strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // 2. ACTIVE CALL FULLSCREEN MODAL
  const conversation = activeCall?.conversation;
  const isGroup = Boolean(conversation?.isgroup);
  const displayName = isGroup
    ? conversation?.groupdetail?.groupname ?? conversation?.name ?? "Video Call"
    : conversation?.name ?? "Video Call";
  const avatarUri = isGroup
    ? conversation?.groupdetail?.groupIcon?.url
    : conversation?.profilePic?.url;

  const phaseLabel =
    activeCall?.phase === "active"
      ? formatDuration(callDuration)
      : activeCall?.phase === "ringing"
        ? "Ringing..."
        : activeCall?.phase === "connecting"
          ? "Connecting..."
          : activeCall?.phase === "preparing"
            ? "Preparing..."
            : "Calling...";

  return (
    <Modal
      animationType="fade"
      statusBarTranslucent
      visible={Boolean(activeCall)}
    >
      <View style={styles.fullScreen}>
        {/* Background / Camera view */}
        {!isCameraOff && cameraPermission?.granted ? (
          <CameraView
            facing={isFrontCamera ? "front" : "back"}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.surfaceContainerLowest },
            ]}
          />
        )}

        {/* Gradient dark scrim for visibility */}
        <View style={styles.darkScrim} />

        {/* Header with Title and Timer */}
        <View
          style={[
            styles.callHeader,
            { paddingTop: Math.max(insets.top, 24) + 12 },
          ]}
        >
          <Text style={styles.callerTitle} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.statusSubtitle}>{phaseLabel}</Text>
        </View>

        {/* Center avatar if camera is off or call is ringing */}
        {(isCameraOff || activeCall?.phase !== "active") && (
          <View style={styles.centerSection}>
            <View style={styles.bigAvatarPulse}>
              <Avatar uri={avatarUri} name={displayName} size={110} />
            </View>
            <Text style={styles.callStateNotice}>
              {activeCall?.phase === "active" ? "Camera is off" : phaseLabel}
            </Text>
          </View>
        )}

        {/* Bottom controls bar */}
        <View
          style={[
            styles.controlsBar,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
        >
          {/* Mute mic */}
          <Pressable
            accessibilityLabel={isMicMuted ? "Unmute mic" : "Mute mic"}
            onPress={toggleMic}
            style={[
              styles.controlBtn,
              isMicMuted && styles.controlBtnActive,
            ]}
          >
            {isMicMuted ? (
              <MicOff color="#FFFFFF" size={22} strokeWidth={2.4} />
            ) : (
              <Mic color="#FFFFFF" size={22} strokeWidth={2.4} />
            )}
          </Pressable>

          {/* Toggle camera */}
          <Pressable
            accessibilityLabel={isCameraOff ? "Turn on camera" : "Turn off camera"}
            onPress={toggleCamera}
            style={[
              styles.controlBtn,
              isCameraOff && styles.controlBtnActive,
            ]}
          >
            {isCameraOff ? (
              <VideoOff color="#FFFFFF" size={22} strokeWidth={2.4} />
            ) : (
              <Video color="#FFFFFF" size={22} strokeWidth={2.4} />
            )}
          </Pressable>

          {/* Flip camera */}
          {!isCameraOff && (
            <Pressable
              accessibilityLabel="Flip camera"
              onPress={flipCamera}
              style={styles.controlBtn}
            >
              <FlipHorizontal color="#FFFFFF" size={22} strokeWidth={2.4} />
            </Pressable>
          )}

          {/* End call button */}
          <Pressable
            accessibilityLabel="End call"
            onPress={() => endCall("ended")}
            style={[styles.controlBtn, styles.endCallBtn]}
          >
            <PhoneOff color="#FFFFFF" size={26} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    backgroundColor: "#0D1117",
    flex: 1,
    justifyContent: "space-between",
  },
  darkScrim: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  callHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  callerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  statusSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  centerSection: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  bigAvatarPulse: {
    alignItems: "center",
    borderRadius: 70,
    borderWidth: 3,
    borderColor: "rgba(91, 76, 240, 0.6)",
    justifyContent: "center",
    padding: 6,
  },
  callStateNotice: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
  },
  controlsBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 10,
  },
  controlBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderRadius: 30,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  controlBtnActive: {
    backgroundColor: "rgba(239, 68, 68, 0.85)",
  },
  endCallBtn: {
    backgroundColor: "#EF4444",
    height: 62,
    width: 62,
  },
  incomingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  incomingCard: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: "100%",
  },
  incomingAvatarWrap: {
    marginBottom: 16,
  },
  incomingName: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  incomingLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  incomingActions: {
    flexDirection: "row",
    gap: 48,
    marginTop: 32,
  },
  callBtn: {
    alignItems: "center",
    borderRadius: 34,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  answerBtn: {
    backgroundColor: "#10B981",
  },
  declineBtn: {
    backgroundColor: "#EF4444",
  },
});
