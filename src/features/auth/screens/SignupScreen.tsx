import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
} from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radius, spacing, typography } from "@/theme/tokens";
import { signupSchema, SignupFormData } from "../validation/authScreen";
import { useAuthStore } from "../store/auth.store";
import { PrimaryButton } from "@/shared/ui/PrimaryButton";
import { KapotaLogo } from "../components/KapotaLogo";
import { locationService } from "@/services/location/locationService";
import { showErrorToast } from "@/utils/toast";

export default function SignupScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);

  const { isLoading, requestSignupOtp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      gender: "male",
      location: undefined,
    },
  });

  const selectedGender = watch("gender");

  const detectLocation = useCallback(async (isManual = false) => {
    setIsFetchingLocation(true);
    setLocationError(null);
    try {
      const result = await locationService.getCurrentLocation(isManual);
      if (result.success && result.coords) {
        setValue("location", result.coords);
        setLocationAddress(
          result.address ||
            `${result.coords.lat.toFixed(4)}, ${result.coords.lng.toFixed(4)}`
        );
        return result.coords;
      } else {
        const err = result.error || "Could not detect location";
        setLocationError(err);
        if (isManual) showErrorToast(err);
        return null;
      }
    } catch {
      const err = "Failed to access device location";
      setLocationError(err);
      if (isManual) showErrorToast(err);
      return null;
    } finally {
      setIsFetchingLocation(false);
    }
  }, [setValue]);

  useEffect(() => {
    void detectLocation(false);
  }, [detectLocation]);

  const onSubmit = async (data: SignupFormData) => {
    let location = data.location;
    if (!location || location.lat == null || location.lng == null) {
      const detected = await detectLocation(true);
      if (!detected) {
        showErrorToast("Location permission is required to create your account.");
        return;
      }
      data.location = detected;
    }

    const success = await requestSignupOtp(data);
    if (success) {
      router.push("/(auth)/otp");
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
          {/* HEADER ROW */}
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
            <KapotaLogo size={80} />
            <Text style={styles.screenTitle}>Create account</Text>
            <Text style={styles.screenSubtitle}>
              Sign up with your email to start communicating securely.
            </Text>
          </View>

          {/* FORM CARD */}
          <View style={styles.formCard}>
            {/* NAME ROW (FIRSTNAME & LASTNAME) */}
            <View style={styles.nameRow}>
              <View style={styles.nameCol}>
                <Text style={styles.fieldLabel}>First name</Text>
                <Controller
                  control={control}
                  name="firstname"
                  render={({ field }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        Boolean(errors.firstname) && styles.inputErrorBorder,
                      ]}
                    >
                      <TextInput
                        style={styles.inputField}
                        placeholder="John"
                        placeholderTextColor={colors.outline}
                        value={field.value}
                        onChangeText={field.onChange}
                      />
                    </View>
                  )}
                />
                {errors.firstname?.message && (
                  <Text style={styles.fieldError}>{errors.firstname.message}</Text>
                )}
              </View>

              <View style={styles.nameCol}>
                <Text style={styles.fieldLabel}>Last name</Text>
                <Controller
                  control={control}
                  name="lastname"
                  render={({ field }) => (
                    <View
                      style={[
                        styles.inputContainer,
                        Boolean(errors.lastname) && styles.inputErrorBorder,
                      ]}
                    >
                      <TextInput
                        style={styles.inputField}
                        placeholder="Doe"
                        placeholderTextColor={colors.outline}
                        value={field.value}
                        onChangeText={field.onChange}
                      />
                    </View>
                  )}
                />
                {errors.lastname?.message && (
                  <Text style={styles.fieldError}>{errors.lastname.message}</Text>
                )}
              </View>
            </View>

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
              <Text style={styles.fieldLabel}>Password</Text>
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
                      placeholder="At least 6 characters"
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

            {/* GENDER SELECTOR */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(["male", "female"] as const).map((g) => {
                  const isSelected = selectedGender === g;

                  return (
                    <Pressable
                      key={g}
                      onPress={() => setValue("gender", g)}
                      style={[
                        styles.genderPill,
                        isSelected && styles.genderPillSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          isSelected && styles.genderTextSelected,
                        ]}
                      >
                        {g === "male" ? "Male" : "Female"}
                      </Text>
                      {isSelected && (
                        <Check size={14} color={colors.onPrimary} strokeWidth={3} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
              {errors.gender?.message && (
                <Text style={styles.fieldError}>{errors.gender.message}</Text>
              )}
            </View>

            {/* LOCATION CARD */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Location</Text>
              <Pressable
                onPress={() => detectLocation(true)}
                style={[
                  styles.locationCard,
                  Boolean(locationAddress) && styles.locationCardActive,
                  Boolean(locationError && !locationAddress) && styles.locationCardError,
                ]}
              >
                <View style={styles.locationCardLeft}>
                  {isFetchingLocation ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : locationAddress ? (
                    <MapPin size={20} color={colors.primary} />
                  ) : (
                    <AlertCircle size={20} color={colors.outline} />
                  )}
                  <View style={styles.locationCardTextWrap}>
                    <Text
                      style={[
                        styles.locationCardTitle,
                        Boolean(locationAddress) && { color: colors.onSurface },
                      ]}
                      numberOfLines={1}
                    >
                      {isFetchingLocation
                        ? "Detecting your location..."
                        : locationAddress || (locationError ?? "Tap to detect location")}
                    </Text>
                    <Text style={styles.locationCardSub} numberOfLines={1}>
                      {locationAddress
                        ? "Used for nearby places & community feed"
                        : "Tap to grant GPS permission"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => detectLocation(true)}
                  disabled={isFetchingLocation}
                  style={styles.refreshLocationBtn}
                >
                  <Text style={[styles.refreshLocationText, { color: colors.primary }]}>
                    {isFetchingLocation ? "..." : locationAddress ? "Refresh" : "Enable"}
                  </Text>
                </Pressable>
              </Pressable>
            </View>

            {/* SUBMIT BUTTON */}
            <View style={styles.submitBlock}>
              <PrimaryButton
                label="Continue to verification"
                variant="primary"
                loading={isLoading || isFetchingLocation}
                onPress={handleSubmit(onSubmit)}
                fullWidth
              />
            </View>

            {/* REDIRECT TO LOGIN */}
            <View style={styles.loginRedirectRow}>
              <Text style={styles.loginRedirectPrompt}>Already have an account? </Text>
              <Pressable onPress={() => router.replace("/(auth)/login")}>
                <Text style={styles.loginRedirectLink}>Log in</Text>
              </Pressable>
            </View>
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
    brandContainer: {
      alignItems: "center",
      marginVertical: spacing.sm,
    },
    screenTitle: {
      ...typography.headlineLgMobile,
      fontWeight: "800",
      color: colors.onSurface,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    screenSubtitle: {
      ...typography.bodySm,
      color: colors.outline,
      textAlign: "center",
      marginTop: 4,
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
    nameRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    nameCol: {
      flex: 1,
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
    genderRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    genderPill: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      height: 44,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    genderPillSelected: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    genderText: {
      ...typography.bodySm,
      color: colors.outline,
      fontWeight: "600",
    },
    genderTextSelected: {
      color: colors.onPrimary,
      fontWeight: "700",
    },
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 4,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    locationCardActive: {
      borderColor: colors.primary + "60",
      backgroundColor: colors.primary + "0A",
    },
    locationCardError: {
      borderColor: colors.error + "60",
    },
    locationCardLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      flex: 1,
      marginRight: spacing.sm,
    },
    locationCardTextWrap: {
      flex: 1,
    },
    locationCardTitle: {
      ...typography.bodySm,
      fontWeight: "600",
      color: colors.onSurfaceVariant,
    },
    locationCardSub: {
      ...typography.labelMd,
      color: colors.outline,
      marginTop: 2,
    },
    refreshLocationBtn: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 4,
      borderRadius: radius.full,
      backgroundColor: colors.surfaceContainer,
    },
    refreshLocationText: {
      ...typography.labelMd,
      fontWeight: "600",
    },
    submitBlock: {
      marginTop: spacing.sm,
    },
    loginRedirectRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.lg,
    },
    loginRedirectPrompt: {
      ...typography.bodySm,
      color: colors.outline,
    },
    loginRedirectLink: {
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
    pressed: {
      opacity: 0.7,
    },
  });