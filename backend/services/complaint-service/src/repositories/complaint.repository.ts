import { and, asc, desc, eq, isNull, like, or, sql, SQL } from "drizzle-orm";
import { db } from "../config/db.js";
import { complaints } from "../models/complaint.model.js";
import type { ListQuery } from "../utils/validation.js";

type NewComplaint = typeof complaints.$inferInsert;

export class ComplaintRepository {
  async create(data: NewComplaint) {
    const [result] = await db.insert(complaints).values(data);
    return this.findById(result.insertId);
  }

  async findById(id: number) {
    const [row] = await db.select().from(complaints).where(and(eq(complaints.id, id), isNull(complaints.deletedAt))).limit(1);
    return row;
  }

  async updateStatus(id: number, status: "open" | "in_progress" | "resolved" | "cancelled") {
    await db.update(complaints).set({ status }).where(eq(complaints.id, id));
    return this.findById(id);
  }

  async update(id: number, data: Partial<NewComplaint>) {
    await db.update(complaints).set(data).where(eq(complaints.id, id));
    return this.findById(id);
  }

  async list(query: ListQuery, residentId?: number) {
    const filters: SQL[] = [isNull(complaints.deletedAt)];
    if (residentId) filters.push(eq(complaints.residentId, residentId));
    if (query.status) filters.push(eq(complaints.status, query.status));
    if (query.category) filters.push(eq(complaints.category, query.category));
    if (query.search) {
      const term = `%${query.search.replace(/[%_]/g, "")}%`;
      filters.push(or(like(complaints.title, term), like(complaints.description, term), like(complaints.residentName, term))!);
    }
    const where = and(...filters);

    const direction = query.order === "asc" ? asc : desc;
    const sortColumn =
      query.sort === "priority"
        ? sql`FIELD(${complaints.priority}, 'low', 'medium', 'high')`
        : query.sort === "title"
          ? complaints.title
          : query.sort === "status"
            ? complaints.status
            : complaints.createdAt;

    const rows = await db
      .select()
      .from(complaints)
      .where(where)
      .orderBy(direction(sortColumn), desc(complaints.id))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);
    const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(complaints).where(where);
    return { rows, total: Number(total) };
  }
}
