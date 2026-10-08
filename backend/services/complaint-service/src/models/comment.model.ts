import { mysqlTable, int, varchar, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const comments = mysqlTable("scm_comments", {
  id: int("id").autoincrement().primaryKey(),
  complaintId: int("complaint_id").notNull(),
  userId: int("user_id").notNull(),
  authorName: varchar("author_name", { length: 60 }).notNull(),
  authorRole: mysqlEnum("author_role", ["resident", "admin"]).notNull(),
  message: varchar("message", { length: 300 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export type Comment = typeof comments.$inferSelect;
