import { z } from "zod";
import type { Category, Priority } from "../types";
import { CATEGORIES, PRIORITIES, MAX_IMAGE_BYTES, IMAGE_TYPES } from "./constants";

export const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const FLAT_REGEX = /^[A-Za-z0-9]+(?:[-/][A-Za-z0-9]+)*$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/;
export const TITLE_REGEX = /^[A-Za-z0-9][A-Za-z0-9 ,.'\-()/&!?]*$/;
export const TEXT_REGEX = /^[^<>]*$/;
export const SEARCH_REGEX = /^[A-Za-z0-9 ,.'\-()/&!?]*$/;

export const LIMITS = {
  name: 60,
  email: 100,
  mobile: 10,
  flat: 12,
  password: 64,
  title: 100,
  description: 1000,
  comment: 300,
  search: 60,
};

export const FIELD_SPECS = {
  fullName: { min: 2, max: 60, regex: NAME_REGEX, description: "2-60 letters & single spaces" },
  email: { min: 5, max: 100, regex: EMAIL_REGEX, description: "Valid email format up to 100 chars" },
  mobile: { min: 10, max: 10, regex: MOBILE_REGEX, description: "10-digit number starting with 6-9" },
  flatNumber: { min: 1, max: 12, regex: FLAT_REGEX, description: "1-12 chars (e.g. A-101, B/202)" },
  password: { min: 8, max: 64, regex: PASSWORD_REGEX, description: "8-64 chars with uppercase, lowercase, number & special char" },
  title: { min: 3, max: 100, regex: TITLE_REGEX, description: "3-100 alphanumeric & basic punctuation" },
  description: { min: 10, max: 1000, regex: TEXT_REGEX, description: "10-1000 chars, no HTML tags (<>)" },
  comment: { min: 1, max: 300, regex: TEXT_REGEX, description: "1-300 chars, no HTML tags (<>)" },
  search: { min: 0, max: 60, regex: SEARCH_REGEX, description: "Up to 60 search query chars" },
};

export const filters: Record<"name" | "digits" | "flat" | "email" | "title" | "text" | "search", (v: string) => string> = {
  name: (v) => v.replace(/[^A-Za-z ]/g, "").replace(/ {2,}/g, " ").replace(/^ /, ""),
  digits: (v) => v.replace(/\D/g, ""),
  flat: (v) => v.replace(/[^A-Za-z0-9/-]/g, ""),
  email: (v) => v.replace(/\s/g, ""),
  title: (v) => v.replace(/[^A-Za-z0-9 ,.'\-()/&!?]/g, "").replace(/^ /, ""),
  text: (v) => v.replace(/[<>]/g, ""),
  search: (v) => v.replace(/[^A-Za-z0-9 ,.'\-()/&!?]/g, ""),
};

const trimmed = z.string().transform((v) => v.trim());

export const loginSchema = z.object({
  email: trimmed.pipe(
    z
      .string()
      .min(1, "Enter your email address.")
      .max(LIMITS.email, `Email cannot exceed ${LIMITS.email} characters.`)
      .regex(EMAIL_REGEX, "Enter a valid email address.")
  ),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(LIMITS.password, `Password cannot exceed ${LIMITS.password} characters.`),
});

export const registerSchema = z.object({
  fullName: trimmed.pipe(
    z
      .string()
      .min(FIELD_SPECS.fullName.min, `Name must be at least ${FIELD_SPECS.fullName.min} letters.`)
      .max(LIMITS.name, `Name cannot exceed ${LIMITS.name} letters.`)
      .regex(NAME_REGEX, "Name can only have letters and single spaces.")
  ),
  email: trimmed.pipe(
    z
      .string()
      .min(FIELD_SPECS.email.min, "Enter your email address.")
      .max(LIMITS.email, `Email cannot exceed ${LIMITS.email} characters.`)
      .regex(EMAIL_REGEX, "Enter a valid email address.")
  ),
  mobile: trimmed.pipe(
    z
      .string()
      .length(LIMITS.mobile, "Enter a 10 digit mobile number.")
      .regex(MOBILE_REGEX, "Enter a 10 digit mobile number starting with 6 to 9.")
  ),
  flatNumber: trimmed.pipe(
    z
      .string()
      .min(FIELD_SPECS.flatNumber.min, "Enter your flat or house number.")
      .max(LIMITS.flat, `Flat number cannot exceed ${LIMITS.flat} characters.`)
      .regex(FLAT_REGEX, "Use letters, numbers, - or / only (for example A-101).")
  ),
  password: z
    .string()
    .min(FIELD_SPECS.password.min, `Password must be at least ${FIELD_SPECS.password.min} characters.`)
    .max(LIMITS.password, `Password cannot exceed ${LIMITS.password} characters.`)
    .regex(PASSWORD_REGEX, "Use 8 to 64 characters with an uppercase, a lowercase, a number and a special character."),
});

export const profileSchema = registerSchema.pick({ fullName: true, mobile: true, flatNumber: true });

export const complaintSchema = z.object({
  title: trimmed.pipe(
    z
      .string()
      .min(FIELD_SPECS.title.min, `Title must be at least ${FIELD_SPECS.title.min} characters.`)
      .max(LIMITS.title, `Title cannot exceed ${LIMITS.title} characters.`)
      .regex(TITLE_REGEX, "Title can only have letters, numbers and basic punctuation.")
  ),
  description: trimmed.pipe(
    z
      .string()
      .min(FIELD_SPECS.description.min, `Please describe the problem in at least ${FIELD_SPECS.description.min} characters.`)
      .max(LIMITS.description, `Description cannot exceed ${LIMITS.description} characters.`)
      .regex(TEXT_REGEX, "Description cannot contain < or > symbols.")
  ),
  category: z.enum(CATEGORIES.map((c) => c.value) as [Category, ...Category[]], { message: "Choose a category." }),
  priority: z.enum(PRIORITIES.map((p) => p.value) as [Priority, ...Priority[]], { message: "Choose a priority." }),
});

export const commentSchema = z.object({
  message: trimmed.pipe(
    z
      .string()
      .min(FIELD_SPECS.comment.min, "Write something before sending.")
      .max(LIMITS.comment, `Comment cannot exceed ${LIMITS.comment} characters.`)
      .regex(TEXT_REGEX, "Comment cannot contain < or > symbols.")
  ),
});

export type LoginValues = z.input<typeof loginSchema>;
export type RegisterValues = z.input<typeof registerSchema>;
export type ProfileValues = z.input<typeof profileSchema>;
export type ComplaintValues = z.input<typeof complaintSchema>;
export type CommentValues = z.input<typeof commentSchema>;

export const checkImage = (file: File): string | null => {
  if (!IMAGE_TYPES.includes(file.type)) return "Please pick a JPG, PNG or WEBP image.";
  if (file.size > MAX_IMAGE_BYTES) return "That image is too large. Please pick one under 2 MB.";
  return null;
};
