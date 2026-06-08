import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 500 }),
  success: boolean("success").notNull().default(false),
  details: varchar("details", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
