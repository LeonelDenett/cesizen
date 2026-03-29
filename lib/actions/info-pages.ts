'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { infoPages, menuItems } from '@/lib/db/schema';
import { createInfoPageSchema, updateInfoPageSchema, updateMenuSchema } from '@/lib/validators/info-pages';
import type { CreateInfoPageInput, UpdateInfoPageInput, UpdateMenuInput } from '@/lib/validators/info-pages';

import { generateSlug } from '@/lib/utils';

export async function createInfoPage(
  data: CreateInfoPageInput
): Promise<{ success: boolean; message?: string; page?: { id: string; title: string; slug: string; status: string; updatedAt: Date } }> {
  const validated = createInfoPageSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      message: 'Données invalides.',
    };
  }

  const { title, content, status } = validated.data;
  const slug = generateSlug(title);

  try {
    // Check slug uniqueness
    const existing = await db
      .select({ id: infoPages.id })
      .from(infoPages)
      .where(eq(infoPages.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: 'Une page avec un slug similaire existe déjà.',
      };
    }

    const [created] = await db
      .insert(infoPages)
      .values({
        title,
        slug,
        content,
        status,
      })
      .returning({
        id: infoPages.id,
        title: infoPages.title,
        slug: infoPages.slug,
        status: infoPages.status,
        updatedAt: infoPages.updatedAt,
      });

    return {
      success: true,
      message: 'Page créée avec succès.',
      page: created,
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function updateInfoPage(
  id: string,
  data: UpdateInfoPageInput
): Promise<{ success: boolean; message?: string; page?: { id: string; title: string; slug: string; content: string; status: string; updatedAt: Date } }> {
  const validated = updateInfoPageSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      message: 'Données invalides.',
    };
  }

  try {
    // Check page exists
    const existing = await db
      .select({ id: infoPages.id })
      .from(infoPages)
      .where(eq(infoPages.id, id))
      .limit(1);

    if (existing.length === 0) {
      return {
        success: false,
        message: 'Page non trouvée.',
      };
    }

    const updateData: Record<string, string | Date> = {
      updatedAt: new Date(),
    };

    if (validated.data.title !== undefined) {
      updateData.title = validated.data.title;
      updateData.slug = generateSlug(validated.data.title);
    }
    if (validated.data.content !== undefined) {
      updateData.content = validated.data.content;
    }
    if (validated.data.status !== undefined) {
      updateData.status = validated.data.status;
    }

    const [updated] = await db
      .update(infoPages)
      .set(updateData)
      .where(eq(infoPages.id, id))
      .returning({
        id: infoPages.id,
        title: infoPages.title,
        slug: infoPages.slug,
        content: infoPages.content,
        status: infoPages.status,
        updatedAt: infoPages.updatedAt,
      });

    return {
      success: true,
      message: 'Page mise à jour avec succès.',
      page: updated,
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function deleteInfoPage(
  id: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const existing = await db
      .select({ id: infoPages.id })
      .from(infoPages)
      .where(eq(infoPages.id, id))
      .limit(1);

    if (existing.length === 0) {
      return {
        success: false,
        message: 'Page non trouvée.',
      };
    }

    // Delete page — cascade handles menu_items via FK
    await db.delete(infoPages).where(eq(infoPages.id, id));

    return {
      success: true,
      message: 'Page supprimée avec succès.',
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function updateMenuItems(
  items: UpdateMenuInput['items']
): Promise<{ success: boolean; message?: string; items?: { id: string; label: string; pageId: string; displayOrder: number }[] }> {
  const validated = updateMenuSchema.safeParse({ items });

  if (!validated.success) {
    return {
      success: false,
      message: 'Données invalides.',
    };
  }

  try {
    // Delete all existing menu items
    await db.delete(menuItems);

    // Insert new items
    if (validated.data.items.length > 0) {
      const inserted = await db
        .insert(menuItems)
        .values(
          validated.data.items.map((item) => ({
            label: item.label,
            pageId: item.pageId,
            displayOrder: item.order,
          }))
        )
        .returning({
          id: menuItems.id,
          label: menuItems.label,
          pageId: menuItems.pageId,
          displayOrder: menuItems.displayOrder,
        });

      return {
        success: true,
        message: 'Menu mis à jour avec succès.',
        items: inserted,
      };
    }

    return {
      success: true,
      message: 'Menu mis à jour avec succès.',
      items: [],
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}
