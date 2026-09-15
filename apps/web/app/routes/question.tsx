import type {
  ApiError,
  CreatedReport,
  QuestionDetail,
  QuestionInteractions,
  Submission,
} from "@qb/shared";
import { Clock, Download, ExternalLink, Eye, FileX } from "lucide-react";
import {
  data,
  Link,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import {
  PaperToolbar,
  ReportNotice,
  type PaperViewer,
} from "~/components/paper-toolbar";
import { PdfViewer } from "~/components/pdf-viewer";
import { SubmissionList } from "~/components/submission-list";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { UploaderCard } from "~/components/uploader-card";
import { apiFetch, readJson } from "~/lib/api.server";
import {
  parseVoteValue,
  useCountView,
  type PaperActionResult,
} from "~/lib/engagement";
import { formatViews } from "~/lib/format";
import { hasSessionCookie, requireUser } from "~/lib/session.server";
import { plural, pickSubmission, submissionFileUrl } from "~/lib/submissions";
import type { Route } from "./+types/question";

/** The signed-in visitor's votes and reports. Skipped for anonymous visitors. */
async function loadInteractions(request: Request, questionId: string) {
  if (!hasSessionCookie(request)) return null;
  const res = await apiFetch(
    request,
    `/api/v1/me/questions/${encodeURIComponent(questionId)}/interactions`,
  );
  return res.ok ? readJson<QuestionInteractions>(res) : null;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const [res, interactions] = await Promise.all([
    apiFetch(request, `/api/v1/questions/${encodeURIComponent(params.id)}`),
    loadInteractions(request, params.id),
  ]);
  // 422 means a malformed id, which is just as "not found" for a visitor.
  if (res.status === 404 || res.status === 422) {
    throw data("Question not found", { status: 404 });
  }
  if (!res.ok) throw data("Failed to load question", { status: 502 });
  return {
    question: await readJson<QuestionDetail>(res),
    interactions,
    // The Google Docs viewer fallback needs absolute file URLs.
    origin: new URL(request.url).origin,
  };
}

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

async function actionResult(
  res: Response,
  intent: PaperActionResult["intent"],
  questionId: number,
) {
  if (res.ok) {
    const report =
      intent === "report" ? await readJson<CreatedReport>(res) : null;
    return data<PaperActionResult>({
      intent,
      questionId,
      ok: true,
      submissionHidden: report?.submissionHidden,
    });
  }
  const body = await readJson<ApiError>(res).catch(() => null);
  return data<PaperActionResult>(
    {
      intent,
      questionId,
      ok: false,
      error:
        body && body.error.code !== "VALIDATION_ERROR"
          ? body.error.message
          : "Something went wrong. Please try again.",
    },
    { status: res.status },
  );
}

/** Votes and reports on the question's papers, forwarded to the API. */
export async function action({ request, params }: Route.ActionArgs) {
  await requireUser(request);
  const questionId = Number(params.id);
  const form = await request.formData();
  const submissionPath = `/api/v1/submissions/${encodeURIComponent(String(form.get("submissionId") ?? ""))}`;

  switch (form.get("intent")) {
    case "vote": {
      const value = parseVoteValue(form.get("value"));
      if (value === undefined) throw data("Invalid vote", { status: 400 });
      const res = await apiFetch(
        request,
        `${submissionPath}/vote`,
        value === null ? { method: "DELETE" } : jsonInit("PUT", { value }),
      );
      return actionResult(res, "vote", questionId);
    }
    case "report": {
      const details = String(form.get("details") ?? "").trim();
      const res = await apiFetch(
        request,
        `${submissionPath}/reports`,
        jsonInit("POST", {
          reason: form.get("reason"),
          details: details || undefined,
        }),
      );
      return actionResult(res, "report", questionId);
    }
    default:
      throw data("Unknown action", { status: 400 });
  }
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

function viewerFor(
  submission: Submission,
  interactions: QuestionInteractions | null,
): PaperViewer {
  if (!interactions) return { kind: "anonymous" };
  if (submission.uploader?.id === interactions.userId) {
    return { kind: "uploader" };
  }
  return {
    kind: "member",
    vote:
      interactions.votes.find((vote) => vote.submissionId === submission.id)
        ?.value ?? null,
    reported: interactions.reportedSubmissionIds.includes(submission.id),
  };
}

export default function QuestionPage({ loaderData }: Route.ComponentProps) {
  const { question, interactions, origin } = loaderData;
  const [searchParams] = useSearchParams();
  const selected = pickSubmission(
    question.submissions,
    searchParams.get("submission"),
  );
  const { pendingReview } = question.submissionCounts;
  const fileUrl = selected ? submissionFileUrl(selected.id) : null;
  const title = `${question.course.name} — ${question.examType.name}, ${question.semester.name}`;
  const published = question.submissions.filter(
    (s) => s.status === "published",
  );
  const paperLabel = selected
    ? `Paper ${published.findIndex((s) => s.id === selected.id) + 1}`
    : "";

  useCountView(`/api/v1/questions/${question.id}/views`);
  useCountView(
    selected
      ? `/api/v1/submissions/${encodeURIComponent(selected.id)}/views`
      : null,
  );

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
          <Badge variant="outline" className="text-muted-foreground">
            <Eye aria-hidden />
            {formatViews(question.viewCount)}
          </Badge>
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section
          aria-label="Question paper"
          className="order-2 min-w-0 space-y-3 lg:order-1"
        >
          <ReportNotice questionId={question.id} />
          {selected && fileUrl ? (
            <>
              <PaperToolbar
                key={selected.id}
                submission={selected}
                label={paperLabel}
                viewer={viewerFor(selected, interactions)}
              />
              {/* Keyed so switching submissions reloads the embedded document. */}
              <PdfViewer
                key={selected.id}
                src={fileUrl}
                absoluteSrc={`${origin}${fileUrl}`}
                title={title}
              />
            </>
          ) : (
            <EmptyState
              className="min-h-[32rem] lg:h-[80vh]"
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
          )}
        </section>

        <aside className="order-1 lg:order-2">
          <div className="space-y-4 lg:sticky lg:top-20">
            <SubmissionList
              submissions={question.submissions}
              selectedId={selected?.id ?? null}
            />
            {selected && <UploaderCard submission={selected} />}
          </div>
        </aside>
      </div>
    </div>
  );
}
