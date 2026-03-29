import { z } from "zod";

// Create emotion log schema
export const createEmotionLogSchema = z.object({
  emotionLevel1Id: z
    .string()
    .uuid("L'émotion de niveau 1 est requise"),
  emotionLevel2Id: z
    .string()
    .uuid("L'émotion de niveau 2 est requise"),
  logDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
      "La date est requise"
    ),
  note: z.string().optional(),
});

// Update emotion log schema (all fields optional)
export const updateEmotionLogSchema = z.object({
  emotionLevel1Id: z
    .string()
    .uuid("L'émotion de niveau 1 est requise")
    .optional(),
  emotionLevel2Id: z
    .string()
    .uuid("L'émotion de niveau 2 est requise")
    .optional(),
  logDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
      "La date est requise"
    )
    .optional(),
  note: z.string().optional(),
});

// Inferred types
export type CreateEmotionLogInput = z.infer<typeof createEmotionLogSchema>;
export type UpdateEmotionLogInput = z.infer<typeof updateEmotionLogSchema>;
