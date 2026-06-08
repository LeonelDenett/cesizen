import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userPeppers = sqliteTable("user_peppers", {
  userId: text("user_id").primaryKey(),
  pepper: text("pepper").notNull(),
});
