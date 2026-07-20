import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/features/auth/components/PrimaryButton";
import { useAuthStore } from "@/features/auth/store/auth.store";
import ProfileAvatar from "@/features/profile/components/ProfileAvatar";
import ProfileField from "@/features/profile/components/ProfileField";
import {
  profileSchema,
  type ProfileFormData,
} from "@/features/profile/validation/profileSchema";
import { splitFullName } from "@/features/profile/types/profile.types";
import { ScreenWrapper } from "@/shared/components/ScreenWrapper";
import { darkColors, spacing, typography } from "@/theme/tokens";

export default function ProfileScreen() {
  const { authUser, isLoading, updateProfile } = useAuthStore();
  const { firstname, lastname } = splitFullName(authUser?.fullname);

  const [profileImageUri, setProfileImageUri] = useState<string | null>(
    authUser?.profilePic?.url ?? null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstname,
      lastname,
      email: authUser?.email ?? "",
    },
  });

  useEffect(() => {
    if (!authUser) return;

    const { firstname: first, lastname: last } = splitFullName(authUser.fullname);

    reset({
      firstname: first,
      lastname: last,
      email: authUser.email ?? "",
    });

    setProfileImageUri(authUser.profilePic?.url ?? null);
  }, [authUser, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      ...data,
      profileImageUri,
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Profile</Text>
          <Text style={styles.title}>Your Space</Text>
          <Text style={styles.subtitle}>
            Keep your details up to date so friends can find you.
          </Text>
        </View>

        <View style={styles.card}>
          <ProfileAvatar
            imageUri={profileImageUri}
            name={authUser?.fullname ?? `${firstname} ${lastname}`}
            onImageChange={setProfileImageUri}
          />

          <Controller
            control={control}
            name="firstname"
            render={({ field }) => (
              <ProfileField
                label="First Name"
                placeholder="Enter first name"
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
              <ProfileField
                label="Last Name"
                placeholder="Enter last name"
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
              <ProfileField
                label="Email"
                placeholder="Enter email"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.email?.message}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />

          <PrimaryButton
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            label="Save Changes"
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  header: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.labelMd,
    color: darkColors.primary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  title: {
    ...typography.headlineLgMobile,
    color: darkColors.onSurface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: darkColors.onSurfaceVariant,
    lineHeight: 22,
  },
  card: {
    backgroundColor: darkColors.surfaceContainer,
    borderColor: darkColors.outlineVariant,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
