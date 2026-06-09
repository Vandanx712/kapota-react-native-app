import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invaild email")
    .trim()
    .toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});

export const signupSchema = z.object({
  firstname: z
    .string()
    .min(1, "Firstname is required")
    .max(7, "Firstname is so long")
    .trim(),

  lastname: z
    .string()
    .min(1, "Firstname is required")
    .max(7, "Firstname is so long")
    .trim(),

  gender: z
  .string()
  .min(1, "Gender is required")
  .refine(
    value => ["male", "female"].includes(value),
    {
      message: "Invalid gender",
    }
  ),

  location: z.object().optional().nullish(),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invaild email")
    .trim()
    .toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").trim(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
