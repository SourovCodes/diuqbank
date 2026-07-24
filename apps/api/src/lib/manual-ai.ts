import { and, eq, ne } from "drizzle-orm";

import { getDb } from "../db/client";
import { manualSubmissions } from "../db/schema";
import type { Bindings } from "../types";
import { extractQuestionMetadata, buildVocab } from "./ai-extraction";
import { compressPdf } from "./pdf-processor";

/**
 * Advisory AI check for a manual submission: the reviewer sees the model's
 * extraction next to the uploader's typed values. Deliberately independent —
 * the uploader's values are NOT fed to the model, so agreement between the two
 * is a real signal, not an echo. The result never gates approval.
 */

/**
 * Kick off (or re-run) the AI check: reset the snapshot, mark the row
 * `pending`, and enqueue on `GEMINI_QUEUE` (max_concurrency 1 keeps Gemini
 * calls serialized with the auto-submission pipeline). Never throws: if the
 * enqueue fails the row is flipped to `failed` so it isn't stranded at
 * `pending`.
 */
export const startManualAiCheck = async (
  env: Bindings,
  manualSubmissionId: number,
): Promise<void> => {
  await getDb(env.DB)
    .update(manualSubmissions)
    .set({
      aiStatus: "pending",
      aiIsAcceptable: null,
      aiReasoning: null,
      aiDepartmentName: null,
      aiCourseName: null,
      aiSemesterName: null,
      aiExamTypeName: null,
      aiSection: null,
      aiBatch: null,
      aiError: null,
    })
    .where(eq(manualSubmissions.id, manualSubmissionId));

  try {
    await env.GEMINI_QUEUE.send({ kind: "manual-ai", manualSubmissionId });
  } catch (err) {
    console.error("GEMINI_QUEUE.send(manual-ai) failed", manualSubmissionId, err);
    const message =
      err instanceof Error ? err.message : "Failed to start AI check";
    await markManualAiFailed(env, manualSubmissionId, message);
  }
};

/** Flag the AI check as terminally failed. Only flips a still-pending row, so
 * it never clobbers a completed snapshot. */
export const markManualAiFailed = async (
  env: Bindings,
  manualSubmissionId: number,
  message: string,
): Promise<void> => {
  try {
    await getDb(env.DB)
      .update(manualSubmissions)
      .set({ aiStatus: "failed", aiError: message.slice(0, 1000) })
      .where(
        and(
          eq(manualSubmissions.id, manualSubmissionId),
          eq(manualSubmissions.aiStatus, "pending"),
        ),
      );
  } catch (err) {
    console.error("Failed to mark manual AI check failed", manualSubmissionId, err);
  }
};

/**
 * Run the AI check for one manual submission: compress → Gemini extract →
 * store the snapshot. Run by the `GEMINI_QUEUE` consumer. Idempotent on
 * `aiStatus`: only a `pending` row is processed, so a redelivery after the
 * snapshot landed is a no-op. Throws on failure so the consumer can retry;
 * the consumer marks the row `failed` once retries run out.
 */
export const runManualAiCheck = async (
  env: Bindings,
  manualSubmissionId: number,
): Promise<void> => {
  const db = getDb(env.DB);

  const row = await db.query.manualSubmissions.findFirst({
    where: eq(manualSubmissions.id, manualSubmissionId),
  });
  if (!row) return; // deleted between enqueue and run
  if (row.aiStatus !== "pending") return; // already handled (or never started)
  if (row.status === "published") return; // nothing left to review

  const original = await env.BUCKET.get(row.pdfKey);
  if (!original) throw new Error("Uploaded PDF missing from storage");

  const compressed = await compressPdf(env, await original.arrayBuffer());
  const vocab = await buildVocab(db);
  const extraction = await extractQuestionMetadata({
    env,
    pdfBuffer: compressed,
    vocab,
    extraContext: null,
    // Document-level gate only: missing fields never flag the upload here —
    // filling gaps is exactly what the human reviewer is for.
    mode: "manual",
  });

  await db
    .update(manualSubmissions)
    .set({
      aiStatus: "completed",
      aiIsAcceptable: extraction.isAcceptable,
      // Keep the model's reasoning; on rejection prefer the concrete reason.
      aiReasoning: extraction.isAcceptable
        ? extraction.reasoning
        : extraction.rejectionReason ?? extraction.reasoning,
      aiDepartmentName: extraction.departmentName,
      aiCourseName: extraction.courseName,
      aiSemesterName: extraction.semesterName,
      aiExamTypeName: extraction.examTypeName,
      aiSection: extraction.section,
      aiBatch: extraction.batch,
      aiError: null,
    })
    .where(
      and(
        eq(manualSubmissions.id, manualSubmissionId),
        eq(manualSubmissions.aiStatus, "pending"),
        ne(manualSubmissions.status, "published"),
      ),
    );
};
