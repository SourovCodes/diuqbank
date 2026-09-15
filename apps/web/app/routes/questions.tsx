import type {
  CourseList,
  DepartmentList,
  ExamTypeList,
  QuestionList,
  SemesterList,
} from "@qb/shared";
import { data, Link, useNavigation, useSearchParams } from "react-router";
import { QuestionCard } from "~/components/question-card";
import { SearchableSelect } from "~/components/searchable-select";
import { buttonVariants } from "~/components/ui/button";
import { apiFetch, apiGetJson, readJson } from "~/lib/api.server";
import {
  applyFilter,
  courseOptions,
  FILTER_KEYS,
  type FilterKey,
} from "~/lib/filters";
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
  for (const key of [...FILTER_KEYS, "page"]) {
    const value = url.searchParams.get(key);
    if (value) query.set(key, value);
  }

  const [departments, courses, semesters, examTypes, questionsRes] =
    await Promise.all([
      apiGetJson<DepartmentList>(request, "/api/v1/departments"),
      apiGetJson<CourseList>(request, "/api/v1/courses"),
      apiGetJson<SemesterList>(request, "/api/v1/semesters"),
      apiGetJson<ExamTypeList>(request, "/api/v1/exam-types"),
      apiFetch(request, `/api/v1/questions?${query}`),
    ]);

  const invalid = questionsRes.status === 422;
  if (!questionsRes.ok && !invalid) {
    throw data("Failed to load questions", { status: 502 });
  }
  const list: QuestionList = invalid
    ? { items: [], page: 1, pageSize: 20, total: 0 }
    : await readJson<QuestionList>(questionsRes);

  return {
    departments: departments.items,
    courses: courses.items,
    semesters: semesters.items,
    examTypes: examTypes.items,
    list,
    invalid,
  };
}

export default function Questions({ loaderData }: Route.ComponentProps) {
  const { departments, courses, semesters, examTypes, list, invalid } =
    loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const loading =
    navigation.state === "loading" &&
    navigation.location.pathname === "/questions";

  const departmentId = searchParams.get("departmentId");
  const hasFilters = FILTER_KEYS.some((key) => searchParams.has(key));
  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));

  const setFilter = (key: FilterKey, value: string | null) =>
    setSearchParams(applyFilter(searchParams, key, value, courses), {
      preventScrollReset: true,
    });

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `/questions?${params}`;
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Browse questions</h1>
        <p className="text-muted-foreground">
          Combine any of the filters below to find question papers.
        </p>
      </header>

      <div
        role="search"
        aria-label="Filter questions"
        className="grid gap-3 rounded-xl border bg-card p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4"
      >
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
      </div>

      <section
        aria-labelledby="results-heading"
        aria-busy={loading}
        className={cn("space-y-4 transition-opacity", loading && "opacity-60")}
      >
        <div className="flex items-baseline justify-between">
          <h2 id="results-heading" className="text-lg font-semibold">
            {list.total} {list.total === 1 ? "question" : "questions"}
          </h2>
          {hasFilters && (
            <Link
              to="/questions"
              preventScrollReset
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Link>
          )}
        </div>

        {invalid && (
          <p role="alert" className="text-sm text-destructive">
            Those filters look invalid. Try clearing them.
          </p>
        )}

        {list.items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            {hasFilters
              ? "No questions match these filters."
              : "No questions have been published yet."}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.items.map((question) => (
              <li key={question.id}>
                <QuestionCard question={question} />
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
