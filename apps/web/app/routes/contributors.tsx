import type { ContributorList } from "@qb/shared";
import { Users } from "lucide-react";
import { data, Link } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { TablePagination } from "~/components/table-pagination";
import {
  CARD_GRID,
  LINK_CARD,
  STRETCHED_LINK,
} from "~/components/question-cards";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { apiFetch, readJson } from "~/lib/api.server";
import { formatMonth } from "~/lib/dates";
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
    <div className="space-y-6">
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
          <ul aria-label="Contributors" className={CARD_GRID}>
            {list.items.map((contributor) => {
              return (
                <li key={contributor.id} className="grid">
                  <Card className={LINK_CARD}>
                    <CardHeader className="flex items-center gap-4">
                      <ContributorAvatar
                        name={contributor.name}
                        image={contributor.image}
                        size="lg"
                      />
                      <div className="grid min-w-0 gap-1.5">
                        <CardTitle className="truncate text-base leading-snug">
                          <Link
                            to={`/contributors/${encodeURIComponent(contributor.id)}`}
                            prefetch="intent"
                            className={STRETCHED_LINK}
                          >
                            {contributor.name}
                          </Link>
                        </CardTitle>
                        <CardDescription>
                          <span className="font-medium text-foreground">
                            {plural(contributor.publishedCount, "paper")}
                          </span>
                          {" · "}
                          joined {formatMonth(contributor.joinedAt)}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <TablePagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          noun="contributor"
          hrefFor={(page) => `/contributors?page=${page}`}
        />
      </section>
    </div>
  );
}
