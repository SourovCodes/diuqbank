import type { SubmissionStatus } from "@qb/shared";
import { Badge } from "~/components/ui/badge";
import { STATUS_LABELS } from "~/lib/submissions";

const STATUS_CLASSES: Record<SubmissionStatus, string> = {
  published: "text-emerald-700 dark:text-emerald-400",
  pending_review: "text-amber-700 dark:text-amber-400",
  rejected: "text-destructive",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
