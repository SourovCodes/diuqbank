import type { ContributorList } from "@qb/shared";
import { Users } from "lucide-react";
import { data } from "react-router";
import { ContributorCard } from "~/components/contributor-card";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { Pagination } from "~/components/pagination";
import { apiFetch, readJson } from "~/lib/api.server";
import { plural } from "~/lib/submissions";
import type { Route } from "./+types/contributors";

export const meta: Route.MetaFunction = () => [
  { title: "Contributors — QuestionBank" },
  {
    name: "description",
    content: "The students sharing past question papers on QuestionBank.",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const page = new URL(request.url).searchParams.get("page");
  const query = page ? `?page=${encodeURIComponent(page)}` : "";
  const res = await apiFetch(request, `/api/v1/contributors${query}`);

  if (res.status === 422) {
    const empty: ContributorList = {
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
    };
    return { list: empty };
  }
  if (!res.ok) throw data("Failed to load contributors", { status: 502 });
  return { list: await readJson<ContributorList>(res) };
}

export default function Contributors({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Contributors"
        description="The students who share question papers with everyone."
      />

      <section aria-labelledby="contributors-heading" className="space-y-4">
        <h2 id="contributors-heading" className="text-sm font-medium">
          {plural(list.total, "contributor")}
        </h2>

        {list.items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contributors yet"
            description="People who upload question papers will be listed here."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.items.map((contributor) => (
              <li key={contributor.id}>
                <ContributorCard contributor={contributor} />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          hrefFor={(page) => `/contributors?page=${page}`}
        />
      </section>
    </div>
  );
}
