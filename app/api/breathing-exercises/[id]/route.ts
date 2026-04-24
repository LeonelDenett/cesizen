import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { breathingExercises } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";
import { sanitize } from "@/lib/utils";

// PUT: admin — update exercise
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  if (user.role !== "administrateur") return Response.json({ error: "Accès interdit." }, { status: 403 });

  const { id } = await params;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.name !== undefined) updates.name = sanitize(body.name);
    if (body.description !== undefined) updates.description = sanitize(body.description);
    if (body.inspire !== undefined) updates.inspire = Number(body.inspire);
    if (body.hold !== undefined) updates.hold = Number(body.hold);
    if (body.expire !== undefined) updates.expire = Number(body.expire);
    if (body.category !== undefined) updates.category = body.category;
    if (body.benefit !== undefined) updates.benefit = sanitize(body.benefit);
    if (body.color !== undefined) updates.color = sanitize(body.color);
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.displayOrder !== undefined) updates.displayOrder = Number(body.displayOrder);

    const [exercise] = await db
      .update(breathingExercises)
      .set(updates)
      .where(eq(breathingExercises.id, id))
      .returning();

    if (!exercise) return Response.json({ error: "Exercice non trouvé." }, { status: 404 });

    return Response.json({ exercise });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// DELETE: admin — delete exercise
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  if (user.role !== "administrateur") return Response.json({ error: "Accès interdit." }, { status: 403 });

  const { id } = await params;

  try {
    await db.delete(breathingExercises).where(eq(breathingExercises.id, id));
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
