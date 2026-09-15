import { and, eq, ne } from "drizzle-orm";
import type { Database } from "../db/client";
import { submissions } from "../db/schema";
import { AppError } from "../lib/errors";

function findOwnSubmission(db: Database, uploaderId: string, id: string) {
  return db.query.submissions.findFirst({
    columns: { fileKey: true, status: true },
    where: and(eq(submissions.id, id), eq(submissions.uploaderId, uploaderId)),
  });
}

/** The PDF of one of the user's own submissions, whatever its status. */
export async function getOwnSubmissionFile(
  db: Database,
  bucket: R2Bucket,
  uploaderId: string,
  id: string,
) {
  const submission = await findOwnSubmission(db, uploaderId, id);
  if (!submission) return null;
  return bucket.get(submission.fileKey);
}

/**
 * Deletes one of the user's own submissions and its PDF. Published papers are part of
 * the public bank, so only pending and rejected submissions can be withdrawn.
 */
export async function withdrawSubmission(
  db: Database,
  bucket: R2Bucket,
  uploaderId: string,
  id: string,
) {
  const submission = await findOwnSubmission(db, uploaderId, id);
  if (!submission) {
    throw new AppError(404, "NOT_FOUND", "Submission not found");
  }
  if (submission.status === "published") {
    throw new AppError(
      409,
      "CONFLICT",
      "Published papers can't be withdrawn. Contact an admin to remove one.",
    );
  }

  // The status condition guards against the paper being published in the meantime.
  const deleted = await db
    .delete(submissions)
    .where(
      and(
        eq(submissions.id, id),
        eq(submissions.uploaderId, uploaderId),
        ne(submissions.status, "published"),
      ),
    )
    .returning({ id: submissions.id });
  if (deleted.length === 0) {
    throw new AppError(
      409,
      "CONFLICT",
      "This submission was just published and can no longer be withdrawn.",
    );
  }
  await bucket.delete(submission.fileKey);
}
