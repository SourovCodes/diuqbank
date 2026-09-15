import type { Submission } from "@qb/shared";
import { Check, Clock, FileText, XCircle } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { formatDate } from "~/lib/dates";
import { formatBytes } from "~/lib/format";
import { plural, STATUS_LABELS } from "~/lib/submissions";
import { cn } from "~/lib/utils";

type SubmissionListProps = {
  submissions: Submission[];
  selectedId: string | null;
};

export function SubmissionList({
  submissions,
  selectedId,
}: SubmissionListProps) {
  const published = submissions.filter((s) => s.status === "published");
  const paperNumbers = new Map(published.map((s, i) => [s.id, i + 1]));
  const pendingCount = submissions.filter(
    (s) => s.status === "pending_review",
  ).length;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Submissions</h2>
        <p className="text-xs text-muted-foreground">
          {plural(published.length, "published paper")}
          {pendingCount > 0 && ` · ${pendingCount} pending review`}
        </p>
      </div>

      <ul className="divide-y">
        {submissions.map((submission) => {
          if (submission.status === "published") {
            const active = submission.id === selectedId;
            return (
              <li key={submission.id}>
                {/* Links (not buttons) so switching works without JS and is shareable. */}
                <Link
                  to={`?submission=${encodeURIComponent(submission.id)}`}
                  replace
                  preventScrollReset
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent/60 focus-visible:bg-accent focus-visible:outline-none",
                    active && "bg-accent",
                  )}
                >
                  <FileText
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      Paper {paperNumbers.get(submission.id)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatBytes(submission.fileSize)} · Added{" "}
                      {formatDate(submission.createdAt)}
                    </span>
                  </span>
                  {active && (
                    <Check className="size-4 text-primary" aria-hidden />
                  )}
                </Link>
              </li>
            );
          }

          const pending = submission.status === "pending_review";
          const Icon = pending ? Clock : XCircle;
          return (
            <li
              key={submission.id}
              className="flex items-center gap-3 px-4 py-3 text-sm"
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  pending ? "text-amber-600" : "text-destructive",
                )}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-muted-foreground">
                  Submitted {formatDate(submission.createdAt)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {pending ? "Waiting for admin review" : "Not approved"}
                </span>
              </span>
              <Badge
                variant="outline"
                className={cn(
                  pending
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-destructive",
                )}
              >
                {STATUS_LABELS[submission.status]}
              </Badge>
            </li>
          );
        })}
      </ul>

      {pendingCount > 0 && (
        <p className="border-t bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          Papers under review become viewable once an admin approves them.
        </p>
      )}
    </Card>
  );
}
