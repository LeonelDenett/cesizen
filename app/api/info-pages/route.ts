import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { infoPages } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createInfoPage } from '@/lib/actions/info-pages';

// GET: List pages — public returns only published; admin with ?all=true returns all
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    // If ?all=true, check if user is admin and return all pages
    if (all === 'true') {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.role === 'administrateur') {
        const pages = await db
          .select({
            id: infoPages.id,
            title: infoPages.title,
            slug: infoPages.slug,
            content: infoPages.content,
            status: infoPages.status,
            updatedAt: infoPages.updatedAt,
          })
          .from(infoPages);

        return Response.json({ pages });
      }
    }

    // Default: return only published pages
    const pages = await db
      .select({
        id: infoPages.id,
        title: infoPages.title,
        slug: infoPages.slug,
        category: infoPages.category,
        imageUrl: infoPages.imageUrl,
        content: infoPages.content,
        status: infoPages.status,
        updatedAt: infoPages.updatedAt,
      })
      .from(infoPages)
      .where(eq(infoPages.status, 'published'));

    return Response.json({ pages });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// POST: Create page (admin only)
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = await createInfoPage(body);

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json(result.page, { status: 201 });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
