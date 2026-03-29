import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getTrackerEntries, createTrackerEntry } from '@/lib/actions/tracker';
import { createEmotionLogSchema } from '@/lib/validators/tracker';

// GET: Paginated journal (20 per page, reverse chronological)
export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));

  const result = await getTrackerEntries(currentUser.id, page, limit);

  if (!result.success) {
    return Response.json({ error: result.message }, { status: 500 });
  }

  return Response.json({
    entries: result.entries,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

// POST: Create emotion log entry
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const validated = createEmotionLogSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        { error: 'Données invalides.', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await createTrackerEntry(currentUser.id, validated.data);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json(result.entry, { status: 201 });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
