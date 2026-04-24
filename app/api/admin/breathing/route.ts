import { eq, desc, sql, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { breathingChallenges, breathingLogs, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth-helpers";

function anonymize(userMap: Map<string, string>, email: string): string {
  if (!userMap.has(email)) {
    userMap.set(email, `Utilisateur ${userMap.size + 1}`);
  }
  return userMap.get(email)!;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Non authentifié." }, { status: 401 });
  if (user.role !== "administrateur") return Response.json({ error: "Accès interdit." }, { status: 403 });

  try {
    const userMap = new Map<string, string>();

    // All challenges with user info
    const rawChallenges = await db
      .select({
        id: breathingChallenges.id,
        exerciseId: breathingChallenges.exerciseId,
        exerciseName: breathingChallenges.exerciseName,
        timesPerDay: breathingChallenges.timesPerDay,
        daysPerWeek: breathingChallenges.daysPerWeek,
        cyclesPerSession: breathingChallenges.cyclesPerSession,
        isActive: breathingChallenges.isActive,
        createdAt: breathingChallenges.createdAt,
        userEmail: users.email,
      })
      .from(breathingChallenges)
      .innerJoin(users, eq(breathingChallenges.userId, users.id))
      .orderBy(desc(breathingChallenges.createdAt));

    const challenges = rawChallenges.map(ch => ({
      ...ch,
      userName: anonymize(userMap, ch.userEmail),
      userEmail: undefined,
    }));

    // Logs from last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rawLogs = await db
      .select({
        id: breathingLogs.id,
        exerciseId: breathingLogs.exerciseId,
        cycles: breathingLogs.cycles,
        durationSeconds: breathingLogs.durationSeconds,
        completedAt: breathingLogs.completedAt,
        userEmail: users.email,
      })
      .from(breathingLogs)
      .innerJoin(users, eq(breathingLogs.userId, users.id))
      .where(gte(breathingLogs.completedAt, since))
      .orderBy(desc(breathingLogs.completedAt));

    const logs = rawLogs.map(log => ({
      ...log,
      userName: anonymize(userMap, log.userEmail),
      userEmail: undefined,
    }));

    // Stats
    const totalUsers = await db
      .select({ count: sql<number>`count(distinct ${breathingChallenges.userId})` })
      .from(breathingChallenges)
      .where(eq(breathingChallenges.isActive, true));

    const totalSessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(breathingLogs)
      .where(gte(breathingLogs.completedAt, since));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = await db
      .select({ count: sql<number>`count(*)` })
      .from(breathingLogs)
      .where(gte(breathingLogs.completedAt, todayStart));

    return Response.json({
      challenges,
      logs,
      stats: {
        activeUsersWithChallenges: Number(totalUsers[0]?.count || 0),
        sessionsLast30Days: Number(totalSessions[0]?.count || 0),
        sessionsToday: Number(todaySessions[0]?.count || 0),
        activeChallenges: challenges.filter(c => c.isActive).length,
      },
    });
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
