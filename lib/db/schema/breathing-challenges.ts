import { pgTable, uuid, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const breathingChallenges = pgTable("breathing_challenges", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: varchar("exercise_id", { length: 20 }).notNull(),
  exerciseName: varchar("exercise_name", { length: 100 }).notNull(),
  timesPerDay: integer("times_per_day").notNull().default(1),
  daysPerWeek: integer("days_per_week").notNull().default(7),
  cyclesPerSession: integer("cycles_per_session").notNull().default(6),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const breathingLogs = pgTable("breathing_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeId: uuid("challenge_id").references(() => breathingChallenges.id, { onDelete: "set null" }),
  exerciseId: varchar("exercise_id", { length: 20 }).notNull(),
  cycles: integer("cycles").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});
