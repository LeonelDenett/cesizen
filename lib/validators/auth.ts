import { z } from "zod";

// Shared password validation schema with security rules
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

// Registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(255, "Le nom ne doit pas dépasser 255 caractères"),
  email: z
    .string()
    .email("Email invalide"),
  password: passwordSchema,
});

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis"),
});

// Password reset request schema
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .email("Email invalide"),
});

// Password reset confirm schema
export const resetPasswordConfirmSchema = z.object({
  token: z
    .string()
    .min(1, "Le token est requis"),
  password: passwordSchema,
});

// Profile update schema (all fields optional)
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(255, "Le nom ne doit pas dépasser 255 caractères")
    .optional(),
  email: z
    .string()
    .email("Email invalide")
    .optional(),
});

// Inferred types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
