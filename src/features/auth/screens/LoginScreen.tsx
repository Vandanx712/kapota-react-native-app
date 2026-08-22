import { AuthScreenWrapper } from "@/features/auth/components/AuthScreenWrapper";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { PrimaryButton } from "@/features/auth/components/PrimaryButton";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing, typography } from "@/theme/tokens";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "../validation/authScreen";
import { useAuthStore } from "../store/auth.store";

export default function LoginScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const styles = createStyles(colors);
  const { isLoading, login } = useAuthStore();
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
            label="Login"
          />

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
const createStyles = (colors: ReturnType<typeof useTheme>["theme"]["colors"]) =>
  StyleSheet.create({
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
    backgroundColor: colors.surfaceContainer,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },

  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },

  subtitle: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
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
    color: colors.onSurfaceVariant,
  },

  signupLink: {
    color: colors.primary,
    fontWeight: "600",
  },
  });
