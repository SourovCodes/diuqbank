import type { ReportStatus } from "@qb/shared";

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

export { classificationLine, proposesNewEntries } from "./submissions";
