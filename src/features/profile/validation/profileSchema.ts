import { z } from "zod";

export const profileSchema = z.object({
  firstname: z
    .string()
    .min(1, "First name is required")
    .max(30, "First name is too long")
    .trim(),
  lastname: z
    .string()
    .min(1, "Last name is required")
    .max(30, "Last name is too long")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email")
    .trim()
    .toLowerCase(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
