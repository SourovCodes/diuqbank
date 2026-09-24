import type {
  ContributorList,
  CourseList,
  DepartmentList,
  QuestionList,
} from "@qb/shared";
import {
  ArrowRight,
  ChevronRight,
  Download,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { LINK_CARD, STRETCHED_LINK } from "~/components/question-cards";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { apiGetJson } from "~/lib/api.server";
import { formatCount } from "~/lib/format";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/home";

/**
 * Live numbers and the departments to browse. The landing page must render even if
 * the API is down, so a failed request just leaves its part out.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const [questions, contributors, courses, departments] =
    await Promise.allSettled([
      apiGetJson<QuestionList>(request, "/api/v1/questions?pageSize=1"),
      apiGetJson<ContributorList>(request, "/api/v1/contributors?pageSize=1"),
      apiGetJson<CourseList>(request, "/api/v1/courses"),
      apiGetJson<DepartmentList>(request, "/api/v1/departments"),
    ]);
  const value = <T,>(result: PromiseSettledResult<T>) =>
    result.status === "fulfilled" ? result.value : null;

  const stats = [
    { label: "questions", count: value(questions)?.total },
    { label: "courses", count: value(courses)?.items.length },
    { label: "contributors", count: value(contributors)?.total },
  ].filter((stat): stat is { label: string; count: number } =>
    Boolean(stat.count),
  );
  return { stats, departments: value(departments)?.items ?? [] };
}

export const meta: Route.MetaFunction = () => [
  { title: "QuestionBank — Past exam question papers" },
  {
    name: "description",
    content:
      "Find previous exam question papers by department, course, semester and exam type. Free and community-contributed.",
  },
];

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Filter precisely",
    description:
      "Narrow down by department, course, semester and exam type to find exactly the paper you need.",
  },
  {
    icon: Download,
    title: "Read anywhere",
    description:
      "View papers right in the browser on any device, or download the PDF for later.",
  },
  {
    icon: Users,
    title: "Built by students",
    description:
      "Papers are contributed by the community and reviewed before they are published.",
  },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { stats, departments } = loaderData;

  return (
    <div className="space-y-16 py-4 sm:py-12">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          <Sparkles />
          Free · Community-contributed
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Past question papers, all in one place
        </h1>
        <p className="max-w-xl text-lg text-pretty text-muted-foreground">
          Find previous exam questions by department, course, semester and exam
          type, then read them right in your browser.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/questions">
              Browse questions
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/contribute">Contribute a paper</Link>
          </Button>
        </div>
        {stats.length > 0 && (
          <dl className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-2">
            {stats.map(({ label, count }) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <dd className="text-2xl font-semibold tabular-nums">
                  {formatCount(count)}
                </dd>
                <dt className="text-sm text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        )}
      </section>

      {departments.length > 0 && (
        <section aria-labelledby="departments-heading" className="space-y-4">
          <h2
            id="departments-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Browse by department
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <li key={department.id} className="grid">
                <Card className={cn(LINK_CARD, "py-4")}>
                  <CardHeader className="flex items-center gap-3 px-4">
                    <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border bg-background px-1.5 text-xs font-semibold shadow-xs">
                      {department.shortName}
                    </span>
                    <CardTitle className="min-w-0 flex-1 text-sm leading-snug">
                      <Link
                        to={`/questions?departmentId=${department.id}`}
                        className={STRETCHED_LINK}
                      >
                        {department.name}
                      </Link>
                    </CardTitle>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-label="Features"
        className="grid gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg border bg-background shadow-xs">
                <Icon className="size-4" aria-hidden />
              </div>
              <CardTitle>
                <h2>{title}</h2>
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
