import { db } from '../lib/db';
import { sqliteDb } from '../lib/db/sqlite';
import {
  users,
  sessions,
  emotionLogs,
  passwordResetTokens,
  infoPages,
  menuItems,
  emotionsLevel1,
  emotionsLevel2,
  breathingExercises,
} from '../lib/db/schema';
import { userPeppers } from '../lib/db/schema/sqlite-secrets';

async function reset() {
  console.log("🧹 Suppression de toutes les données...");

  // PostgreSQL — ordre important pour respecter les clés étrangères
  await db.delete(emotionLogs);
  await db.delete(passwordResetTokens);
  await db.delete(sessions);
  await db.delete(menuItems);
  await db.delete(infoPages);
  await db.delete(breathingExercises);
  await db.delete(emotionsLevel2);
  await db.delete(emotionsLevel1);
  await db.delete(users);

  // SQLite
  await sqliteDb.delete(userPeppers);

  console.log("✅ Toutes les données ont été supprimées.");
  console.log("🌱 Relancez : npm run db:seed");
}

reset().catch((err) => {
  console.error("❌ Erreur lors du reset:", err);
  process.exit(1);
});
