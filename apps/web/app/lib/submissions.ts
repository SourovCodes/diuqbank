import type { Submission, SubmissionStatus } from "@qb/shared";

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

export function plural(count: number, singular: string, pluralForm?: string) {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}
