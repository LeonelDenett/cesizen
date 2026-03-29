import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { toggleUserActive, deleteUser } from '@/lib/actions/users';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  // Handle isActive toggle
  if (typeof body.isActive === 'boolean') {
    const result = await toggleUserActive(id, body.isActive);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 500 });
    }

    return Response.json({ success: true, message: result.message });
  }

  // Handle role change
  if (body.role) {
    if (body.role !== 'utilisateur' && body.role !== 'administrateur') {
      return Response.json(
        { error: 'Le rôle doit être "utilisateur" ou "administrateur".' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ role: body.role, updatedAt: new Date() })
      .where(eq(users.id, id));

    return Response.json({ success: true, message: 'Rôle mis à jour avec succès.' });
  }

  return Response.json({ error: 'Aucune modification fournie.' }, { status: 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  const { id } = await params;

  // Prevent self-deletion
  if (currentUser.id === id) {
    return Response.json(
      { error: 'Un administrateur ne peut pas supprimer son propre compte.' },
      { status: 403 }
    );
  }

  const result = await deleteUser(currentUser.id, id);

  if (!result.success) {
    return Response.json({ error: result.message }, { status: 500 });
  }

  return Response.json({ success: true, message: result.message });
}
