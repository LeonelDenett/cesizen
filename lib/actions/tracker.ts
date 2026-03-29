'use server';

import { eq, and, desc, count, gte, lte, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emotionLogs, emotionsLevel1, emotionsLevel2 } from '@/lib/db/schema';
import { createEmotionLogSchema, updateEmotionLogSchema } from '@/lib/validators/tracker';
import type { CreateEmotionLogInput, UpdateEmotionLogInput } from '@/lib/validators/tracker';

export async function getTrackerEntries(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  try {
    const offset = (page - 1) * limit;

    const [totalResult] = await db
      .select({ count: count() })
      .from(emotionLogs)
      .where(eq(emotionLogs.userId, userId));

    const total = totalResult.count;
    const totalPages = Math.ceil(total / limit);

    const entries = await db
      .select({
        id: emotionLogs.id,
        emotionLevel1Id: emotionLogs.emotionLevel1Id,
        emotionLevel2Id: emotionLogs.emotionLevel2Id,
        logDate: emotionLogs.logDate,
        note: emotionLogs.note,
        createdAt: emotionLogs.createdAt,
      })
      .from(emotionLogs)
      .where(eq(emotionLogs.userId, userId))
      .orderBy(desc(emotionLogs.logDate))
      .limit(limit)
      .offset(offset);

    return { success: true, entries, total, page, totalPages };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.', entries: [], total: 0, page, totalPages: 0 };
  }
}

export async function createTrackerEntry(
  userId: string,
  data: CreateEmotionLogInput
) {
  const validated = createEmotionLogSchema.safeParse(data);

  if (!validated.success) {
    return { success: false, message: 'Données invalides.' };
  }

  const { emotionLevel1Id, emotionLevel2Id, logDate, note } = validated.data;

  try {
    // Verify emotion level 1 exists and is active
    const [level1] = await db
      .select({ id: emotionsLevel1.id })
      .from(emotionsLevel1)
      .where(and(eq(emotionsLevel1.id, emotionLevel1Id), eq(emotionsLevel1.isActive, true)))
      .limit(1);

    if (!level1) {
      return { success: false, message: "L'émotion de niveau 1 est invalide." };
    }

    // Verify emotion level 2 exists, is active, and belongs to level 1
    const [level2] = await db
      .select({ id: emotionsLevel2.id })
      .from(emotionsLevel2)
      .where(
        and(
          eq(emotionsLevel2.id, emotionLevel2Id),
          eq(emotionsLevel2.emotionLevel1Id, emotionLevel1Id),
          eq(emotionsLevel2.isActive, true)
        )
      )
      .limit(1);

    if (!level2) {
      return { success: false, message: "L'émotion de niveau 2 est invalide ou n'appartient pas à l'émotion de niveau 1 sélectionnée." };
    }

    const [entry] = await db
      .insert(emotionLogs)
      .values({
        userId,
        emotionLevel1Id,
        emotionLevel2Id,
        logDate: new Date(logDate),
        note: note || null,
      })
      .returning({
        id: emotionLogs.id,
        emotionLevel1Id: emotionLogs.emotionLevel1Id,
        emotionLevel2Id: emotionLogs.emotionLevel2Id,
        logDate: emotionLogs.logDate,
        note: emotionLogs.note,
        createdAt: emotionLogs.createdAt,
      });

    return { success: true, entry };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}

export async function updateTrackerEntry(
  userId: string,
  entryId: string,
  data: UpdateEmotionLogInput
) {
  const validated = updateEmotionLogSchema.safeParse(data);

  if (!validated.success) {
    return { success: false, message: 'Données invalides.' };
  }

  try {
    // Verify ownership
    const [existing] = await db
      .select({
        id: emotionLogs.id,
        userId: emotionLogs.userId,
        createdAt: emotionLogs.createdAt,
      })
      .from(emotionLogs)
      .where(eq(emotionLogs.id, entryId))
      .limit(1);

    if (!existing) {
      return { success: false, message: 'Entrée non trouvée.' };
    }

    if (existing.userId !== userId) {
      return { success: false, message: 'Accès interdit.', status: 403 };
    }

    const { emotionLevel1Id, emotionLevel2Id, logDate, note } = validated.data;

    // If updating emotions, verify they exist and level2 belongs to level1
    const effectiveLevel1Id = emotionLevel1Id;
    const effectiveLevel2Id = emotionLevel2Id;

    if (effectiveLevel1Id) {
      const [level1] = await db
        .select({ id: emotionsLevel1.id })
        .from(emotionsLevel1)
        .where(and(eq(emotionsLevel1.id, effectiveLevel1Id), eq(emotionsLevel1.isActive, true)))
        .limit(1);

      if (!level1) {
        return { success: false, message: "L'émotion de niveau 1 est invalide." };
      }
    }

    if (effectiveLevel2Id && effectiveLevel1Id) {
      const [level2] = await db
        .select({ id: emotionsLevel2.id })
        .from(emotionsLevel2)
        .where(
          and(
            eq(emotionsLevel2.id, effectiveLevel2Id),
            eq(emotionsLevel2.emotionLevel1Id, effectiveLevel1Id),
            eq(emotionsLevel2.isActive, true)
          )
        )
        .limit(1);

      if (!level2) {
        return { success: false, message: "L'émotion de niveau 2 est invalide ou n'appartient pas à l'émotion de niveau 1 sélectionnée." };
      }
    }

    // Build update data — preserve createdAt
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (emotionLevel1Id !== undefined) updateData.emotionLevel1Id = emotionLevel1Id;
    if (emotionLevel2Id !== undefined) updateData.emotionLevel2Id = emotionLevel2Id;
    if (logDate !== undefined) updateData.logDate = new Date(logDate);
    if (note !== undefined) updateData.note = note || null;

    const [updated] = await db
      .update(emotionLogs)
      .set(updateData)
      .where(eq(emotionLogs.id, entryId))
      .returning({
        id: emotionLogs.id,
        emotionLevel1Id: emotionLogs.emotionLevel1Id,
        emotionLevel2Id: emotionLogs.emotionLevel2Id,
        logDate: emotionLogs.logDate,
        note: emotionLogs.note,
        createdAt: emotionLogs.createdAt,
        updatedAt: emotionLogs.updatedAt,
      });

    return { success: true, entry: updated };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}

export async function deleteTrackerEntry(
  userId: string,
  entryId: string
) {
  try {
    // Verify ownership
    const [existing] = await db
      .select({
        id: emotionLogs.id,
        userId: emotionLogs.userId,
      })
      .from(emotionLogs)
      .where(eq(emotionLogs.id, entryId))
      .limit(1);

    if (!existing) {
      return { success: false, message: 'Entrée non trouvée.' };
    }

    if (existing.userId !== userId) {
      return { success: false, message: 'Accès interdit.', status: 403 };
    }

    await db.delete(emotionLogs).where(eq(emotionLogs.id, entryId));

    return { success: true, message: 'Entrée supprimée avec succès.' };
  } catch {
    return { success: false, message: 'Une erreur est survenue. Veuillez réessayer.' };
  }
}

export function getDateRangeForPeriod(
  period: "week" | "month" | "quarter" | "year",
  referenceDate?: Date
): { startDate: Date; endDate: Date } {
  const ref = referenceDate ? new Date(referenceDate) : new Date();

  switch (period) {
    case "week": {
      const day = ref.getDay();
      // getDay(): 0=Sunday, 1=Monday... We want Monday as start
      const diffToMonday = day === 0 ? 6 : day - 1;
      const startDate = new Date(ref);
      startDate.setDate(ref.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      return { startDate, endDate };
    }
    case "month": {
      const startDate = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
      const endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
    case "quarter": {
      const quarter = Math.floor(ref.getMonth() / 3);
      const startMonth = quarter * 3;
      const startDate = new Date(ref.getFullYear(), startMonth, 1, 0, 0, 0, 0);
      const endDate = new Date(ref.getFullYear(), startMonth + 3, 0, 23, 59, 59, 999);
      return { startDate, endDate };
    }
    case "year": {
      const startDate = new Date(ref.getFullYear(), 0, 1, 0, 0, 0, 0);
      const endDate = new Date(ref.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    }
  }
}

export async function getEmotionReport(
  userId: string,
  period: "week" | "month" | "quarter" | "year"
) {
  const { startDate, endDate } = getDateRangeForPeriod(period);

  try {
    // Fetch all entries in the date range for this user
    const entries = await db
      .select({
        emotionLevel1Id: emotionLogs.emotionLevel1Id,
        emotionLevel2Id: emotionLogs.emotionLevel2Id,
      })
      .from(emotionLogs)
      .where(
        and(
          eq(emotionLogs.userId, userId),
          gte(emotionLogs.logDate, startDate),
          lte(emotionLogs.logDate, endDate)
        )
      );

    if (entries.length === 0) {
      return {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        distribution: [],
        totalEntries: 0,
      };
    }

    // Group by emotionLevel1Id
    const level1Groups = new Map<string, { count: number; level2Counts: Map<string, number> }>();

    for (const entry of entries) {
      const group = level1Groups.get(entry.emotionLevel1Id);
      if (group) {
        group.count++;
        group.level2Counts.set(
          entry.emotionLevel2Id,
          (group.level2Counts.get(entry.emotionLevel2Id) || 0) + 1
        );
      } else {
        const level2Counts = new Map<string, number>();
        level2Counts.set(entry.emotionLevel2Id, 1);
        level1Groups.set(entry.emotionLevel1Id, { count: 1, level2Counts });
      }
    }

    // Fetch emotion names for all referenced level1 and level2 ids
    const level1Ids = Array.from(level1Groups.keys());
    const allLevel2Ids = new Set<string>();
    for (const group of level1Groups.values()) {
      for (const id of group.level2Counts.keys()) {
        allLevel2Ids.add(id);
      }
    }

    const level1Records = await db
      .select({ id: emotionsLevel1.id, name: emotionsLevel1.name })
      .from(emotionsLevel1)
      .where(inArray(emotionsLevel1.id, level1Ids));

    const level1NameMap = new Map<string, string>();
    for (const r of level1Records) {
      level1NameMap.set(r.id, r.name);
    }

    const level2Ids = Array.from(allLevel2Ids);
    const level2Records = level2Ids.length > 0
      ? await db
          .select({ id: emotionsLevel2.id, name: emotionsLevel2.name })
          .from(emotionsLevel2)
          .where(inArray(emotionsLevel2.id, level2Ids))
      : [];

    const level2NameMap = new Map<string, string>();
    for (const r of level2Records) {
      level2NameMap.set(r.id, r.name);
    }

    // Build distribution
    const distribution = Array.from(level1Groups.entries()).map(([level1Id, group]) => {
      // Find top level2
      let topLevel2: { id: string; name: string; count: number } | null = null;
      let maxCount = 0;
      for (const [level2Id, l2Count] of group.level2Counts.entries()) {
        if (l2Count > maxCount) {
          maxCount = l2Count;
          topLevel2 = {
            id: level2Id,
            name: level2NameMap.get(level2Id) || level2Id,
            count: l2Count,
          };
        }
      }

      return {
        emotionLevel1: {
          id: level1Id,
          name: level1NameMap.get(level1Id) || level1Id,
          count: group.count,
          topLevel2,
        },
      };
    });

    // Sort by count descending
    distribution.sort((a, b) => b.emotionLevel1.count - a.emotionLevel1.count);

    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      distribution,
      totalEntries: entries.length,
    };
  } catch {
    return {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      distribution: [],
      totalEntries: 0,
    };
  }
}
