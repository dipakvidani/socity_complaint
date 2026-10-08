import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "../config/db.js";
import { comments } from "../models/comment.model.js";

type NewComment = typeof comments.$inferInsert;

export class CommentRepository {
  async create(data: NewComment) {
    const [result] = await db.insert(comments).values(data);
    const [row] = await db.select().from(comments).where(eq(comments.id, result.insertId)).limit(1);
    return row;
  }

  listByComplaint(complaintId: number) {
    return db
      .select()
      .from(comments)
      .where(and(eq(comments.complaintId, complaintId), isNull(comments.deletedAt)))
      .orderBy(asc(comments.createdAt), asc(comments.id));
  }
}
