import type { Category, Priority, Status } from "../types";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export const CATEGORIES: Option<Category>[] = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "cleaning", label: "Cleaning" },
  { value: "security", label: "Security" },
  { value: "parking", label: "Parking" },
  { value: "noise", label: "Noise" },
  { value: "other", label: "Other" },
];

export const PRIORITIES: Option<Priority>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const STATUSES: Option<Status>[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "cancelled", label: "Cancelled" },
];

export const labelOf = (list: Option[], value: string): string => list.find((i) => i.value === value)?.label ?? value;

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
