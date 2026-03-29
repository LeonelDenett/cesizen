import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { updateEmotionName, toggleEmotionActive } from '@/lib/actions/emotions';
import { updateEmotionSchema } from '@/lib/validators/emotions';

// PUT: Update emotion name (admin only)
export async function PUT(
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

  try {
    const body = await request.json();
    const { name, level } = body;

    const validated = updateEmotionSchema.safeParse({ name });
    if (!validated.success || !validated.data.name) {
      return Response.json({ error: 'Le nom est requis.' }, { status: 400 });
    }

    if (level !== '1' && level !== '2') {
      return Response.json(
        { error: 'Le niveau doit être "1" ou "2".' },
        { status: 400 }
      );
    }

    const result = await updateEmotionName(id, validated.data.name, level);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json({ success: true, message: result.message });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle emotion active/inactive (admin only)
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

  try {
    const body = await request.json();
    const { isActive, level } = body;

    if (typeof isActive !== 'boolean') {
      return Response.json(
        { error: 'Le champ isActive est requis (booléen).' },
        { status: 400 }
      );
    }

    if (level !== '1' && level !== '2') {
      return Response.json(
        { error: 'Le niveau doit être "1" ou "2".' },
        { status: 400 }
      );
    }

    const result = await toggleEmotionActive(id, isActive, level);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json({ success: true, message: result.message });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
