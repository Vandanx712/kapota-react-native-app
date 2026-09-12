import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { loginSchema, LoginFormData } from "../validation/authScreen";
import { useAuthStore } from "../store/auth.store";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { KapotaLogo } from "../components/KapotaLogo";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export default function LoginScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const {
    isLoading,
    login,
    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  const handleRequestForgotOtp = async () => {
    if (!forgotEmail.trim()) {
      showErrorToast("Please enter your email address");
      return;
    }
    setIsForgotLoading(true);
    try {
      await requestForgotPasswordOtp({ email: forgotEmail.trim() });
      setForgotStep("verify");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp.trim()) {
      showErrorToast("Please enter the 6-digit OTP");
      return;
    }
    if (newPassword.length < 6) {
      showErrorToast("New password must be at least 6 characters");
      return;
    }
    setIsForgotLoading(true);
    try {
      await verifyForgotPasswordOtp({
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        password: newPassword.trim(),
      });
      setForgotModalOpen(false);
      setForgotStep("request");
      setForgotOtp("");
      setNewPassword("");
      showSuccessToast("Password reset successfully. You can now log in.");
    } finally {
      setIsForgotLoading(false);
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
          {/* TOP HEADER */}
          <View style={styles.headerRow}>
            {router.canGoBack() && (
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              >
                <ArrowLeft size={22} color={colors.onSurface} />
              </Pressable>
            )}
          </View>

          {/* BRAND HERO */}
          <View style={styles.brandContainer}>
            <KapotaLogo size={88} />
            <Text style={styles.screenTitle}>Welcome back</Text>
            <Text style={styles.screenSubtitle}>
              Log in to your Kapota account to resume your conversations and connect with friends.
            </Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {/* EMAIL INPUT */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Email address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      Boolean(errors.email) && styles.inputErrorBorder,
                    ]}
                  >
                    <Mail size={18} color={colors.outline} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="name@example.com"
                      placeholderTextColor={colors.outline}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={field.value}
                      onChangeText={field.onChange}
                    />
                  </View>
                )}
              />
              {errors.email?.message && (
                <Text style={styles.fieldError}>{errors.email.message}</Text>
              )}
            </View>

            {/* PASSWORD INPUT */}
            <View style={styles.fieldBlock}>
              <View style={styles.passwordHeaderRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                <Pressable
                  onPress={() => {
                    setForgotModalOpen(true);
                    setForgotStep("request");
                  }}
                >
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </Pressable>
              </View>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <View
                    style={[
                      styles.inputContainer,
                      Boolean(errors.password) && styles.inputErrorBorder,
                    ]}
                  >
                    <Lock size={18} color={colors.outline} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.outline}
                      secureTextEntry={!showPassword}
                      value={field.value}
                      onChangeText={field.onChange}
                    />
                    <Pressable
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.eyeBtn}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={colors.outline} />
                      ) : (
                        <Eye size={18} color={colors.outline} />
                      )}
                    </Pressable>
                  </View>
                )}
              />
              {errors.password?.message && (
                <Text style={styles.fieldError}>{errors.password.message}</Text>
              )}
            </View>

            {/* SUBMIT BUTTON */}
            <View style={styles.submitBlock}>
              <PrimaryButton
                label="Log in"
                variant="primary"
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
                fullWidth
              />
            </View>

            {/* SWITCH TO SIGNUP */}
            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Don't have an account? </Text>
              <Pressable onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLink}>Sign up</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FORGOT PASSWORD MODAL */}
      <Modal
        visible={forgotModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setForgotModalOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setForgotModalOpen(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalDragBar} />
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Pressable onPress={() => setForgotModalOpen(false)}>
                  <X size={20} color={colors.outline} />
                </Pressable>
              </View>
            </View>

            {forgotStep === "request" ? (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  Enter your registered account email to receive a 6-digit verification code.
                </Text>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Email address</Text>
                  <View style={styles.inputContainer}>
                    <Mail size={18} color={colors.outline} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="name@example.com"
                      placeholderTextColor={colors.outline}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                    />
                  </View>
                </View>

                <PrimaryButton
                  label="Send verification code"
                  variant="primary"
                  loading={isForgotLoading}
                  onPress={handleRequestForgotOtp}
                  fullWidth
                />
              </View>
            ) : (
              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>
                  We sent a code to <Text style={{ color: colors.onSurface, fontWeight: "700" }}>{forgotEmail}</Text>. Enter the code and set your new password.
                </Text>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>Verification code (OTP)</Text>
                  <View style={styles.inputContainer}>
                    <KeyRound size={18} color={colors.outline} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={colors.outline}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={forgotOtp}
                      onChangeText={setForgotOtp}
                    />
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>New password</Text>
                  <View style={styles.inputContainer}>
                    <Lock size={18} color={colors.outline} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={colors.outline}
                      secureTextEntry
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </View>

                <PrimaryButton
                  label="Reset password & verify"
                  variant="primary"
                  loading={isForgotLoading}
                  onPress={handleVerifyForgotOtp}
                  fullWidth
                />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    brandContainer: {
      alignItems: "center",
      marginVertical: spacing.md,
    },
    screenTitle: {
      ...typography.headlineLgMobile,
      fontWeight: "800",
      color: colors.onSurface,
      marginTop: spacing.sm,
      textAlign: "center",
    },
    screenSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
      maxWidth: 320,
    },
    formCard: {
      backgroundColor: colors.surfaceContainer,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      padding: spacing.lg,
      marginTop: spacing.sm,
    },
    fieldBlock: {
      marginBottom: spacing.md,
    },
    fieldLabel: {
      ...typography.labelMd,
      color: colors.onSurface,
      fontWeight: "600",
      marginBottom: 6,
    },
    passwordHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    forgotLink: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.primaryContainer,
      fontWeight: "600",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      paddingHorizontal: spacing.md,
      height: 50,
    },
    inputErrorBorder: {
      borderColor: colors.error,
    },
    inputField: {
      flex: 1,
      ...typography.bodySm,
      color: colors.onSurface,
      paddingVertical: 0,
    },
    eyeBtn: {
      padding: 4,
    },
    fieldError: {
      ...typography.bodySm,
      fontSize: 12,
      color: colors.error,
      marginTop: 4,
    },
    submitBlock: {
      marginTop: spacing.sm,
    },
    signupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.lg,
    },
    signupPrompt: {
      ...typography.bodySm,
      color: colors.outline,
    },
    signupLink: {
      ...typography.bodySm,
      color: colors.primaryContainer,
      fontWeight: "700",
    },
    encryptionFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: spacing.xl,
    },
    encryptionText: {
      ...typography.labelMd,
      fontSize: 11,
      color: colors.outline,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "flex-end",
    },
    modalSheet: {
      backgroundColor: colors.surfaceContainer,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    modalHeader: {
      alignItems: "center",
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    modalDragBar: {
      width: 36,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.outlineVariant,
      marginBottom: spacing.sm,
    },
    modalTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    modalTitle: {
      ...typography.titleMd,
      fontWeight: "700",
      color: colors.onSurface,
    },
    modalBody: {
      marginTop: spacing.sm,
    },
    modalSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      lineHeight: 19,
      marginBottom: spacing.md,
    },
    pressed: {
      opacity: 0.7,
    },
  });
