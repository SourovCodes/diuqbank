import type { QuestionList, QuestionSort } from "@qb/shared";
import { SearchX, SlidersHorizontal, X } from "lucide-react";
import { data, Link, useNavigation, useSearchParams } from "react-router";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { QuestionCards } from "~/components/question-cards";
import { SearchableSelect } from "~/components/searchable-select";
import { TablePagination } from "~/components/table-pagination";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { apiFetch, readJson } from "~/lib/api.server";
import { loadTaxonomy } from "~/lib/taxonomy.server";
import {
  applyFilter,
  courseOptions,
  FILTER_KEYS,
  LIST_KEYS,
  type FilterKey,
} from "~/lib/filters";
import { plural } from "~/lib/submissions";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/questions";

export const meta: Route.MetaFunction = () => [
  { title: "Browse questions — QuestionBank" },
  {
    name: "description",
    content:
      "Browse past exam question papers by department, course, semester and exam type.",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = new URLSearchParams();
  for (const key of [...FILTER_KEYS, ...LIST_KEYS, "page"]) {
    const value = url.searchParams.get(key);
    if (value) query.set(key, value);
  }

  const [taxonomy, questionsRes] = await Promise.all([
    loadTaxonomy(request),
    apiFetch(request, `/api/v1/questions?${query}`),
  ]);

  const invalid = questionsRes.status === 422;
  if (!questionsRes.ok && !invalid) {
    throw data("Failed to load questions", { status: 502 });
  }
  const list: QuestionList = invalid
    ? { items: [], page: 1, pageSize: 20, total: 0 }
    : await readJson<QuestionList>(questionsRes);

  return { ...taxonomy, list, invalid };
}

const SORT_LABELS: Record<QuestionSort, string> = {
  newest: "Newest papers",
  popular: "Most viewed",
  az: "A–Z",
};

export default function Questions({ loaderData }: Route.ComponentProps) {
  const { departments, courses, semesters, examTypes, list, invalid } =
    loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const loading =
    navigation.state === "loading" &&
    navigation.location.pathname === "/questions";

  const departmentId = searchParams.get("departmentId");
  const sort = (searchParams.get("sort") as QuestionSort | null) ?? "newest";
  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));
  const setSort = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    setSearchParams(next, { preventScrollReset: true });
  };

  const setFilter = (key: FilterKey, value: string | null) =>
    setSearchParams(applyFilter(searchParams, key, value, courses), {
      preventScrollReset: true,
    });

  const activeFilters = FILTER_KEYS.filter((key) =>
    searchParams.has(key),
  ).length;
  const filterFields = (
    <>
      <SearchableSelect
        label="Department"
        placeholder="All departments"
        searchPlaceholder="Search departments…"
        emptyText="No department found."
        options={departments.map((d) => ({
          value: String(d.id),
          label: `${d.name} (${d.shortName})`,
        }))}
        value={departmentId}
        onChange={(value) => setFilter("departmentId", value)}
      />
      <SearchableSelect
        label="Course"
        placeholder="All courses"
        searchPlaceholder="Search courses…"
        emptyText="No course found."
        options={courseOptions(courses, departments, departmentId)}
        value={searchParams.get("courseId")}
        onChange={(value) => setFilter("courseId", value)}
      />
      <SearchableSelect
        label="Semester"
        placeholder="All semesters"
        searchPlaceholder="Search semesters…"
        emptyText="No semester found."
        options={semesters.map((s) => ({
          value: String(s.id),
          label: s.name,
        }))}
        value={searchParams.get("semesterId")}
        onChange={(value) => setFilter("semesterId", value)}
      />
      <SearchableSelect
        label="Exam type"
        placeholder="All exam types"
        searchPlaceholder="Search exam types…"
        emptyText="No exam type found."
        options={examTypes.map((e) => ({
          value: String(e.id),
          label: e.name,
        }))}
        value={searchParams.get("examTypeId")}
        onChange={(value) => setFilter("examTypeId", value)}
      />
    </>
  );

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `/questions?${params}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Browse questions"
        description="Combine any of the filters below to find question papers."
      />

      {/* Inline from `sm` up; on phones the four pickers would push the results
          below the fold, so they live in a sheet behind one button. */}
      <div
        role="search"
        aria-label="Filter questions"
        className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4"
      >
        {filterFields}
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between sm:hidden"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden />
              Filters
            </span>
            {activeFilters > 0 && (
              <Badge variant="secondary">{activeFilters} active</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85svh] rounded-t-xl">
          <SheetHeader>
            <SheetTitle>Filter questions</SheetTitle>
            <SheetDescription>
              Pick a course and exam type to compare semesters.
            </SheetDescription>
          </SheetHeader>
          <div
            role="search"
            aria-label="Filter questions"
            className="grid gap-4 overflow-y-auto px-4"
          >
            {filterFields}
          </div>
          <SheetFooter className="flex-row">
            {hasFilters && (
              <Button variant="outline" className="flex-1" asChild>
                <Link to="/questions" preventScrollReset>
                  Clear
                </Link>
              </Button>
            )}
            <SheetClose asChild>
              <Button className="flex-1" disabled={loading}>
                {loading
                  ? "Loading…"
                  : `Show ${plural(list.total, "question")}`}
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <section
        aria-labelledby="results-heading"
        aria-busy={loading}
        className={cn("space-y-4 transition-opacity", loading && "opacity-60")}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="results-heading" className="text-sm font-medium">
            {plural(list.total, "question")}
          </h2>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/questions" preventScrollReset>
                  <X />
                  Clear
                </Link>
              </Button>
            )}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger size="sm" aria-label="Sort questions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {(Object.keys(SORT_LABELS) as QuestionSort[]).map((value) => (
                  <SelectItem key={value} value={value}>
                    {SORT_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {invalid && (
          <p role="alert" className="text-sm text-destructive">
            Those filters look invalid. Try clearing them.
          </p>
        )}

        {list.items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={hasFilters ? "No questions match" : "No questions yet"}
            description={
              hasFilters
                ? "Try removing a filter or choosing a different combination."
                : "Question papers will show up here once they are contributed."
            }
          />
        ) : (
          <QuestionCards questions={list.items} />
        )}

        <TablePagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          noun="question"
          hrefFor={pageHref}
        />
      </section>
    </div>
  );
}
