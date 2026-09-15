import type { QuestionDetail } from "@qb/shared";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { data, Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { apiFetch, readJson } from "~/lib/api.server";
import { formatBytes } from "~/lib/format";
import type { Route } from "./+types/question";

// Fixed time zone so server and client render the same string (no hydration mismatch).
const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const res = await apiFetch(
    request,
    `/api/v1/questions/${encodeURIComponent(params.id)}`,
  );
  // 422 means a malformed id, which is just as "not found" for a visitor.
  if (res.status === 404 || res.status === 422) {
    throw data("Question not found", { status: 404 });
  }
  if (!res.ok) throw data("Failed to load question", { status: 502 });
  return { question: await readJson<QuestionDetail>(res) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Question not found — QuestionBank" }];
  const { course, department, semester, examType } = loaderData.question;
  return [
    {
      title: `${course.name} (${department.shortName}) ${examType.name}, ${semester.name} — QuestionBank`,
    },
    {
      name: "description",
      content: `${examType.name} question papers for ${course.name}, ${semester.name}, ${department.name}.`,
    },
  ];
};

export default function QuestionPage({ loaderData }: Route.ComponentProps) {
  const { question } = loaderData;

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/questions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All questions
      </Link>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {question.department.name}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {question.course.name}
        </h1>
      </header>

      <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Department</dt>
          <dd className="font-medium">{question.department.shortName}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Semester</dt>
          <dd className="font-medium">{question.semester.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Exam type</dt>
          <dd className="font-medium">{question.examType.name}</dd>
        </div>
      </dl>

      <section aria-labelledby="papers-heading" className="space-y-3">
        <h2 id="papers-heading" className="text-lg font-semibold">
          Question papers
        </h2>
        <ul className="divide-y rounded-xl border bg-card">
          {question.submissions.map((submission, index) => {
            const fileUrl = `/api/v1/submissions/${submission.id}/file`;
            return (
              <li
                key={submission.id}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <FileText className="size-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Paper {index + 1}</p>
                  <p className="text-sm text-muted-foreground">
                    PDF · {formatBytes(submission.fileSize)} · Added{" "}
                    <time dateTime={submission.createdAt}>
                      {dateFormatter.format(new Date(submission.createdAt))}
                    </time>
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener"
                    className={buttonVariants({ size: "sm" })}
                  >
                    Open PDF
                  </a>
                  <a
                    href={fileUrl}
                    download
                    aria-label={`Download paper ${index + 1}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    <Download aria-hidden />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
