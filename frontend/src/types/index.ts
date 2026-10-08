export type Role = "resident" | "admin";
export type Status = "open" | "in_progress" | "resolved" | "cancelled";
export type Priority = "low" | "medium" | "high";
export type Category = "plumbing" | "electrical" | "cleaning" | "security" | "parking" | "noise" | "other";

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  flatNumber: string;
  avatarUrl: string | null;
  role: Role;
  createdAt: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  imageUrl: string | null;
  residentId: number;
  residentName: string;
  flatNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  complaintId: number;
  authorName: string;
  authorRole: Role;
  message: string;
  createdAt: string;
}

export interface ComplaintDetail extends Complaint {
  comments: Comment[];
}

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T, M = null> {
  success: boolean;
  message: string;
  data: T;
  meta: M;
}

export interface ListParams {
  page: number;
  limit: number;
  sort: "createdAt" | "title" | "priority" | "status";
  order: "asc" | "desc";
  search?: string;
  status?: Status;
  category?: Category;
}

export type FieldErrors = Record<string, string>;

export type ComplaintEvent = "created" | "updated" | "commented";
