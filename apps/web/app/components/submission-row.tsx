import type { ContributorSubmission } from "@qb/shared";
import { ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "~/components/status-badge";
import { formatDate } from "~/lib/dates";
import { formatBytes, formatViews } from "~/lib/format";
import { plural } from "~/lib/submissions";
import { cn } from "~/lib/utils";

const ROW_CLASS =
  "flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm";

type SubmissionRowProps = {
  submission: ContributorSubmission;
  /** Buttons for the row. When set, the row itself is not a link. */
  actions?: React.ReactNode;
};

/** One submission with its classification, status and upload details. */
export function SubmissionRow({ submission, actions }: SubmissionRowProps) {
  const { classification, questionId } = submission;
  const { department, course, semester, examType } = classification;
  const proposesNewValues =
    department.id === null || course.id === null || semester.id === null;

  const content = (
    <>
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <FileText className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="truncate font-medium group-hover:text-primary">
          {course.name}
        </h3>
        <p className="text-sm text-muted-foreground sm:truncate">
          {department.shortName ?? department.name} · {semester.name} ·{" "}
          {examType.name}
        </p>
        <p className="text-xs text-muted-foreground">
          Added {formatDate(submission.createdAt)} ·{" "}
          {formatBytes(submission.fileSize)}
          {submission.status === "published" &&
            ` · ${plural(submission.likeCount, "like")} · ${formatViews(submission.viewCount)}`}
          {proposesNewValues && " · Includes new entries awaiting approval"}
        </p>
      </div>
      <StatusBadge status={submission.status} />
    </>
  );

  if (actions) {
    return (
      <div className={cn(ROW_CLASS, "flex-wrap sm:flex-nowrap")}>
        {content}
        {/* Own line on phones, inline from `sm` up. */}
        <div className="flex w-full items-center justify-end gap-2 border-t pt-3 sm:w-auto sm:shrink-0 sm:border-0 sm:pt-0">
          {actions}
        </div>
      </div>
    );
  }

  // Not linked to a question yet (new values awaiting approval): nothing to open.
  if (questionId === null) return <div className={ROW_CLASS}>{content}</div>;

  // Published papers open directly; others lead to the question, where their status is shown.
  const href =
    submission.status === "published"
      ? `/questions/${questionId}?submission=${encodeURIComponent(submission.id)}`
      : `/questions/${questionId}`;

  return (
    <Link
      to={href}
      prefetch="intent"
      className={cn(
        ROW_CLASS,
        "group transition hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
      )}
    >
      {content}
      <ChevronRight
        className="hidden size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary sm:block"
        aria-hidden
      />
    </Link>
  );
}
