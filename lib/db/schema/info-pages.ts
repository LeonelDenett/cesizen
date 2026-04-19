import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const pageStatusEnum = pgEnum("page_status", ["published", "draft"]);
export const pageCategoryEnum = pgEnum("page_category", ["alimentation", "sport", "meditation", "stress", "general"]);

export const infoPages = pgTable("info_pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: pageCategoryEnum("category").notNull().default("general"),
  imageUrl: varchar("image_url", { length: 500 }),
  status: pageStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pageId: uuid("page_id").notNull().references(() => infoPages.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
