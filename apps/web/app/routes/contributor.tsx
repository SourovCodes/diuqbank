import type { ContributorDetail } from "@qb/shared";
import { data } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { SubmissionCards } from "~/components/submission-cards";
import { TablePagination } from "~/components/table-pagination";
import { apiFetch, readJson } from "~/lib/api.server";
import { formatMonth } from "~/lib/dates";
import { plural } from "~/lib/submissions";
import type { Route } from "./+types/contributor";

export async function loader({ request, params }: Route.LoaderArgs) {
  const page = Math.max(
    1,
    Number(new URL(request.url).searchParams.get("page")) || 1,
  );
  const res = await apiFetch(
    request,
    `/api/v1/contributors/${encodeURIComponent(params.id)}?page=${page}`,
  );
  if (res.status === 404 || res.status === 422) {
    throw data("Contributor not found", { status: 404 });
  }
  if (!res.ok) throw data("Failed to load contributor", { status: 502 });
  return { contributor: await readJson<ContributorDetail>(res) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Contributor not found — QuestionBank" }];
  const { name, publishedCount } = loaderData.contributor;
  return [
    { title: `${name} — Contributor — QuestionBank` },
    {
      name: "description",
      content: `${name} has shared ${plural(publishedCount, "question paper")} on QuestionBank.`,
    },
  ];
};

export default function ContributorPage({ loaderData }: Route.ComponentProps) {
  const { contributor } = loaderData;
  const papers = contributor.submissions;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Contributors", to: "/contributors" },
          { label: contributor.name },
        ]}
        title={contributor.name}
        description={`${plural(contributor.publishedCount, "published paper")} · joined ${formatMonth(contributor.joinedAt)}`}
        actions={
          <ContributorAvatar
            name={contributor.name}
            image={contributor.image}
            size="lg"
          />
        }
      />

      <section aria-labelledby="submissions-heading" className="space-y-3">
        <h2 id="submissions-heading" className="text-sm font-medium">
          Papers
        </h2>
        <SubmissionCards submissions={papers.items} />
        <TablePagination
          page={papers.page}
          pageSize={papers.pageSize}
          total={papers.total}
          noun="paper"
          hrefFor={(page) => (page > 1 ? `?page=${page}` : "?")}
        />
      </section>
    </div>
  );
}
