import { z } from "zod";
import { CATEGORIES, PRIORITIES, STATUSES } from "../models/complaint.model.js";

export const TITLE_REGEX = /^[A-Za-z0-9][A-Za-z0-9 ,.'\-()/&!?]*$/;
export const TEXT_REGEX = /^[^<>]*$/;

const trimmed = (v: unknown) => (typeof v === "string" ? v.trim() : v);

export const createComplaintSchema = z.object({
  title: z.preprocess(
    trimmed,
    z
      .string()
      .min(3, "Title must be at least 3 characters.")
      .max(100, "Title can be up to 100 characters.")
      .regex(TITLE_REGEX, "Title can only have letters, numbers and basic punctuation.")
  ),
  description: z.preprocess(
    trimmed,
    z
      .string()
      .min(10, "Please describe the problem in at least 10 characters.")
      .max(1000, "Description can be up to 1000 characters.")
      .regex(TEXT_REGEX, "Description cannot contain < or > symbols.")
  ),
  category: z.enum(CATEGORIES, { message: "Choose a category." }),
  priority: z.enum(PRIORITIES, { message: "Choose a priority." }),
});

export const commentSchema = z.object({
  message: z.preprocess(
    trimmed,
    z
      .string()
      .min(1, "Write something before sending.")
      .max(300, "Comment can be up to 300 characters.")
      .regex(TEXT_REGEX, "Comment cannot contain < or > symbols.")
  ),
});

export const statusSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"], { message: "Choose a valid status." }),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.preprocess(trimmed, z.string().max(60).optional()),
  status: z.enum(STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  sort: z.enum(["createdAt", "title", "priority", "status"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
