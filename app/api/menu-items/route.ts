import { NextRequest } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { menuItems } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { updateMenuItems } from '@/lib/actions/info-pages';

// GET: List menu items ordered by displayOrder (public)
export async function GET() {
  try {
    const items = await db
      .select({
        id: menuItems.id,
        label: menuItems.label,
        pageId: menuItems.pageId,
        displayOrder: menuItems.displayOrder,
      })
      .from(menuItems)
      .orderBy(asc(menuItems.displayOrder));

    return Response.json({ items });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// PUT: Replace entire menu structure (admin only)
export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return Response.json(
        { error: 'Le champ items est requis.' },
        { status: 400 }
      );
    }

    const result = await updateMenuItems(body.items);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json({ items: result.items });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
