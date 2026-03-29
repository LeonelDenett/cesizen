import { z } from "zod";

// Create info page schema
export const createInfoPageSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne doit pas dépasser 255 caractères"),
  content: z
    .string()
    .min(1, "Le contenu est requis"),
  status: z.enum(["published", "draft"]),
});

// Update info page schema (all fields optional)
export const updateInfoPageSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne doit pas dépasser 255 caractères")
    .optional(),
  content: z
    .string()
    .min(1, "Le contenu est requis")
    .optional(),
  status: z.enum(["published", "draft"]).optional(),
});

// Update menu schema
export const updateMenuSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().optional(),
      label: z.string().min(1, "Le label est requis"),
      pageId: z.string().uuid("L'identifiant de page est invalide"),
      order: z.number().min(0, "L'ordre doit être positif ou zéro"),
    })
  ),
});

// Inferred types
export type CreateInfoPageInput = z.infer<typeof createInfoPageSchema>;
export type UpdateInfoPageInput = z.infer<typeof updateInfoPageSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;
