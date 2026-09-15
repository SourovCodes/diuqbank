import type { ContributorDetail } from "@qb/shared";
import { data } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { SubmissionRow } from "~/components/submission-row";
import { Card } from "~/components/ui/card";
import { apiFetch, readJson } from "~/lib/api.server";
import { formatMonth } from "~/lib/dates";
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
