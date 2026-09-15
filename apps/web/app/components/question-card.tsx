import type { Question } from "@qb/shared";
import { FileText } from "lucide-react";
import { Link } from "react-router";

export function QuestionCard({ question }: { question: Question }) {
  const files = question.publishedSubmissionCount;
  return (
    <Link
      to={`/questions/${question.id}`}
      prefetch="intent"
      className="group flex items-start gap-4 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <FileText className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium group-hover:text-primary">
          {question.course.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {question.department.shortName} · {question.semester.name} ·{" "}
          {question.examType.name}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {files} {files === 1 ? "file" : "files"}
      </span>
    </Link>
  );
}
