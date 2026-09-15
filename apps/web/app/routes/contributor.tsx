import type { ContributorDetail, ContributorSubmission } from "@qb/shared";
import { ChevronRight, FileText } from "lucide-react";
import { data, Link } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { StatusBadge } from "~/components/status-badge";
import { Card } from "~/components/ui/card";
import { apiFetch, readJson } from "~/lib/api.server";
import { formatDate, formatMonth } from "~/lib/dates";
import { formatBytes } from "~/lib/format";
import { plural } from "~/lib/submissions";
import type { Route } from "./+types/contributor";

export async function loader({ request, params }: Route.LoaderArgs) {
  const res = await apiFetch(
    request,
    `/api/v1/contributors/${encodeURIComponent(params.id)}`,
  );
  if (res.status === 404) throw data("Contributor not found", { status: 404 });
  if (!res.ok) throw data("Failed to load contributor", { status: 502 });
  return { contributor: await readJson<ContributorDetail>(res) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Contributor not found — QuestionBank" }];
  const { name, submissionCounts } = loaderData.contributor;
  return [
    { title: `${name} — Contributor — QuestionBank` },
    {
      name: "description",
      content: `${name} has shared ${plural(submissionCounts.published, "question paper")} on QuestionBank.`,
    },
  ];
};

const STATS = [
  { key: "published", label: "Published" },
  { key: "pendingReview", label: "Pending review" },
  { key: "rejected", label: "Rejected" },
] as const;

function SubmissionRow({ submission }: { submission: ContributorSubmission }) {
  const { question } = submission;
  // Published papers open directly; others lead to the question, where their status is shown.
  const href =
    submission.status === "published"
      ? `/questions/${question.id}?submission=${encodeURIComponent(submission.id)}`
      : `/questions/${question.id}`;

  return (
    <Link
      to={href}
      prefetch="intent"
      className="group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
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
        <p className="text-xs text-muted-foreground">
          Added {formatDate(submission.createdAt)} ·{" "}
          {formatBytes(submission.fileSize)}
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

export default function ContributorPage({ loaderData }: Route.ComponentProps) {
  const { contributor } = loaderData;

  return (
    <div className="space-y-8">
      <PageHeader
        back={{ to: "/contributors", label: "All contributors" }}
        eyebrow="Contributor"
        title={contributor.name}
        description={`Joined ${formatMonth(contributor.joinedAt)}`}
        actions={<ContributorAvatar name={contributor.name} size="lg" />}
      />

      <dl className="grid grid-cols-3 gap-3 sm:gap-4">
        {STATS.map(({ key, label }) => (
          <Card key={key} className="gap-1 p-4 sm:p-5">
            <dt className="text-xs text-muted-foreground sm:text-sm">
              {label}
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">
              {contributor.submissionCounts[key]}
            </dd>
          </Card>
        ))}
      </dl>

      <section aria-labelledby="submissions-heading" className="space-y-4">
        <h2 id="submissions-heading" className="text-sm font-medium">
          {plural(contributor.submissions.length, "submission")}
        </h2>
        <ul className="grid gap-3">
          {contributor.submissions.map((submission) => (
            <li key={submission.id}>
              <SubmissionRow submission={submission} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
