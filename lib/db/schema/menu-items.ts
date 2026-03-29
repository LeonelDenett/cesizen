import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { infoPages } from "./info-pages";

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  pageId: uuid("page_id").notNull().references(() => infoPages.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
