import { AuthScreenWrapper } from "@/features/auth/components/AuthScreenWrapper";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { PrimaryButton } from "@/features/auth/components/PrimaryButton";
import { darkColors, spacing, typography } from "@/theme/tokens";
import { validateForm } from "@/utils/validators";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    const validation = validateForm({
      email,
      password,
      isForLogin: true,
    });

    if (!validation.isValid) {
      showErrorToast(validation.message || "Validation failed");
      return;
    }

    showSuccessToast("Login successful!");
    console.log("Login with:", { email, password });
  };

  const handleSignUpRedirect = () => {
    router.replace("/(auth)/signup");
  };

  return (
    <AuthScreenWrapper>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Enter your email or password to continue your journey.
          </Text>

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

          <PrimaryButton onPress={handleSubmit} label="Login" />

          <View style={styles.signup}>
            <Text numberOfLines={1} style={styles.signupText}>
              New to Kapota?
            </Text>
            <TouchableOpacity onPress={handleSignUpRedirect}>
              <Text style={styles.signupLink}>Join the flock</Text>
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

  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
  },

  signupText: {
    width: "42%",
    color: darkColors.onSurfaceVariant,
  },

  signupLink: {
    color: darkColors.primary,
    fontWeight: "600",
  },
});
