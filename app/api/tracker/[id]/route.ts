import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { updateTrackerEntry, deleteTrackerEntry } from '@/lib/actions/tracker';
import { updateEmotionLogSchema } from '@/lib/validators/tracker';

// PUT: Update emotion log entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();

    const validated = updateEmotionLogSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        { error: 'Données invalides.', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await updateTrackerEntry(currentUser.id, id, validated.data);

    if (!result.success) {
      const status = (result as { status?: number }).status || 400;
      return Response.json({ error: result.message }, { status });
    }

    return Response.json(result.entry);
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete emotion log entry
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { id } = await params;

  const result = await deleteTrackerEntry(currentUser.id, id);

  if (!result.success) {
    const status = (result as { status?: number }).status || 400;
    return Response.json({ error: result.message }, { status });
  }

  return Response.json({ success: true, message: result.message });
}
