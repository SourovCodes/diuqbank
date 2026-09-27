import type {
  ContributorSubmission,
  Submission,
  SubmissionClassification,
  SubmissionStatus,
} from "@qb/shared";
import { formatNumber } from "./format";

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  published: "Published",
  pending_review: "Pending review",
  rejected: "Rejected",
};

export function submissionFileUrl(id: string) {
  return `/api/v1/submissions/${encodeURIComponent(id)}/file`;
}

/** The signed-in uploader's copy of their own PDF, available in any status. */
export function ownSubmissionFileUrl(id: string) {
  return `/api/v1/me/submissions/${encodeURIComponent(id)}/file`;
}

/**
 * The submission to show in the viewer: the requested one if it is published,
 * otherwise the first published one. Unpublished submissions are never viewable.
 */
export function pickSubmission(
  submissions: Submission[],
  requestedId: string | null,
): Submission | null {
  const published = submissions.filter((s) => s.status === "published");
  return published.find((s) => s.id === requestedId) ?? published[0] ?? null;
}

/** e.g. "Section 5A · Batch 61", or null when the uploader gave neither. */
export function paperDetails({
  section,
  batch,
}: {
  section: string | null;
  batch: string | null;
}) {
  const parts = [
    section && `Section ${section}`,
    batch && `Batch ${batch}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * How to tell the papers of one question apart: by section and batch when given,
 * otherwise by who uploaded them, and only then by number ("Paper 2").
 */
export function paperTitle(
  submission: Pick<Submission, "section" | "batch" | "uploader">,
  index: number,
) {
  return (
    paperDetails(submission) ??
    (submission.uploader
      ? `By ${submission.uploader.name}`
      : `Paper ${index + 1}`)
  );
}

/** e.g. "1 paper", "1,586 questions". */
export function plural(count: number, singular: string, pluralForm?: string) {
  return `${formatNumber(count)} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}

/** Whether a submission still proposes new catalog entries. */
export function proposesNewEntries({
  department,
  course,
  semester,
}: SubmissionClassification) {
  return department.id === null || course.id === null || semester.id === null;
}

/** e.g. "CSE · 2nd Semester · Final" */
export function classificationLine({
  department,
  semester,
  examType,
}: SubmissionClassification) {
  return `${department.shortName ?? department.name} · ${semester.name} · ${examType.name}`;
}

/** Where a submission can be opened publicly, or null while it isn't published. */
export function publicUrl(submission: ContributorSubmission) {
  return submission.status === "published" && submission.questionId !== null
    ? `/questions/${submission.questionId}?submission=${encodeURIComponent(submission.id)}`
    : null;
}
