import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});

export const signupSchema = z.object({
  firstname: z
    .string()
    .min(1, "First name is required")
    .max(30, "First name must be under 30 characters")
    .trim(),

  lastname: z
    .string()
    .min(1, "Last name is required")
    .max(30, "Last name must be under 30 characters")
    .trim(),

  gender: z
    .string()
    .min(1, "Gender is required")
    .refine((value) => ["male", "female"].includes(value), {
      message: "Please select male or female",
    }),

  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .optional()
    .nullish(),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
