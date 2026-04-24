import { NextRequest } from "next/server";
import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { breathingLogs } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET: user's logs (with optional ?days=7 filter)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await db
    .select()
    .from(breathingLogs)
    .where(
      and(
        eq(breathingLogs.userId, user.id),
        gte(breathingLogs.completedAt, since)
      )
    );

  return Response.json({ logs });
}

// POST: log a completed session
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });

  try {
    const body = await request.json();
    const { exerciseId, cycles, durationSeconds, challengeId } = body;

    if (!exerciseId || !cycles || !durationSeconds) {
      return Response.json({ error: "Données incomplètes." }, { status: 400 });
    }

    const [log] = await db
      .insert(breathingLogs)
      .values({
        userId: user.id,
        exerciseId,
        cycles,
        durationSeconds,
        challengeId: challengeId || null,
      })
      .returning();

    return Response.json({ log }, { status: 201 });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
