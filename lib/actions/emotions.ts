'use server';

import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emotionsLevel1, emotionsLevel2 } from '@/lib/db/schema';
import {
  createEmotionLevel1Schema,
  createEmotionLevel2Schema,
  updateEmotionSchema,
} from '@/lib/validators/emotions';

export async function createEmotion(data: {
  name: string;
  level: '1' | '2';
  emotionLevel1Id?: string;
}): Promise<{
  success: boolean;
  message?: string;
  emotion?: { id: string; name: string; isActive: boolean };
}> {
  try {
    if (data.level === '1') {
      const validated = createEmotionLevel1Schema.safeParse({ name: data.name });
      if (!validated.success) {
        return { success: false, message: 'Données invalides.' };
      }

      const [created] = await db
        .insert(emotionsLevel1)
        .values({ name: validated.data.name })
        .returning({
          id: emotionsLevel1.id,
          name: emotionsLevel1.name,
          isActive: emotionsLevel1.isActive,
        });

      return { success: true, message: 'Émotion créée avec succès.', emotion: created };
    }

    if (data.level === '2') {
      if (!data.emotionLevel1Id) {
        return { success: false, message: "L'identifiant de l'émotion de niveau 1 est requis." };
      }

      const validated = createEmotionLevel2Schema.safeParse({
        name: data.name,
        emotionLevel1Id: data.emotionLevel1Id,
      });
      if (!validated.success) {
        return { success: false, message: 'Données invalides.' };
      }

      const [created] = await db
        .insert(emotionsLevel2)
        .values({
          name: validated.data.name,
          emotionLevel1Id: validated.data.emotionLevel1Id,
        })
        .returning({
          id: emotionsLevel2.id,
          name: emotionsLevel2.name,
          isActive: emotionsLevel2.isActive,
        });

      return { success: true, message: 'Émotion créée avec succès.', emotion: created };
    }

    return { success: false, message: 'Le niveau doit être "1" ou "2".' };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}

export async function updateEmotionName(
  id: string,
  name: string,
  level: '1' | '2'
): Promise<{ success: boolean; message?: string }> {
  const validated = updateEmotionSchema.safeParse({ name });
  if (!validated.success) {
    return { success: false, message: 'Données invalides.' };
  }

  try {
    if (level === '1') {
      const [updated] = await db
        .update(emotionsLevel1)
        .set({ name: validated.data.name! })
        .where(eq(emotionsLevel1.id, id))
        .returning({ id: emotionsLevel1.id });

      if (!updated) {
        return { success: false, message: 'Émotion non trouvée.' };
      }

      return { success: true, message: 'Nom mis à jour avec succès.' };
    }

    if (level === '2') {
      const [updated] = await db
        .update(emotionsLevel2)
        .set({ name: validated.data.name! })
        .where(eq(emotionsLevel2.id, id))
        .returning({ id: emotionsLevel2.id });

      if (!updated) {
        return { success: false, message: 'Émotion non trouvée.' };
      }

      return { success: true, message: 'Nom mis à jour avec succès.' };
    }

    return { success: false, message: 'Le niveau doit être "1" ou "2".' };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}

export async function toggleEmotionActive(
  id: string,
  isActive: boolean,
  level: '1' | '2'
): Promise<{ success: boolean; message?: string }> {
  try {
    if (level === '1') {
      const [updated] = await db
        .update(emotionsLevel1)
        .set({ isActive })
        .where(eq(emotionsLevel1.id, id))
        .returning({ id: emotionsLevel1.id });

      if (!updated) {
        return { success: false, message: 'Émotion non trouvée.' };
      }

      // If deactivating a level 1, also deactivate all its level 2 children
      if (!isActive) {
        await db
          .update(emotionsLevel2)
          .set({ isActive: false })
          .where(eq(emotionsLevel2.emotionLevel1Id, id));
      }

      return { success: true, message: isActive ? 'Émotion activée.' : 'Émotion et ses sous-émotions désactivées.' };
    }

    if (level === '2') {
      const [updated] = await db
        .update(emotionsLevel2)
        .set({ isActive })
        .where(eq(emotionsLevel2.id, id))
        .returning({ id: emotionsLevel2.id });

      if (!updated) {
        return { success: false, message: 'Émotion non trouvée.' };
      }

      return { success: true, message: isActive ? 'Émotion activée.' : 'Émotion désactivée.' };
    }

    return { success: false, message: 'Le niveau doit être "1" ou "2".' };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}

export async function getAdminEmotions(): Promise<{
  success: boolean;
  emotions?: {
    id: string;
    name: string;
    isActive: boolean;
    displayOrder: number;
    level2: { id: string; name: string; isActive: boolean; displayOrder: number }[];
  }[];
  message?: string;
}> {
  try {
    const level1Emotions = await db
      .select({
        id: emotionsLevel1.id,
        name: emotionsLevel1.name,
        isActive: emotionsLevel1.isActive,
        displayOrder: emotionsLevel1.displayOrder,
      })
      .from(emotionsLevel1)
      .orderBy(asc(emotionsLevel1.displayOrder));

    const emotions = await Promise.all(
      level1Emotions.map(async (l1) => {
        const level2 = await db
          .select({
            id: emotionsLevel2.id,
            name: emotionsLevel2.name,
            isActive: emotionsLevel2.isActive,
            displayOrder: emotionsLevel2.displayOrder,
          })
          .from(emotionsLevel2)
          .where(eq(emotionsLevel2.emotionLevel1Id, l1.id))
          .orderBy(asc(emotionsLevel2.displayOrder));

        return { ...l1, level2 };
      })
    );

    return { success: true, emotions };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}
