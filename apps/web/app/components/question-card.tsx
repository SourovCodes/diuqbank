import type { Question } from "@qb/shared";
import { ChevronRight, Eye, FileText } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { formatViews } from "~/lib/format";
import { plural } from "~/lib/submissions";

export function QuestionCard({ question }: { question: Question }) {
  const { published, pendingReview } = question.submissionCounts;
  return (
    <Link
      to={`/questions/${question.id}`}
      prefetch="intent"
      className="group flex h-full items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <FileText className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate font-medium group-hover:text-primary">
          {question.course.name}
        </h3>
        <p className="truncate text-sm text-muted-foreground">
          {question.department.shortName} · {question.semester.name} ·{" "}
          {question.examType.name}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge variant="secondary">
            {published > 0 ? plural(published, "paper") : "No papers yet"}
          </Badge>
          {pendingReview > 0 && (
            <Badge
              variant="outline"
              className="text-amber-700 dark:text-amber-400"
            >
              {pendingReview} pending review
            </Badge>
          )}
          <span className="inline-flex items-center gap-1 px-1 text-xs text-muted-foreground">
            <Eye className="size-3" aria-hidden />
            {formatViews(question.viewCount)}
          </span>
        </div>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}
