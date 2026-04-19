import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { favorites } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const userFavs = await db.select().from(favorites).where(eq(favorites.userId, user.id));
  return NextResponse.json({ favorites: userFavs });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { pageId } = await request.json();
  if (!pageId) return NextResponse.json({ error: 'pageId requis' }, { status: 400 });

  // Check if already favorited
  const existing = await db.select().from(favorites)
    .where(and(eq(favorites.userId, user.id), eq(favorites.pageId, pageId))).limit(1);

  if (existing.length > 0) {
    // Remove favorite (toggle)
    await db.delete(favorites).where(and(eq(favorites.userId, user.id), eq(favorites.pageId, pageId)));
    return NextResponse.json({ favorited: false });
  }

  await db.insert(favorites).values({ userId: user.id, pageId });
  return NextResponse.json({ favorited: true });
}
