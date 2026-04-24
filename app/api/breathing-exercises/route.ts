import { NextRequest } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { breathingExercises } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sanitize } from "@/lib/utils";

// GET: public — returns active exercises
export async function GET() {
  try {
    const exercises = await db
      .select()
      .from(breathingExercises)
      .where(eq(breathingExercises.isActive, true))
      .orderBy(asc(breathingExercises.displayOrder));

    return Response.json({ exercises });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// POST: admin — create exercise
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  if (user.role !== "administrateur") return Response.json({ error: "Accès interdit." }, { status: 403 });

  try {
    const body = await request.json();
    const { code, name, description, inspire, hold, expire, category, benefit, color, displayOrder } = body;

    if (!code || !name || !description || inspire == null || expire == null || !benefit) {
      return Response.json({ error: "Champs requis manquants." }, { status: 400 });
    }

    const [exercise] = await db
      .insert(breathingExercises)
      .values({
        code: sanitize(code), name: sanitize(name), description: sanitize(description),
        inspire: Number(inspire),
        hold: Number(hold || 0),
        expire: Number(expire),
        category: category || "basic",
        benefit: sanitize(benefit),
        color: sanitize(color || "from-green-400 to-green-600"),
        displayOrder: Number(displayOrder || 0),
      })
      .returning();

    return Response.json({ exercise }, { status: 201 });
  } catch {
    return Response.json({ error: "Erreur serveur. Le code existe peut-être déjà." }, { status: 500 });
  }
}
