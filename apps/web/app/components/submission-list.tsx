import type { Submission } from "@qb/shared";
import { Check, Eye, FileText, ThumbsDown, ThumbsUp } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "~/components/status-badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatDate } from "~/lib/dates";
import { formatCount } from "~/lib/format";
import { plural } from "~/lib/submissions";
import { cn } from "~/lib/utils";

type SubmissionListProps = {
  /** Already ranked by the API: best-rated published papers first. */
  submissions: Submission[];
  selectedId: string | null;
};

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5 tabular-nums">
      <Icon className="size-3" aria-hidden />
      {formatCount(value)}
      <span className="sr-only"> {label}</span>
    </span>
  );
}

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
    <Card className="gap-4 pb-2">
      <CardHeader>
        <CardTitle>
          <h2>Submissions</h2>
        </CardTitle>
        <CardDescription>
          {plural(published.length, "published paper")}
          {published.length > 1 && ", best rated first"}
          {pendingCount > 0 && ` · ${pendingCount} pending review`}
        </CardDescription>
      </CardHeader>

      <ul className="grid gap-1 px-2">
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                    active && "bg-accent",
                  )}
                >
                  <FileText
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      Paper {paperNumbers.get(submission.id)}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <Stat
                        icon={ThumbsUp}
                        value={submission.likeCount}
                        label="likes"
                      />
                      <Stat
                        icon={ThumbsDown}
                        value={submission.dislikeCount}
                        label="dislikes"
                      />
                      <Stat
                        icon={Eye}
                        value={submission.viewCount}
                        label="views"
                      />
                      <span>Added {formatDate(submission.createdAt)}</span>
                    </span>
                  </span>
                  {active && <Check className="size-4" aria-hidden />}
                </Link>
              </li>
            );
          }

          return (
            <li
              key={submission.id}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <FileText
                className="size-4 shrink-0 text-muted-foreground/50"
                aria-hidden
              />
              <span className="min-w-0 flex-1 text-xs text-muted-foreground">
                Submitted {formatDate(submission.createdAt)}
              </span>
              <StatusBadge status={submission.status} />
            </li>
          );
        })}
      </ul>

      {pendingCount > 0 && (
        <p className="border-t px-6 pt-3 pb-2 text-xs text-muted-foreground">
          Papers under review become viewable once an admin approves them.
        </p>
      )}
    </Card>
  );
}
