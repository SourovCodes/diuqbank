import type { ContributorSubmission } from "@qb/shared";
import { Eye, Sparkles, ThumbsUp } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "~/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { formatDate } from "~/lib/dates";
import { formatCount } from "~/lib/format";
import {
  classificationLine,
  proposesNewEntries,
  publicUrl,
} from "~/lib/submissions";

type SubmissionTableProps = {
  submissions: ContributorSubmission[];
  /** Row actions, e.g. a menu; adds a narrow last column. */
  actions?: (submission: ContributorSubmission) => React.ReactNode;
};

/** A contributor's submissions: paper, date, engagement and status. */
export function SubmissionTable({
  submissions,
  actions,
}: SubmissionTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Paper</TableHead>
            <TableHead className="hidden sm:table-cell">Added</TableHead>
            <TableHead className="hidden md:table-cell">Engagement</TableHead>
            <TableHead>Status</TableHead>
            {actions && (
              <TableHead className="w-10">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => {
            const href = publicUrl(submission);
            const { classification } = submission;
            return (
              <TableRow key={submission.id}>
                <TableCell className="w-full max-w-0">
                  {href ? (
                    <Link
                      to={href}
                      prefetch="intent"
                      className="block truncate font-medium hover:underline"
                    >
                      {classification.course.name}
                    </Link>
                  ) : (
                    <span className="block truncate font-medium">
                      {classification.course.name}
                    </span>
                  )}
                  <p className="truncate text-xs text-muted-foreground">
                    {classificationLine(classification)}
                  </p>
                  {proposesNewEntries(classification) && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="size-3" aria-hidden />
                      Includes new entries awaiting approval
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDate(submission.createdAt)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {submission.status === "published" ? (
                    <span className="flex items-center gap-3 tabular-nums">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="size-3.5" aria-hidden />
                        {formatCount(submission.likeCount)}
                        <span className="sr-only">likes</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="size-3.5" aria-hidden />
                        {formatCount(submission.viewCount)}
                        <span className="sr-only">views</span>
                      </span>
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={submission.status} />
                </TableCell>
                {actions && <TableCell>{actions(submission)}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
