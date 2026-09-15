import type {
  ApiError,
  ContributorSubmission,
  MySubmissionList,
  SubmissionStatus,
} from "@qb/shared";
import { ExternalLink, Eye, FileUp, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import {
  data,
  Link,
  useFetcher,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { EmptyState } from "~/components/empty-state";
import { SubmissionRow } from "~/components/submission-row";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { apiFetch, apiGetJson, readJson } from "~/lib/api.server";
import { ownSubmissionFileUrl, STATUS_LABELS } from "~/lib/submissions";
import { requireUser } from "~/lib/session.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/account-submissions";

export const meta: Route.MetaFunction = () => [
  { title: "My submissions — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const { items } = await apiGetJson<MySubmissionList>(
    request,
    "/api/v1/me/submissions",
  );
  return { userId: user.id, submissions: items };
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);
  const id = String((await request.formData()).get("id") ?? "");
  const res = await apiFetch(
    request,
    `/api/v1/me/submissions/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  if (res.status === 204) return { ok: true as const };

  const body = await readJson<ApiError>(res).catch(() => null);
  return data(
    {
      ok: false as const,
      error: body?.error.message ?? "Could not withdraw this submission.",
    },
    { status: res.status },
  );
}

// The status filter is applied in the browser, so changing it needs no reload.
export function shouldRevalidate({
  formMethod,
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  return formMethod || currentUrl.pathname !== nextUrl.pathname
    ? defaultShouldRevalidate
    : false;
}

const FILTER_STATUSES: SubmissionStatus[] = [
  "published",
  "pending_review",
  "rejected",
];

function WithdrawButton({ submission }: { submission: ContributorSubmission }) {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  const busy = fetcher.state !== "idle";
  const error = fetcher.data?.ok === false ? fetcher.data.error : undefined;
  const { course, semester, examType } = submission.classification;

  return (
    <>
      {error && (
        <p role="alert" className="mr-auto text-xs text-destructive">
          {error}
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden />
            {busy ? "Withdrawing…" : "Withdraw"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw this submission?</DialogTitle>
            <DialogDescription>
              {course.name} · {semester.name} · {examType.name}. The PDF is
              deleted and can’t be recovered.
            </DialogDescription>
          </DialogHeader>
          <fetcher.Form method="post" onSubmit={() => setOpen(false)}>
            <input type="hidden" name="id" value={submission.id} />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive">
                Withdraw
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SubmissionActions({
  submission,
}: {
  submission: ContributorSubmission;
}) {
  const outline = buttonVariants({ variant: "outline", size: "sm" });

  if (submission.status === "published" && submission.questionId !== null) {
    return (
      <Link
        to={`/questions/${submission.questionId}?submission=${encodeURIComponent(submission.id)}`}
        className={outline}
      >
        <Eye aria-hidden />
        View
      </Link>
    );
  }
  return (
    <>
      {/* A plain link: the PDF comes straight from the API, not a page route. */}
      <a
        href={ownSubmissionFileUrl(submission.id)}
        target="_blank"
        rel="noreferrer"
        className={outline}
      >
        <ExternalLink aria-hidden />
        Preview
      </a>
      {submission.status !== "published" && (
        <WithdrawButton submission={submission} />
      )}
    </>
  );
}

export default function AccountSubmissions({
  loaderData,
}: Route.ComponentProps) {
  const { userId, submissions } = loaderData;
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("status");
  const status = FILTER_STATUSES.find((s) => s === requested) ?? null;
  const visible = status
    ? submissions.filter((s) => s.status === status)
    : submissions;

  const filters = [
    { status: null, label: "All", count: submissions.length },
    ...FILTER_STATUSES.map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
      count: submissions.filter((submission) => submission.status === s).length,
    })),
  ];

  return (
    <section aria-labelledby="my-submissions-heading" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 id="my-submissions-heading" className="text-lg font-semibold">
            My submissions
          </h2>
          <p className="text-sm text-muted-foreground">
            Follow the review of your papers, and withdraw ones that aren’t
            published.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {submissions.length > 0 && (
            <Link
              to={`/contributors/${encodeURIComponent(userId)}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Public profile
            </Link>
          )}
          <Link to="/contribute" className={buttonVariants({ size: "sm" })}>
            <Upload aria-hidden />
            Contribute
          </Link>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={FileUp}
          title="No submissions yet"
          description="Papers you upload show up here while they’re reviewed."
          action={
            <Link
              to="/contribute"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Contribute a paper
            </Link>
          }
        />
      ) : (
        <>
          <nav
            aria-label="Filter by status"
            className="flex gap-1 overflow-x-auto border-b"
          >
            {filters.map((filter) => {
              const active = filter.status === status;
              return (
                <Link
                  key={filter.label}
                  to={{
                    search: filter.status ? `?status=${filter.status}` : "",
                  }}
                  replace
                  preventScrollReset
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                  <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground tabular-nums">
                    {filter.count}
                  </span>
                </Link>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <EmptyState
              title={`No ${STATUS_LABELS[status!].toLowerCase()} submissions`}
            />
          ) : (
            <ul className="grid gap-3">
              {visible.map((submission) => (
                <li key={submission.id}>
                  <SubmissionRow
                    submission={submission}
                    actions={<SubmissionActions submission={submission} />}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="text-xs text-muted-foreground">
            Published papers can’t be withdrawn. Contact an admin if one needs
            to be removed.
          </p>
        </>
      )}
    </section>
  );
}
