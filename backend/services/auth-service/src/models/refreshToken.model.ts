import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const refreshTokens = mysqlTable("scm_refresh_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
