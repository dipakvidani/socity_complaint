import { z } from "zod";

export const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const FLAT_REGEX = /^[A-Za-z0-9]+(?:[-/][A-Za-z0-9]+)*$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,64}$/;

const trimmed = (v: unknown) => (typeof v === "string" ? v.trim() : v);
const lowered = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : v);

export const registerSchema = z.object({
  fullName: z.preprocess(
    trimmed,
    z
      .string()
      .min(2, "Name must be at least 2 letters.")
      .max(60, "Name can be up to 60 letters.")
      .regex(NAME_REGEX, "Name can only have letters and single spaces.")
  ),
  email: z.preprocess(
    lowered,
    z
      .string()
      .min(5, "Enter your email address.")
      .max(100, "Email can be up to 100 characters.")
      .regex(EMAIL_REGEX, "Enter a valid email address.")
  ),
  mobile: z.preprocess(
    trimmed,
    z
      .string()
      .length(10, "Mobile number must be exactly 10 digits.")
      .regex(MOBILE_REGEX, "Enter a 10 digit mobile number starting with 6 to 9.")
  ),
  flatNumber: z.preprocess(
    trimmed,
    z
      .string()
      .min(1, "Enter your flat or house number.")
      .max(12, "Flat number can be up to 12 characters.")
      .regex(FLAT_REGEX, "Use letters, numbers, - or / only (for example A-101).")
  ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(64, "Password can be up to 64 characters.")
    .regex(PASSWORD_REGEX, "Use 8 to 64 characters with an uppercase, a lowercase, a number and a special character."),
});

export const profileSchema = registerSchema.pick({ fullName: true, mobile: true, flatNumber: true });

export const loginSchema = z.object({
  email: z.preprocess(
    lowered,
    z
      .string()
      .min(1, "Enter your email address.")
      .max(100, "Email is too long.")
      .regex(EMAIL_REGEX, "Enter a valid email address.")
  ),
  password: z.string().min(1, "Enter your password.").max(64, "Password is too long."),
});
