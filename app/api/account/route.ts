import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-helpers';

// DELETE /api/account — delete own account (RGPD droit à l'oubli)
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  // Admin cannot delete their own account via this route
  if (user.role === 'administrateur') {
    return NextResponse.json({ error: 'Les administrateurs ne peuvent pas supprimer leur compte ici.' }, { status: 403 });
  }

  try {
    // Cascade delete handles all related data (favorites, etc.)
    await db.delete(users).where(eq(users.id, user.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}
