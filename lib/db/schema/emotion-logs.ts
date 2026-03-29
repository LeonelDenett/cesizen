import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { emotionsLevel1, emotionsLevel2 } from "./emotions";

export const emotionLogs = pgTable("emotion_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emotionLevel1Id: uuid("emotion_level1_id").notNull().references(() => emotionsLevel1.id),
  emotionLevel2Id: uuid("emotion_level2_id").notNull().references(() => emotionsLevel2.id),
  logDate: timestamp("log_date").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
