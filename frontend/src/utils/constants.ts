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

export const CATEGORY_PLACEHOLDER_IMAGES: Record<string, string> = {
  plumbing: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  electrical: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
  cleaning: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
  security: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80",
  parking: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
  noise: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  other: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
};

export const DEFAULT_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

export const getCategoryPlaceholder = (category?: string | null): string => {
  const key = (category || "").toLowerCase().trim();
  return CATEGORY_PLACEHOLDER_IMAGES[key] || DEFAULT_PLACEHOLDER_IMAGE;
};

export const getComplaintBannerSrc = (imageUrl?: string | null, category?: string | null): string => {
  if (imageUrl && imageUrl.trim().length > 0) {
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("/")) {
      return imageUrl;
    }
    return `/${imageUrl}`;
  }
  return getCategoryPlaceholder(category);
};


