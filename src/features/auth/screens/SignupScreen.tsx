import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthScreenWrapper } from "@/features/auth/components/AuthScreenWrapper";
import { PrimaryButton } from "@/features/auth/components/PrimaryButton";
import { darkColors, spacing, typography } from "@/theme/tokens";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormData, signupSchema } from "../validation/authScreen";
import { useAuthStore } from "../store/auth.store";
import { Loader } from "lucide-react-native";

export default function SignupScreen() {
  const { isLoading, signup } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = () => {};

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

          <Controller
            control={control}
            name="firstname"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter firstName"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          {errors.firstname && (
            <Text className="text-red-500 mt-1">
              {errors.firstname.message}
            </Text>
          )}
          <Controller
            control={control}
            name="lastname"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter lastName"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          {errors.lastname && (
            <Text className="text-red-500 mt-1">{errors.lastname.message}</Text>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter email"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          {errors.email && (
            <Text className="text-red-500 mt-1">{errors.email.message}</Text>
          )}

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter password"
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />

          {errors.password && (
            <Text className="text-red-500 mt-1">{errors.password.message}</Text>
          )}

          <PrimaryButton
            onPress={handleSubmit(onSubmit)}
            label={
              isLoading
                ? `${(<Loader className="h-5 w-5 animate-spin" />)} SigningUP...`
                : "Sign up"
            }
          />

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
