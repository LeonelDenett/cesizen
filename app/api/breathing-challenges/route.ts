import { NextRequest } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { breathingChallenges } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sanitize } from "@/lib/utils";

// GET: user's challenges
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const challenges = await db
    .select()
    .from(breathingChallenges)
    .where(eq(breathingChallenges.userId, user.id));

  return Response.json({ challenges });
}

// POST: create a challenge
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  try {
    const body = await request.json();
    const { exerciseId, exerciseName, timesPerDay, daysPerWeek, cyclesPerSession } = body;

    if (!exerciseId || !exerciseName) {
      return Response.json({ error: "Exercice requis." }, { status: 400 });
    }

    const safeExerciseId = sanitize(exerciseId);
    const safeExerciseName = sanitize(exerciseName);

    // Deactivate existing challenge for same exercise
    await db
      .update(breathingChallenges)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(breathingChallenges.userId, user.id),
          eq(breathingChallenges.exerciseId, safeExerciseId),
          eq(breathingChallenges.isActive, true)
        )
      );

    const [challenge] = await db
      .insert(breathingChallenges)
      .values({
        userId: user.id,
        exerciseId: safeExerciseId,
        exerciseName: safeExerciseName,
        timesPerDay: timesPerDay || 1,
        daysPerWeek: daysPerWeek || 7,
        cyclesPerSession: cyclesPerSession || 6,
      })
      .returning();

    return Response.json({ challenge }, { status: 201 });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE: deactivate a challenge
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "ID requis." }, { status: 400 });

    await db
      .update(breathingChallenges)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(breathingChallenges.id, id),
          eq(breathingChallenges.userId, user.id)
        )
      );

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
