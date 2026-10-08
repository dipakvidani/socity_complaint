import { mysqlTable, int, varchar, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const users = mysqlTable("scm_users", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("full_name", { length: 60 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  mobile: varchar("mobile", { length: 10 }).notNull(),
  flatNumber: varchar("flat_number", { length: 12 }).notNull(),
  passwordHash: varchar("password_hash", { length: 100 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 300 }),
  role: mysqlEnum("role", ["resident", "admin"]).notNull().default("resident"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export type User = typeof users.$inferSelect;
