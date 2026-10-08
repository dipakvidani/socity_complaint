import { and, eq, gt } from "drizzle-orm";
import { db } from "../config/db.js";
import { refreshTokens } from "../models/refreshToken.model.js";

export class RefreshTokenRepository {
  async save(userId: number, tokenHash: string, expiresAt: Date) {
    await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt });
  }

  async findValid(tokenHash: string) {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.tokenHash, tokenHash), gt(refreshTokens.expiresAt, new Date())))
      .limit(1);
    return row;
  }

  async remove(tokenHash: string) {
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
  }
}
