import type {
  ApiError,
  ContributorSubmission,
  MySubmissionList,
  SubmissionStatus,
} from "@qb/shared";
import {
  EllipsisVertical,
  ExternalLink,
  Eye,
  FileUp,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import {
  data,
  Link,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from "react-router";
import { ConfirmAction, useFormAction } from "~/components/actions";
import { EmptyState } from "~/components/empty-state";
import { publicUrl, SubmissionTable } from "~/components/submission-table";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { UrlTabs } from "~/components/url-tabs";
import type { ActionResult } from "~/lib/action-result";
import { apiFetch, apiGetJson, readJson } from "~/lib/api.server";
import { requireUser } from "~/lib/session.server";
import { ownSubmissionFileUrl, STATUS_LABELS } from "~/lib/submissions";
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
  if (res.status === 204) {
    return data<ActionResult>({ ok: true, intent: "withdraw" });
  }

  const body = await readJson<ApiError>(res).catch(() => null);
  return data<ActionResult>(
    {
      ok: false,
      intent: "withdraw",
      error: body?.error.message ?? "Could not withdraw this submission.",
      fieldErrors: {},
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

/** View or preview the paper, and withdraw it while it isn't published. */
function RowActions({
  submission,
  run,
}: {
  submission: ContributorSubmission;
  run: ReturnType<typeof useFormAction>["run"];
}) {
  const [withdrawing, setWithdrawing] = useState(false);
  const href = publicUrl(submission);
  const { course, semester, examType } = submission.classification;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground data-[state=open]:bg-muted"
            aria-label={`Actions for ${course.name}`}
          >
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {href ? (
            <DropdownMenuItem asChild>
              <Link to={href}>
                <Eye />
                View
              </Link>
            </DropdownMenuItem>
          ) : (
            // A plain link: the PDF comes straight from the API, not a page route.
            <DropdownMenuItem asChild>
              <a
                href={ownSubmissionFileUrl(submission.id)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                Preview
              </a>
            </DropdownMenuItem>
          )}
          {submission.status !== "published" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setWithdrawing(true)}
              >
                <Trash2 />
                Withdraw
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmAction
        open={withdrawing}
        onOpenChange={setWithdrawing}
        title="Withdraw this submission?"
        description={`${course.name} · ${semester.name} · ${examType.name}. The PDF is deleted and can’t be recovered.`}
        confirmLabel="Withdraw"
        destructive
        successMessage="Submission withdrawn"
        fields={{ id: submission.id }}
        run={run}
      />
    </>
  );
}

export default function AccountSubmissions({
  loaderData,
}: Route.ComponentProps) {
  const { userId, submissions } = loaderData;
  // Owned by the page: a withdrawn submission's row disappears.
  const { run } = useFormAction();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("status");
  const status = FILTER_STATUSES.find((s) => s === requested) ?? null;
  const visible = status
    ? submissions.filter((s) => s.status === status)
    : submissions;

  const tabs = [
    { value: "all", label: "All", search: "", count: submissions.length },
    ...FILTER_STATUSES.map((s) => ({
      value: s,
      label: STATUS_LABELS[s],
      search: `?status=${s}`,
      count: submissions.filter((submission) => submission.status === s).length,
    })),
  ];

  return (
    <section aria-labelledby="my-submissions-heading" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            <Button variant="outline" size="sm" asChild>
              <Link to={`/contributors/${encodeURIComponent(userId)}`}>
                Public profile
              </Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link to="/contribute">
              <Upload />
              Contribute
            </Link>
          </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={FileUp}
          title="No submissions yet"
          description="Papers you upload show up here while they’re reviewed."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link to="/contribute">Contribute a paper</Link>
            </Button>
          }
        />
      ) : (
        <UrlTabs label="Filter by status" tabs={tabs} value={status ?? "all"}>
          {visible.length === 0 ? (
            <EmptyState
              title={`No ${STATUS_LABELS[status!].toLowerCase()} submissions`}
            />
          ) : (
            <SubmissionTable
              submissions={visible}
              actions={(submission) => (
                <RowActions submission={submission} run={run} />
              )}
            />
          )}
          <p className="px-1 text-xs text-muted-foreground">
            Published papers can’t be withdrawn. Contact an admin if one needs
            to be removed.
          </p>
        </UrlTabs>
      )}
    </section>
  );
}
