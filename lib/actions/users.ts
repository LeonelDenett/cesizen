'use server';

import bcrypt from 'bcryptjs';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, sessions } from '@/lib/db/schema';
import { updateProfileSchema } from '@/lib/validators/auth';
import { getCurrentUser } from '@/lib/auth-helpers';
import type { FormState } from '@/lib/actions/auth';

export async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: 'Vous devez être connecté pour modifier votre profil.',
    };
  }

  const validatedFields = updateProfileSchema.safeParse({
    name: formData.get('name') || undefined,
    email: formData.get('email') || undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email } = validatedFields.data;

  try {
    // If email changed, check uniqueness (exclude current user)
    if (email) {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), ne(users.id, currentUser.id)))
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          message: 'Cet email est déjà utilisé par un autre compte.',
        };
      }
    }

    const updateData: Record<string, string | Date> = {
      updatedAt: new Date(),
    };
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, currentUser.id));

    return {
      success: true,
      message: 'Profil mis à jour avec succès.',
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function toggleUserActive(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string }> {
  try {
    await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // If deactivating, delete all sessions for this user
    if (!isActive) {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    }

    return {
      success: true,
      message: isActive
        ? 'Compte activé avec succès.'
        : 'Compte désactivé avec succès.',
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function deleteUser(
  adminId: string,
  targetUserId: string
): Promise<{ success: boolean; message?: string }> {
  // Prevent self-deletion
  if (adminId === targetUserId) {
    return {
      success: false,
      message: 'Un administrateur ne peut pas supprimer son propre compte.',
    };
  }

  try {
    // Delete user — cascade handles emotion_logs and sessions
    await db.delete(users).where(eq(users.id, targetUserId));

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès.',
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function createUserAsAdmin(data: {
  name: string;
  email: string;
  role: 'utilisateur' | 'administrateur';
  password: string;
}): Promise<{ success: boolean; message?: string; user?: { id: string; name: string; email: string; role: string; isActive: boolean } }> {
  try {
    // Check email uniqueness
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: 'Cet email est déjà utilisé.',
      };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const [created] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        role: data.role,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      });

    return {
      success: true,
      message: 'Utilisateur créé avec succès.',
      user: created,
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}
