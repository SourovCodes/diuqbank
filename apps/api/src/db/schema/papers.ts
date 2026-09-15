import { PAPER_STATUSES } from "@qb/shared";
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const papers = sqliteTable(
  "papers",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text().notNull(),
    subject: text().notNull(),
    year: integer().notNull(),
    /** New contributions start as `pending` and are only public once `approved`. */
    status: text({ enum: PAPER_STATUSES }).notNull().default("pending"),
    /** R2 object key of the PDF. */
    fileKey: text().notNull().unique(),
    fileSize: integer().notNull(),
    uploaderId: text().references(() => user.id, { onDelete: "set null" }),
    createdAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`),
    updatedAt: integer({ mode: "timestamp_ms" })
      .notNull()
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("papers_status_created_at_idx").on(t.status, t.createdAt),
    index("papers_subject_year_idx").on(t.subject, t.year),
    index("papers_uploader_id_idx").on(t.uploaderId),
  ],
);

export type PaperRow = typeof papers.$inferSelect;
export type NewPaperRow = typeof papers.$inferInsert;
