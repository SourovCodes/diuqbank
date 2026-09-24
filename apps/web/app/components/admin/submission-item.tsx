import type { AdminSubmission } from "@qb/shared";
import { ChevronRight, FileText, Flag, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { StatusBadge } from "~/components/status-badge";
import { Badge } from "~/components/ui/badge";
import {
  adminSubmissionUrl,
  classificationLine,
  proposesNewEntries,
} from "~/lib/admin";
import { formatDate } from "~/lib/dates";
import { plural } from "~/lib/submissions";

/** Flags that need an admin's eye: open reports and proposed new entries. */
export function SubmissionFlags({
  submission,
}: {
  submission: Pick<AdminSubmission, "pendingReportCount" | "classification">;
}) {
  return (
    <>
      {submission.pendingReportCount > 0 && (
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400"
        >
          <Flag aria-hidden />
          {plural(submission.pendingReportCount, "report")}
        </Badge>
      )}
      {proposesNewEntries(submission.classification) && (
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/5 text-primary"
        >
          <Sparkles aria-hidden />
          New entries
        </Badge>
      )}
    </>
  );
}

/** A submission in an admin list, linking to its review page. */
export function SubmissionItem({
  submission,
}: {
  submission: AdminSubmission;
}) {
  const { classification, uploader } = submission;

  return (
    <Link
      to={adminSubmissionUrl(submission.id)}
      prefetch="intent"
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:px-5"
    >
      <div className="hidden rounded-lg bg-primary/10 p-2.5 text-primary sm:block">
        <FileText className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium group-hover:text-primary">
            {classification.course.name}
          </p>
          <SubmissionFlags submission={submission} />
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {classificationLine(classification)}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {uploader ? (
            <>
              <ContributorAvatar
                name={uploader.name}
                image={uploader.image}
                size="xs"
              />
              <span className="truncate">{uploader.name}</span>
            </>
          ) : (
            <span>Deleted account</span>
          )}
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatDate(submission.createdAt)}</span>
        </p>
      </div>
      <StatusBadge status={submission.status} />
      <ChevronRight
        className="hidden size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary sm:block"
        aria-hidden
      />
    </Link>
  );
}
