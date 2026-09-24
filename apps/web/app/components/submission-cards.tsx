import type { ContributorSubmission } from "@qb/shared";
import { CalendarDays, Eye, Sparkles, ThumbsUp } from "lucide-react";
import { Link } from "react-router";
import {
  CARD_GRID,
  LINK_CARD,
  STRETCHED_LINK,
} from "~/components/question-cards";
import { StatusBadge } from "~/components/status-badge";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { formatDate } from "~/lib/dates";
import { formatCount } from "~/lib/format";
import { proposesNewEntries, publicUrl } from "~/lib/submissions";
import { cn } from "~/lib/utils";

function SubmissionCard({ submission }: { submission: ContributorSubmission }) {
  const href = publicUrl(submission);
  const { department, course, semester, examType } = submission.classification;

  return (
    <Card className={cn(LINK_CARD, !href && "bg-muted/30 hover:shadow-none")}>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" title={department.name}>
            {department.shortName ?? department.name}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {examType.name}
          </Badge>
        </div>
        <CardAction>
          <StatusBadge status={submission.status} />
        </CardAction>
        <CardTitle className="text-base leading-snug">
          {href ? (
            <Link to={href} prefetch="intent" className={STRETCHED_LINK}>
              {course.name}
            </Link>
          ) : (
            course.name
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden />
          {semester.name}
        </CardDescription>
        {proposesNewEntries(submission.classification) && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3" aria-hidden />
            Includes new entries awaiting approval
          </p>
        )}
      </CardHeader>
      <CardFooter className="mt-auto justify-between gap-3 border-t text-sm text-muted-foreground [.border-t]:pt-4">
        <span>Added {formatDate(submission.createdAt)}</span>
        {submission.status === "published" && (
          <span className="flex items-center gap-3 tabular-nums">
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-4" aria-hidden />
              {formatCount(submission.likeCount)}
              <span className="sr-only"> likes</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-4" aria-hidden />
              {formatCount(submission.viewCount)}
              <span className="sr-only"> views</span>
            </span>
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

/** A contributor's submissions as cards; published ones open their question. */
export function SubmissionCards({
  submissions,
}: {
  submissions: ContributorSubmission[];
}) {
  return (
    <ul aria-label="Submissions" className={CARD_GRID}>
      {submissions.map((submission) => (
        <li key={submission.id} className="grid">
          <SubmissionCard submission={submission} />
        </li>
      ))}
    </ul>
  );
}
