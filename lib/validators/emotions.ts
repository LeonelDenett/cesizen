import { z } from "zod";

// Create emotion level 1 schema
export const createEmotionLevel1Schema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
});

// Create emotion level 2 schema
export const createEmotionLevel2Schema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  emotionLevel1Id: z
    .string()
    .uuid("L'identifiant de l'émotion de niveau 1 est invalide"),
});

// Update emotion schema (level 1 or level 2)
export const updateEmotionSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne doit pas dépasser 100 caractères")
    .optional(),
  isActive: z.boolean().optional(),
});

// Inferred types
export type CreateEmotionLevel1Input = z.infer<typeof createEmotionLevel1Schema>;
export type CreateEmotionLevel2Input = z.infer<typeof createEmotionLevel2Schema>;
export type UpdateEmotionInput = z.infer<typeof updateEmotionSchema>;
