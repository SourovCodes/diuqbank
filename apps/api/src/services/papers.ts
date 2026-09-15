import type {
  CreatePaperInput,
  ListPapersQuery,
  Paper,
  PaperList,
} from "@qb/shared";
import { MAX_PAPER_FILE_BYTES } from "@qb/shared";
import { and, count, desc, eq, type SQL } from "drizzle-orm";
import type { Database } from "../db/client";
import { papers, type PaperRow } from "../db/schema";
import { AppError } from "../lib/errors";

const PDF_MAGIC_BYTES = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

export function toPaper(row: PaperRow): Paper {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    year: row.year,
    status: row.status,
    fileSize: row.fileSize,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listApprovedPapers(
  db: Database,
  query: ListPapersQuery,
): Promise<PaperList> {
  const filters: SQL[] = [eq(papers.status, "approved")];
  if (query.subject) filters.push(eq(papers.subject, query.subject));
  if (query.year) filters.push(eq(papers.year, query.year));
  const where = and(...filters);

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(papers)
      .where(where)
      .orderBy(desc(papers.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ total: count() }).from(papers).where(where),
  ]);

  return {
    items: rows.map(toPaper),
    page: query.page,
    pageSize: query.pageSize,
    total: totals[0]?.total ?? 0,
  };
}

async function findApprovedRow(db: Database, id: string) {
  return db.query.papers.findFirst({
    where: and(eq(papers.id, id), eq(papers.status, "approved")),
  });
}

export async function getApprovedPaper(
  db: Database,
  id: string,
): Promise<Paper | null> {
  const row = await findApprovedRow(db, id);
  return row ? toPaper(row) : null;
}

export async function getPaperFile(db: Database, bucket: R2Bucket, id: string) {
  const row = await findApprovedRow(db, id);
  if (!row) return null;
  return bucket.get(row.fileKey);
}

async function assertIsPdf(file: File) {
  if (file.size === 0 || file.size > MAX_PAPER_FILE_BYTES) {
    throw new AppError(
      400,
      "INVALID_FILE",
      `File must be between 1 byte and ${MAX_PAPER_FILE_BYTES} bytes`,
    );
  }
  const header = new Uint8Array(
    await file.slice(0, PDF_MAGIC_BYTES.length).arrayBuffer(),
  );
  const isPdf = PDF_MAGIC_BYTES.every((byte, i) => header[i] === byte);
  if (!isPdf) {
    throw new AppError(400, "INVALID_FILE", "File must be a PDF");
  }
}

export async function createPaper(
  db: Database,
  bucket: R2Bucket,
  params: { input: CreatePaperInput; file: File; uploaderId: string },
): Promise<Paper> {
  await assertIsPdf(params.file);

  const id = crypto.randomUUID();
  const fileKey = `papers/${id}.pdf`;
  await bucket.put(fileKey, params.file, {
    httpMetadata: { contentType: "application/pdf" },
  });

  try {
    const [row] = await db
      .insert(papers)
      .values({
        id,
        ...params.input,
        fileKey,
        fileSize: params.file.size,
        uploaderId: params.uploaderId,
      })
      .returning();
    return toPaper(row!);
  } catch (err) {
    // Don't leave orphaned files behind if the metadata insert fails.
    await bucket.delete(fileKey);
    throw err;
  }
}
