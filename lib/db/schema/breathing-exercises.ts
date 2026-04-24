import { pgTable, uuid, varchar, integer, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const exerciseCategoryEnum = pgEnum("exercise_category", ["basic", "advanced"]);

export const breathingExercises = pgTable("breathing_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  inspire: integer("inspire").notNull(),
  hold: integer("hold").notNull().default(0),
  expire: integer("expire").notNull(),
  category: exerciseCategoryEnum("category").notNull().default("basic"),
  benefit: varchar("benefit", { length: 100 }).notNull(),
  color: varchar("color", { length: 100 }).notNull().default("from-green-400 to-green-600"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
