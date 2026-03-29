import { NextRequest } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createUserAsAdmin } from '@/lib/actions/users';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
  const offset = (page - 1) * limit;

  const [totalResult] = await db.select({ count: count() }).from(users);
  const total = totalResult.count;
  const totalPages = Math.ceil(total / limit);

  const usersList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .limit(limit)
    .offset(offset);

  return Response.json({ users: usersList, total, page, totalPages });
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  if (currentUser.role !== 'administrateur') {
    return Response.json({ error: 'Accès interdit.' }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, role, password } = body;

  if (!name || !email || !role || !password) {
    return Response.json(
      { error: 'Les champs name, email, role et password sont requis.' },
      { status: 400 }
    );
  }

  if (role !== 'utilisateur' && role !== 'administrateur') {
    return Response.json(
      { error: 'Le rôle doit être "utilisateur" ou "administrateur".' },
      { status: 400 }
    );
  }

  const result = await createUserAsAdmin({ name, email, role, password });

  if (!result.success) {
    return Response.json({ error: result.message }, { status: 409 });
  }

  return Response.json(result.user, { status: 201 });
}
