import type { ReportStatus, SubmissionClassification } from "@qb/shared";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Open",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

/** Any submission's PDF, for admins. */
export function adminSubmissionFileUrl(id: string) {
  return `/api/v1/admin/submissions/${encodeURIComponent(id)}/file`;
}

export function adminSubmissionUrl(id: string) {
  return `/admin/submissions/${encodeURIComponent(id)}`;
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
