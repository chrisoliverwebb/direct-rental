import { z } from "zod";
export { GalleryLightbox, type GalleryLightboxItem } from "./lightbox/GalleryLightbox";

export type Nullable<T> = T | null;

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export const isoDateStringSchema = z.string().datetime({ offset: true });

export const paginationSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    totalItems: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  });

export const createId = (prefix: string, sequence: number) =>
  `${prefix}_${String(sequence).padStart(4, "0")}`;

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
  }).format(new Date(value));
};

export const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const sortByCreatedAtDesc = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
