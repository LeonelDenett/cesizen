import { NextRequest } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { infoPages } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { updateInfoPage, deleteInfoPage } from '@/lib/actions/info-pages';

// GET: Get page by slug (public — only published)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const [page] = await db
      .select({
        id: infoPages.id,
        title: infoPages.title,
        slug: infoPages.slug,
        content: infoPages.content,
        status: infoPages.status,
        updatedAt: infoPages.updatedAt,
      })
      .from(infoPages)
      .where(and(eq(infoPages.slug, slug), eq(infoPages.status, 'published')))
      .limit(1);

    if (!page) {
      return Response.json({ error: 'Page non trouvée.' }, { status: 404 });
    }

    return Response.json(page);
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// PUT: Update page (admin only) — uses slug to find page, then updates by id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  const { slug } = await params;

  try {
    // Find page by slug
    const [existing] = await db
      .select({ id: infoPages.id })
      .from(infoPages)
      .where(eq(infoPages.slug, slug))
      .limit(1);

    if (!existing) {
      return Response.json({ error: 'Page non trouvée.' }, { status: 404 });
    }

    const body = await request.json();
    const result = await updateInfoPage(existing.id, body);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json(result.page);
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// DELETE: Delete page (admin only) — cascade deletes menu_items via FK
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  const { slug } = await params;

  try {
    // Find page by slug
    const [existing] = await db
      .select({ id: infoPages.id })
      .from(infoPages)
      .where(eq(infoPages.slug, slug))
      .limit(1);

    if (!existing) {
      return Response.json({ error: 'Page non trouvée.' }, { status: 404 });
    }

    const result = await deleteInfoPage(existing.id);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 500 });
    }

    return Response.json({ success: true, message: result.message });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
