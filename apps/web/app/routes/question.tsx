import type { QuestionDetail } from "@qb/shared";
import { Clock, Download, ExternalLink, FileX } from "lucide-react";
import { lazy, Suspense } from "react";
import {
  data,
  Link,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { SubmissionList } from "~/components/submission-list";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { useHydrated } from "~/hooks/use-hydrated";
import { apiFetch, readJson } from "~/lib/api.server";
import { plural, pickSubmission, submissionFileUrl } from "~/lib/submissions";
import type { Route } from "./+types/question";

const PdfViewer = lazy(() => import("~/components/pdf-viewer.client"));

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

// Switching submissions only changes `?submission=`, which the loader doesn't use.
export function shouldRevalidate({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod || currentUrl.pathname !== nextUrl.pathname) {
    return defaultShouldRevalidate;
  }
  const withoutSubmission = (url: URL) => {
    const params = new URLSearchParams(url.search);
    params.delete("submission");
    return params.toString();
  };
  return withoutSubmission(currentUrl) !== withoutSubmission(nextUrl);
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

function ViewerSkeleton() {
  return (
    <Skeleton className="h-[calc(75vh+2.75rem)] min-h-[30.75rem] rounded-xl" />
  );
}

export default function QuestionPage({ loaderData }: Route.ComponentProps) {
  const { question } = loaderData;
  const [searchParams] = useSearchParams();
  const hydrated = useHydrated();
  const selected = pickSubmission(
    question.submissions,
    searchParams.get("submission"),
  );
  const { pendingReview } = question.submissionCounts;
  const fileUrl = selected ? submissionFileUrl(selected.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: "/questions", label: "All questions" }}
        eyebrow={question.department.name}
        title={question.course.name}
        actions={
          fileUrl && (
            <>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <ExternalLink aria-hidden />
                Open in new tab
              </a>
              <a
                href={fileUrl}
                download
                className={buttonVariants({ size: "sm" })}
              >
                <Download aria-hidden />
                Download
              </a>
            </>
          )
        }
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{question.department.shortName}</Badge>
          <Badge variant="secondary">{question.semester.name}</Badge>
          <Badge variant="secondary">{question.examType.name}</Badge>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-label="Question paper"
          className="order-2 min-w-0 lg:order-1"
        >
          {!selected ? (
            <EmptyState
              className="min-h-[28rem] lg:h-[calc(75vh+2.75rem)]"
              icon={pendingReview > 0 ? Clock : FileX}
              title="No published paper yet"
              description={
                pendingReview > 0
                  ? `${plural(pendingReview, "submission")} ${pendingReview === 1 ? "is" : "are"} waiting for admin review. The paper will appear here once approved.`
                  : "Papers submitted for this question weren’t approved. You can contribute a new one."
              }
              action={
                <Link
                  to="/contribute"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Contribute a paper
                </Link>
              }
            />
          ) : hydrated ? (
            <Suspense fallback={<ViewerSkeleton />}>
              <PdfViewer
                key={selected.id}
                url={submissionFileUrl(selected.id)}
              />
            </Suspense>
          ) : (
            <ViewerSkeleton />
          )}
        </section>

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-20">
            <SubmissionList
              submissions={question.submissions}
              selectedId={selected?.id ?? null}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
