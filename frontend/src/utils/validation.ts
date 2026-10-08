import { z } from "zod";
import type { Category, Priority } from "../types";
import { CATEGORIES, PRIORITIES, MAX_IMAGE_BYTES, IMAGE_TYPES } from "./constants";

export const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const FLAT_REGEX = /^[A-Za-z0-9]+(?:[-/][A-Za-z0-9]+)*$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/;
export const TITLE_REGEX = /^[A-Za-z0-9][A-Za-z0-9 ,.'\-()/&!?]*$/;
export const TEXT_REGEX = /^[^<>]*$/;

export const LIMITS = { name: 60, email: 100, mobile: 10, flat: 12, password: 64, title: 100, description: 1000, comment: 300, search: 60 };

export const filters: Record<"name" | "digits" | "flat" | "email" | "title" | "text", (v: string) => string> = {
  name: (v) => v.replace(/[^A-Za-z ]/g, "").replace(/ {2,}/g, " ").replace(/^ /, ""),
  digits: (v) => v.replace(/\D/g, ""),
  flat: (v) => v.replace(/[^A-Za-z0-9/-]/g, ""),
  email: (v) => v.replace(/\s/g, ""),
  title: (v) => v.replace(/[^A-Za-z0-9 ,.'\-()/&!?]/g, "").replace(/^ /, ""),
  text: (v) => v.replace(/[<>]/g, ""),
};

const trimmed = z.string().transform((v) => v.trim());

export const loginSchema = z.object({
  email: trimmed.pipe(z.string().min(1, "Enter your email address.").max(LIMITS.email).email("Enter a valid email address.")),
  password: z.string().min(1, "Enter your password.").max(LIMITS.password, "Password is too long."),
});

export const registerSchema = z.object({
  fullName: trimmed.pipe(
    z.string().min(2, "Name must be at least 2 letters.").max(LIMITS.name, "Name can be up to 60 letters.").regex(NAME_REGEX, "Name can only have letters and single spaces.")
  ),
  email: trimmed.pipe(z.string().min(5, "Enter your email address.").max(LIMITS.email, "Email can be up to 100 characters.").email("Enter a valid email address.")),
  mobile: trimmed.pipe(z.string().regex(MOBILE_REGEX, "Enter a 10 digit mobile number starting with 6 to 9.")),
  flatNumber: trimmed.pipe(
    z.string().min(1, "Enter your flat or house number.").max(LIMITS.flat, "Flat number can be up to 12 characters.").regex(FLAT_REGEX, "Use letters, numbers, - or / only (for example A-101).")
  ),
  password: z.string().regex(PASSWORD_REGEX, "Use 8 to 64 characters with an uppercase, a lowercase, a number and a special character."),
});

export const profileSchema = registerSchema.pick({ fullName: true, mobile: true, flatNumber: true });

export const complaintSchema = z.object({
  title: trimmed.pipe(
    z.string().min(3, "Title must be at least 3 characters.").max(LIMITS.title, "Title can be up to 100 characters.").regex(TITLE_REGEX, "Title can only have letters, numbers and basic punctuation.")
  ),
  description: trimmed.pipe(
    z.string().min(10, "Please describe the problem in at least 10 characters.").max(LIMITS.description, "Description can be up to 1000 characters.").regex(TEXT_REGEX, "Description cannot contain < or > symbols.")
  ),
  category: z.enum(CATEGORIES.map((c) => c.value) as [Category, ...Category[]], { message: "Choose a category." }),
  priority: z.enum(PRIORITIES.map((p) => p.value) as [Priority, ...Priority[]], { message: "Choose a priority." }),
});

export const commentSchema = z.object({
  message: trimmed.pipe(z.string().min(1, "Write something before sending.").max(LIMITS.comment, "Comment can be up to 300 characters.").regex(TEXT_REGEX, "Comment cannot contain < or > symbols.")),
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
