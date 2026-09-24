import type { ContributorDetail } from "@qb/shared";
import { data } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { SubmissionTable } from "~/components/submission-table";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
  { key: "published", label: "Published", detail: "Papers anyone can read" },
  {
    key: "pendingReview",
    label: "Pending review",
    detail: "Waiting for an admin",
  },
  { key: "rejected", label: "Rejected", detail: "Not approved" },
] as const;

export default function ContributorPage({ loaderData }: Route.ComponentProps) {
  const { contributor } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Contributors", to: "/contributors" },
          { label: contributor.name },
        ]}
        title={contributor.name}
        description={`Contributor · joined ${formatMonth(contributor.joinedAt)}`}
        actions={
          <ContributorAvatar
            name={contributor.name}
            image={contributor.image}
            size="lg"
          />
        }
      />

      <dl className="grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3">
        {STATS.map(({ key, label, detail }) => (
          <Card key={key}>
            <CardHeader>
              <CardDescription>
                <dt>{label}</dt>
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                <dd>{contributor.submissionCounts[key]}</dd>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{detail}</p>
            </CardHeader>
          </Card>
        ))}
      </dl>

      <section aria-labelledby="submissions-heading" className="space-y-3">
        <h2 id="submissions-heading" className="text-sm font-medium">
          {plural(contributor.submissions.length, "submission")}
        </h2>
        <SubmissionTable submissions={contributor.submissions} />
      </section>
    </div>
  );
}
