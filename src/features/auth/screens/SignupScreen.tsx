import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthScreenWrapper } from "@/features/auth/components/AuthScreenWrapper";
import { PrimaryButton } from "@/features/auth/components/PrimaryButton";
import { darkColors, spacing, typography } from "@/theme/tokens";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { validateForm } from "@/utils/validators";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");

  const handleSignUp = () => {
    const validation = validateForm({
      firstName,
      lastName,
      email,
      password,
      gender,
      isForLogin: false,
    });

    if (!validation.isValid) {
      showErrorToast(validation.message || "Validation failed");
      return;
    }

    showSuccessToast("Account created successfully!");
  };

  const handleLoginRedirect = () => {
    router.replace("/(auth)/login");
  };

  return (
    <AuthScreenWrapper>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>
            Sign up to start your journey with us.
          </Text>

          <AuthInput
            placeholder="Enter firstName"
            value={firstName}
            onChangeText={setFirstName}
          />

          <AuthInput
            placeholder="Enter lastName"
            value={lastName}
            onChangeText={setLastName}
          />

          <AuthInput
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
          />
          <AuthInput
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
          />

          <PrimaryButton onPress={handleSignUp} label="Sign Up" />

          <View style={styles.signup}>
            <Text numberOfLines={1} style={styles.signupText}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={handleLoginRedirect}>
              <Text style={styles.signupLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </AuthScreenWrapper>
  );
}
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xl,
  },

  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: darkColors.outlineVariant,
  },

  title: {
    ...typography.headlineLg,
    color: darkColors.onSurface,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodySm,
    color: darkColors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },

  label: {
    ...typography.labelMd,
    color: darkColors.onSurface,
    marginBottom: spacing.sm,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
  },

  //   line: {
  //     flex: 1,
  //     height: 1,
  //     backgroundColor: darkColors.outlineVariant,
  //   },

  dividerText: {
    marginHorizontal: spacing.sm,
    color: darkColors.mutedText,
    ...typography.labelMd,
  },

  social: {
    flexDirection: "row",
  },

  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },

  signupText: {
    width: "70%",
    color: darkColors.onSurfaceVariant,
  },

  signupLink: {
    color: darkColors.primary,
    fontWeight: "600",
  },
});
