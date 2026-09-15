import type { PaperList } from "@qb/shared";
import { data, Form, Link, useNavigation } from "react-router";
import { PaperCard } from "~/components/paper-card";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { apiFetch, readJson } from "~/lib/api.server";
import type { Route } from "./+types/home";

const QUERY_KEYS = ["subject", "year", "page"] as const;

export const meta: Route.MetaFunction = () => [
  { title: "QuestionBank — Past exam question papers" },
  {
    name: "description",
    content:
      "Browse and download past exam question papers for free, contributed by the community.",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = new URLSearchParams();
  for (const key of QUERY_KEYS) {
    const value = url.searchParams.get(key)?.trim();
    if (value) query.set(key, value);
  }
  const filters: Record<string, string> = Object.fromEntries(query);

  const res = await apiFetch(request, `/api/v1/papers?${query}`);
  if (res.status === 422) {
    const empty: PaperList = { items: [], page: 1, pageSize: 20, total: 0 };
    return { list: empty, filters, invalid: true };
  }
  if (!res.ok) throw data("Failed to load papers", { status: 502 });
  return { list: await readJson<PaperList>(res), filters, invalid: false };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { list, filters, invalid } = loaderData;
  const navigation = useNavigation();
  const searching =
    navigation.state === "loading" && navigation.location.pathname === "/";
  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const hasFilters = Boolean(filters.subject || filters.year);

  const pageHref = (page: number) => {
    const params = new URLSearchParams(filters);
    params.set("page", String(page));
    return `/?${params}`;
  };

  return (
    <div className="space-y-8">
      <section className="space-y-3 pt-4 text-center sm:pt-10">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Find past question papers
        </h1>
        <p className="mx-auto max-w-xl text-pretty text-muted-foreground">
          Free, community-contributed exam papers. Search by subject and year,
          then download the PDF.
        </p>
      </section>

      <Form
        method="get"
        role="search"
        className="mx-auto grid max-w-2xl gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-[1fr_8rem_auto] sm:items-end"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            placeholder="e.g. Physics"
            defaultValue={filters.subject ?? ""}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            name="year"
            type="number"
            inputMode="numeric"
            placeholder="2024"
            defaultValue={filters.year ?? ""}
          />
        </div>
        <Button type="submit" disabled={searching}>
          {searching ? "Searching…" : "Search"}
        </Button>
      </Form>

      <section aria-labelledby="results-heading" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="results-heading" className="text-lg font-semibold">
            {list.total} {list.total === 1 ? "paper" : "papers"}
          </h2>
          {hasFilters && (
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Link>
          )}
        </div>

        {invalid && (
          <p role="alert" className="text-sm text-destructive">
            Those filters look invalid. Please check the subject and year.
          </p>
        )}

        {list.items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No papers found yet.{" "}
            <Link
              to="/contribute"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Contribute one
            </Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.items.map((paper) => (
              <li key={paper.id}>
                <PaperCard paper={paper} />
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-3"
          >
            {list.page > 1 && (
              <Link
                to={pageHref(list.page - 1)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">
              Page {list.page} of {totalPages}
            </span>
            {list.page < totalPages && (
              <Link
                to={pageHref(list.page + 1)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Next
              </Link>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}
