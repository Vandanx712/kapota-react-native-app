import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, KeyRound, RotateCcw, ShieldCheck } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function OtpVerificationScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const {
    isLoading,
    pendingSignupData,
    requestSignupOtp,
    verifySignupOtp,
  } = useAuthStore();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input on mount
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const emailDisplay = pendingSignupData?.email ?? "your email address";

  const handleOtpChange = (val: string) => {
    // Only numbers, max 6 digits
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(cleaned);

    // Auto verify when 6 digits entered
    if (cleaned.length === 6 && pendingSignupData) {
      void handleVerify(cleaned);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otp;
    if (code.length < 6) {
      showErrorToast("Please enter all 6 digits of the code");
      return;
    }

    if (!pendingSignupData) {
      showErrorToast("Signup session expired. Please start again.");
      router.replace("/(auth)/signup");
      return;
    }

    const fullname = `${pendingSignupData.firstname} ${pendingSignupData.lastname}`.trim();

    await verifySignupOtp({
      fullname,
      email: pendingSignupData.email,
      password: pendingSignupData.password,
      gender: pendingSignupData.gender,
      location: pendingSignupData.location!,
      otp: code,
    });
  };

  const handleResend = async () => {
    if (!canResend || !pendingSignupData) return;
    setCanResend(false);
    setTimer(60);
    setOtp("");

    const success = await requestSignupOtp(pendingSignupData);
    if (success) {
      showSuccessToast("A new code has been sent to your email");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            >
              <ArrowLeft size={22} color={colors.onSurface} />
            </Pressable>
          </View>

          {/* HERO */}
          <View style={styles.heroContainer}>
            <View style={[styles.iconBadge, { backgroundColor: `${colors.primaryContainer}20` }]}>
              <KeyRound size={32} color={colors.primaryContainer} />
            </View>

            <Text style={styles.screenTitle}>Verify your email</Text>

            <Text style={styles.screenSubtitle}>
              We sent a 6-digit verification code to
            </Text>
            <Text style={styles.emailHighlight}>{emailDisplay}</Text>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.changeEmailBtn, pressed && styles.pressed]}
            >
              <Text style={styles.changeEmailText}>Wrong email? Edit</Text>
            </Pressable>
          </View>

          {/* 6-DIGIT PIN BOXES */}
          <View style={styles.pinWrapper}>
            <Pressable
              style={styles.boxesRow}
              onPress={() => inputRef.current?.focus()}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const char = otp[index] ?? "";
                const isFocused = otp.length === index;

                return (
                  <View
                    key={index}
                    style={[
                      styles.digitBox,
                      isFocused && styles.digitBoxFocused,
                      Boolean(char) && styles.digitBoxFilled,
                    ]}
                  >
                    <Text style={styles.digitText}>{char}</Text>
                  </View>
                );
              })}
            </Pressable>

            {/* Hidden actual TextInput */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={6}
              caretHidden
              autoFocus
            />
          </View>

          {/* RESEND TIMER & ACTION */}
          <View style={styles.resendContainer}>
            {canResend ? (
              <Pressable
                onPress={handleResend}
                style={({ pressed }) => [styles.resendBtn, pressed && styles.pressed]}
              >
                <RotateCcw size={16} color={colors.primaryContainer} />
                <Text style={styles.resendActiveText}>Resend code</Text>
              </Pressable>
            ) : (
              <Text style={styles.timerText}>
                Resend code in{" "}
                <Text style={{ color: colors.onSurface, fontWeight: "700" }}>
                  0:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </Text>
            )}
          </View>

          {/* VERIFY BUTTON */}
          <View style={styles.submitContainer}>
            <PrimaryButton
              label="Verify & Complete"
              variant="primary"
              loading={isLoading}
              disabled={otp.length < 6}
              onPress={() => void handleVerify()}
              fullWidth
            />
          </View>

          {/* SECURITY BADGE */}
          <View style={styles.securityFooter}>
            <ShieldCheck size={14} color={colors.outline} />
            <Text style={styles.securityText}>Secure two-factor verification</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    headerRow: {
      height: 48,
      justifyContent: "center",
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
    },
    heroContainer: {
      alignItems: "center",
      marginTop: spacing.md,
      marginBottom: spacing.xl,
    },
    iconBadge: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    screenTitle: {
      ...typography.headlineLgMobile,
      fontWeight: "800",
      color: colors.onSurface,
      textAlign: "center",
    },
    screenSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      textAlign: "center",
      marginTop: 8,
    },
    emailHighlight: {
      ...typography.bodySm,
      color: colors.onSurface,
      fontWeight: "700",
      marginTop: 2,
      textAlign: "center",
    },
    changeEmailBtn: {
      marginTop: 6,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    changeEmailText: {
      ...typography.labelMd,
      color: colors.primaryContainer,
      fontWeight: "600",
    },
    pinWrapper: {
      alignItems: "center",
      position: "relative",
      marginVertical: spacing.md,
    },
    boxesRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.xs,
      width: "100%",
    },
    digitBox: {
      width: 48,
      height: 56,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    digitBoxFocused: {
      borderColor: colors.primaryContainer,
      backgroundColor: `${colors.primaryContainer}10`,
    },
    digitBoxFilled: {
      borderColor: colors.onSurfaceVariant,
    },
    digitText: {
      ...typography.titleMd,
      color: colors.onSurface,
      fontWeight: "800",
    },
    hiddenInput: {
      position: "absolute",
      opacity: 0.01,
      width: 1,
      height: 1,
    },
    resendContainer: {
      alignItems: "center",
      marginTop: spacing.lg,
      marginBottom: spacing.lg,
    },
    timerText: {
      ...typography.bodySm,
      color: colors.outline,
    },
    resendBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainerHigh,
    },
    resendActiveText: {
      ...typography.labelMd,
      color: colors.primaryContainer,
      fontWeight: "700",
    },
    submitContainer: {
      marginTop: spacing.sm,
    },
    securityFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: spacing.xl,
    },
    securityText: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.outline,
    },
    pressed: {
      opacity: 0.7,
    },
  });
