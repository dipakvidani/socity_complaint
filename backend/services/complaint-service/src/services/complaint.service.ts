import dayjs from "dayjs";
import { uploadImage } from "../config/cloudinary.js";
import { EventPublisher } from "../config/rabbit.js";
import { ComplaintRepository } from "../repositories/complaint.repository.js";
import { CommentRepository } from "../repositories/comment.repository.js";
import { AppError } from "../utils/AppError.js";
import type { Complaint } from "../models/complaint.model.js";
import type { Comment } from "../models/comment.model.js";
import type { InternalClaims } from "../middleware/internalAuth.middleware.js";
import type { ListQuery } from "../utils/validation.js";

export const toComplaintDto = (c: Complaint) => ({
  id: c.id,
  title: c.title,
  description: c.description,
  category: c.category,
  priority: c.priority,
  status: c.status,
  imageUrl: c.imageUrl,
  residentId: c.residentId,
  residentName: c.residentName,
  flatNumber: c.flatNumber,
  createdAt: dayjs(c.createdAt).toISOString(),
  updatedAt: dayjs(c.updatedAt).toISOString(),
});

export const toCommentDto = (c: Comment) => ({
  id: c.id,
  complaintId: c.complaintId,
  authorName: c.authorName,
  authorRole: c.authorRole,
  message: c.message,
  createdAt: dayjs(c.createdAt).toISOString(),
});

export class ComplaintService {
  constructor(
    private complaints = new ComplaintRepository(),
    private comments = new CommentRepository(),
    private events = new EventPublisher()
  ) {}

  async create(caller: InternalClaims, input: { title: string; description: string; category: Complaint["category"]; priority: Complaint["priority"] }, image?: Buffer) {
    const imageUrl = image ? await uploadImage(image, "complaints") : null;
    const created = await this.complaints.create({
      ...input,
      imageUrl,
      residentId: caller.userId!,
      residentName: caller.name ?? "Resident",
      flatNumber: caller.flat ?? "-",
    });
    const dto = toComplaintDto(created!);
    void this.events.publish("complaint.created", dto);
    return dto;
  }

  async list(caller: InternalClaims, query: ListQuery) {
    const { rows, total } = await this.complaints.list(query, caller.role === "admin" ? undefined : caller.userId);
    return {
      items: rows.map(toComplaintDto),
      meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) },
    };
  }

  async detail(caller: InternalClaims, id: number) {
    const complaint = await this.getAccessible(caller, id);
    const comments = await this.comments.listByComplaint(id);
    return { ...toComplaintDto(complaint), comments: comments.map(toCommentDto) };
  }

  async addComment(caller: InternalClaims, id: number, message: string) {
    const complaint = await this.getAccessible(caller, id);
    if (complaint.status === "cancelled") throw new AppError(400, "This complaint was cancelled, so new comments are closed.");
    const comment = await this.comments.create({
      complaintId: id,
      userId: caller.userId!,
      authorName: caller.name ?? "Resident",
      authorRole: caller.role ?? "resident",
      message,
    });
    const dto = toCommentDto(comment);
    void this.events.publish("complaint.commented", { ...dto, userId: caller.userId, residentId: complaint.residentId, title: complaint.title });
    return dto;
  }

  async cancel(caller: InternalClaims, id: number) {
    const complaint = await this.getAccessible(caller, id);
    if (complaint.residentId !== caller.userId) throw new AppError(403, "You can only cancel your own complaints.");
    if (complaint.status === "cancelled") throw new AppError(400, "This complaint is already cancelled.");
    const updated = toComplaintDto((await this.complaints.updateStatus(id, "cancelled"))!);
    void this.events.publish("complaint.updated", updated);
    return updated;
  }

  async changeStatus(id: number, status: "open" | "in_progress" | "resolved") {
    const complaint = await this.complaints.findById(id);
    if (!complaint) throw new AppError(404, "We could not find that complaint.");
    if (complaint.status === "cancelled") throw new AppError(400, "A cancelled complaint cannot be changed.");
    const updated = toComplaintDto((await this.complaints.updateStatus(id, status))!);
    void this.events.publish("complaint.updated", updated);
    return updated;
  }

  private async getAccessible(caller: InternalClaims, id: number) {
    const complaint = await this.complaints.findById(id);
    if (!complaint) throw new AppError(404, "We could not find that complaint.");
    if (caller.role !== "admin" && complaint.residentId !== caller.userId) {
      throw new AppError(403, "You do not have access to this complaint.");
    }
    return complaint;
  }
}
