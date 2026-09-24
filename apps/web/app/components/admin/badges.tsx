import type { ReportStatus, SubmissionClassification } from "@qb/shared";
import { CircleCheck, CircleDashed, Flag, Sparkles } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { proposesNewEntries, REPORT_STATUS_LABELS } from "~/lib/admin";
import { plural } from "~/lib/submissions";

/** A submission's status; the same badge the public site uses. */
export { StatusBadge as SubmissionStatusBadge } from "~/components/status-badge";

const REPORT_ICONS: Record<ReportStatus, React.ReactNode> = {
  pending: <Flag className="text-red-600 dark:text-red-400" />,
  resolved: (
    <CircleCheck className="fill-emerald-500 text-white dark:fill-emerald-400 dark:text-background" />
  ),
  dismissed: <CircleDashed />,
};

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge variant="outline" className="px-1.5 text-muted-foreground">
      {REPORT_ICONS[status]}
      {REPORT_STATUS_LABELS[status]}
    </Badge>
  );
}

/** Flags that need an admin's eye: open reports and proposed new entries. */
export function SubmissionFlags({
  pendingReportCount,
  classification,
}: {
  pendingReportCount: number;
  classification: SubmissionClassification;
}) {
  return (
    <>
      {pendingReportCount > 0 && (
        <Badge variant="destructive">
          <Flag />
          {plural(pendingReportCount, "report")}
        </Badge>
      )}
      {proposesNewEntries(classification) && (
        <Badge variant="secondary">
          <Sparkles />
          New entries
        </Badge>
      )}
    </>
  );
}
