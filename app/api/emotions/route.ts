import { NextRequest } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emotionsLevel1, emotionsLevel2 } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createEmotion } from '@/lib/actions/emotions';

// GET: List emotions — public returns only active; admin with ?all=true returns all (including inactive)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    // If ?all=true, check if user is admin and return all emotions including inactive
    if (all === 'true') {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.role === 'administrateur') {
        const level1Emotions = await db
          .select({
            id: emotionsLevel1.id,
            name: emotionsLevel1.name,
            isActive: emotionsLevel1.isActive,
            displayOrder: emotionsLevel1.displayOrder,
          })
          .from(emotionsLevel1)
          .orderBy(asc(emotionsLevel1.displayOrder));

        const emotions = await Promise.all(
          level1Emotions.map(async (l1) => {
            const level2 = await db
              .select({
                id: emotionsLevel2.id,
                name: emotionsLevel2.name,
                isActive: emotionsLevel2.isActive,
                displayOrder: emotionsLevel2.displayOrder,
              })
              .from(emotionsLevel2)
              .where(eq(emotionsLevel2.emotionLevel1Id, l1.id))
              .orderBy(asc(emotionsLevel2.displayOrder));

            return { ...l1, level2 };
          })
        );

        return Response.json({ emotions });
      }
    }

    // Default: return only active emotions with active level2 children
    const level1Emotions = await db
      .select({
        id: emotionsLevel1.id,
        name: emotionsLevel1.name,
      })
      .from(emotionsLevel1)
      .where(eq(emotionsLevel1.isActive, true))
      .orderBy(asc(emotionsLevel1.displayOrder));

    const emotions = await Promise.all(
      level1Emotions.map(async (l1) => {
        const level2 = await db
          .select({
            id: emotionsLevel2.id,
            name: emotionsLevel2.name,
          })
          .from(emotionsLevel2)
          .where(
            and(
              eq(emotionsLevel2.emotionLevel1Id, l1.id),
              eq(emotionsLevel2.isActive, true)
            )
          )
          .orderBy(asc(emotionsLevel2.displayOrder));

        return {
          id: l1.id,
          name: l1.name,
          level2,
        };
      })
    );

    return Response.json({ emotions });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}

// POST: Create emotion (admin only)
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
    const level = body.level as '1' | '2';

    if (level !== '1' && level !== '2') {
      return Response.json(
        { error: 'Le niveau doit être "1" ou "2".' },
        { status: 400 }
      );
    }

    const result = await createEmotion({
      name: body.name,
      level,
      emotionLevel1Id: body.emotionLevel1Id,
    });

    if (!result.success) {
      return Response.json({ error: result.message }, { status: 400 });
    }

    return Response.json(result.emotion, { status: 201 });
  } catch {
    return Response.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    );
  }
}
