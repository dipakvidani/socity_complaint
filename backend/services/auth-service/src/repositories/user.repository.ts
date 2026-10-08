import { and, eq, isNull } from "drizzle-orm";
import { db } from "../config/db.js";
import { users } from "../models/user.model.js";

type NewUser = typeof users.$inferInsert;

export class UserRepository {
  async findByEmail(email: string) {
    const [row] = await db.select().from(users).where(and(eq(users.email, email), isNull(users.deletedAt))).limit(1);
    return row;
  }

  async findById(id: number) {
    const [row] = await db.select().from(users).where(and(eq(users.id, id), isNull(users.deletedAt))).limit(1);
    return row;
  }

  async create(data: NewUser) {
    const [result] = await db.insert(users).values(data);
    return this.findById(result.insertId);
  }

  async updateProfile(id: number, data: { fullName: string; mobile: string; flatNumber: string }) {
    await db.update(users).set(data).where(eq(users.id, id));
    return this.findById(id);
  }

  async updateAvatar(id: number, avatarUrl: string | null) {
    await db.update(users).set({ avatarUrl }).where(eq(users.id, id));
    return this.findById(id);
  }
}
