import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const CATEGORIES = ["plumbing", "electrical", "cleaning", "security", "parking", "noise", "other"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
export const STATUSES = ["open", "in_progress", "resolved", "cancelled"] as const;

export const complaints = mysqlTable("scm_complaints", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", CATEGORIES).notNull(),
  priority: mysqlEnum("priority", PRIORITIES).notNull().default("medium"),
  status: mysqlEnum("status", STATUSES).notNull().default("open"),
  imageUrl: varchar("image_url", { length: 300 }),
  residentId: int("resident_id").notNull(),
  residentName: varchar("resident_name", { length: 60 }).notNull(),
  flatNumber: varchar("flat_number", { length: 12 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export type Complaint = typeof complaints.$inferSelect;
