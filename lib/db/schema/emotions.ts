import { pgTable, uuid, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";

export const emotionsLevel1 = pgTable("emotions_level1", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emotionsLevel2 = pgTable("emotions_level2", {
  id: uuid("id").defaultRandom().primaryKey(),
  emotionLevel1Id: uuid("emotion_level1_id").notNull().references(() => emotionsLevel1.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
