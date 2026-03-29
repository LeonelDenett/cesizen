import { db } from "./index";
import { users, emotionsLevel1, emotionsLevel2 } from "./schema";
import bcrypt from "bcryptjs";

const LEVEL1_EMOTIONS = [
  { name: "Joie", displayOrder: 1 },
  { name: "Colère", displayOrder: 2 },
  { name: "Peur", displayOrder: 3 },
  { name: "Tristesse", displayOrder: 4 },
  { name: "Surprise", displayOrder: 5 },
  { name: "Dégoût", displayOrder: 6 },
];

const LEVEL2_EMOTIONS: Record<string, string[]> = {
  Joie: ["Fierté", "Contentement", "Enchantement", "Excitation", "Émerveillement", "Gratitude"],
  Colère: ["Frustration", "Irritation", "Rage", "Ressentiment", "Agacement", "Hostilité"],
  Peur: ["Inquiétude", "Anxiété", "Terreur", "Appréhension", "Panique", "Crainte"],
  Tristesse: ["Chagrin", "Mélancolie", "Abattement", "Désespoir", "Solitude", "Dépression"],
  Surprise: ["Étonnement", "Stupéfaction", "Sidération", "Incrédule", "Émerveillement", "Confusion"],
  Dégoût: ["Répulsion", "Déplaisir", "Nausée", "Dédain", "Horreur", "Dégoût profond"],
};

export async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Seed level 1 emotions
    const insertedLevel1 = await db
      .insert(emotionsLevel1)
      .values(LEVEL1_EMOTIONS)
      .onConflictDoNothing({ target: emotionsLevel1.name })
      .returning();

    console.log(`✅ Inserted ${insertedLevel1.length} level 1 emotions`);

    // Seed level 2 emotions with FK references
    for (const l1 of insertedLevel1) {
      const level2Names = LEVEL2_EMOTIONS[l1.name];
      if (!level2Names) continue;

      const level2Values = level2Names.map((name, index) => ({
        emotionLevel1Id: l1.id,
        name,
        displayOrder: index + 1,
      }));

      await db
        .insert(emotionsLevel2)
        .values(level2Values)
        .onConflictDoNothing();
    }

    console.log("✅ Inserted level 2 emotions");

    // Seed default admin user
    const passwordHash = await bcrypt.hash("Admin123!", 10);

    await db
      .insert(users)
      .values({
        name: "Administrateur",
        email: "admin@cesizen.fr",
        passwordHash,
        role: "administrateur",
      })
      .onConflictDoNothing({ target: users.email });

    console.log("✅ Inserted admin user (admin@cesizen.fr)");
    console.log("🌱 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed().then(() => process.exit(0));
