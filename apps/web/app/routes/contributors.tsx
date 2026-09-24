import type { ContributorList } from "@qb/shared";
import { Users } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { TablePagination } from "~/components/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
  const navigate = useNavigate();

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
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Contributor</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">
                    Pending
                  </TableHead>
                  <TableHead className="hidden text-right md:table-cell">
                    Joined
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.items.map((contributor) => {
                  const href = `/contributors/${encodeURIComponent(contributor.id)}`;
                  return (
                    <TableRow
                      key={contributor.id}
                      className="cursor-pointer"
                      onClick={() => navigate(href)}
                    >
                      <TableCell className="w-full max-w-0">
                        <div className="flex items-center gap-3">
                          <ContributorAvatar
                            name={contributor.name}
                            image={contributor.image}
                            size="sm"
                          />
                          <Link
                            to={href}
                            prefetch="intent"
                            className="truncate font-medium hover:underline"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {contributor.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {contributor.submissionCounts.published}
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground tabular-nums sm:table-cell">
                        {contributor.submissionCounts.pendingReview}
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                        {formatMonth(contributor.joinedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
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
