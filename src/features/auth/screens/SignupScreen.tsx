import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthScreenWrapper } from "@/features/auth/components/AuthScreenWrapper";
import { PrimaryButton } from "@/features/auth/components/PrimaryButton";
import { darkColors, spacing, typography } from "@/theme/tokens";
import { router } from "expo-router";
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

export default function SignupScreen() {
  const { isLoading, requestSignupOtp } = useAuthStore();
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

  const onSubmit = (data: SignupFormData) => {
    requestSignupOtp(data);
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

          <Controller
            control={control}
            name="firstname"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter firstName"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.firstname?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lastname"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter lastName"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.lastname?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter email"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <AuthInput
                placeholder="Enter password"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.password?.message}
              />
            )}
          />

          <PrimaryButton
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            label="Sign up"
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
