import { z } from "zod";
import { MIN_PAPER_YEAR, PAPER_STATUSES } from "../constants";
import { paginatedSchema, paginationQuerySchema } from "./common";

export const paperStatusSchema = z.enum(PAPER_STATUSES);
export type PaperStatus = z.infer<typeof paperStatusSchema>;

export const paperSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  year: z.number().int(),
  status: paperStatusSchema,
  fileSize: z.number().int(),
  createdAt: z.iso.datetime(),
});
export type Paper = z.infer<typeof paperSchema>;

export const listPapersQuerySchema = paginationQuerySchema.extend({
  subject: z.string().trim().min(1).max(100).optional(),
  year: z.coerce.number().int().optional(),
});
export type ListPapersQuery = z.infer<typeof listPapersQuerySchema>;

export const paperListSchema = paginatedSchema(paperSchema);
export type PaperList = z.infer<typeof paperListSchema>;

/** Metadata submitted alongside the PDF when contributing a paper. */
export const createPaperInputSchema = z.object({
  title: z.string().trim().min(3).max(200),
  subject: z.string().trim().min(2).max(100),
  year: z.coerce
    .number()
    .int()
    .min(MIN_PAPER_YEAR)
    .refine(
      (year) => year <= new Date().getUTCFullYear() + 1,
      "Year is in the future",
    ),
});
export type CreatePaperInput = z.infer<typeof createPaperInputSchema>;
