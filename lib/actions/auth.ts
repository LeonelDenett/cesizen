'use server';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import {
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
} from '@/lib/validators/auth';

export type FormState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
} | undefined;

export async function registerUser(
  prevState: unknown,
  formData: FormData
): Promise<FormState> {
  const validatedFields = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      return {
        success: false,
        message: 'Cet email est déjà utilisé',
      };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: 'utilisateur',
    });

    return {
      success: true,
      message: 'Compte créé avec succès',
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function requestPasswordReset(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = resetPasswordRequestSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email } = validatedFields.data;
  const uniformMessage =
    'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

  try {
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUsers.length > 0) {
      const user = existingUsers[0];

      // Invalidate all previous tokens for this user
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      // Generate new token with 1h expiration
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      // Log token to console for MVP (no email service)
      console.log(`[MVP] Password reset token for ${email}: ${token}`);
      console.log(`[MVP] Reset link: /reset-password/confirm?token=${token}`);
    }

    // Always return the same message regardless of whether the email exists
    return {
      success: true,
      message: uniformMessage,
    };
  } catch {
    return {
      success: true,
      message: uniformMessage,
    };
  }
}

export async function confirmPasswordReset(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = resetPasswordConfirmSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { token, password } = validatedFields.data;

  try {
    // Look up token: must exist, not used, not expired
    const tokenResults = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token))
      .limit(1);

    if (
      tokenResults.length === 0 ||
      tokenResults[0].used ||
      tokenResults[0].expiresAt <= new Date()
    ) {
      return {
        success: false,
        message: 'Ce lien de réinitialisation est invalide ou a expiré.',
      };
    }

    const resetToken = tokenResults[0];

    // Hash new password with bcrypt cost 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, resetToken.userId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès.',
    };
  } catch {
    return {
      success: false,
      message: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}
