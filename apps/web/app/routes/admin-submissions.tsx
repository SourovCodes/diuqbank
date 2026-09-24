import type {
  AdminSubmission,
  AdminSubmissionList,
  SubmissionStatus,
} from "@qb/shared";
import { SUBMISSION_STATUSES } from "@qb/shared/constants";
import {
  CircleCheck,
  CircleX,
  EllipsisVertical,
  ExternalLink,
  Eye,
  Inbox,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useFormAction } from "~/components/actions";
import { AdminPageHeader } from "~/components/admin/admin-header";
import {
  SubmissionFlags,
  SubmissionStatusBadge,
} from "~/components/admin/badges";
import { AdminRouteError } from "~/components/admin/route-error";
import { TablePagination } from "~/components/table-pagination";
import { UrlTabs } from "~/components/url-tabs";
import { UserAvatar } from "~/components/admin/user-avatar";
import { EmptyState } from "~/components/empty-state";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  adminSubmissionFileUrl,
  adminSubmissionUrl,
  classificationLine,
} from "~/lib/admin";
import { adminGetJson } from "~/lib/admin.server";
import { formatDate } from "~/lib/dates";
import { STATUS_LABELS } from "~/lib/submissions";
import type { Route } from "./+types/admin-submissions";

export const handle = { breadcrumb: "Submissions" };

export const meta: Route.MetaFunction = () => [
  { title: "Submissions — Admin — QuestionBank" },
  { name: "robots", content: "noindex" },
];

const PAGE_SIZE = 20;

/** `?status=` filter: pending review by default (the queue), or `all`. */
function parseStatus(value: string | null): SubmissionStatus | "all" {
  if (value === "all") return "all";
  return SUBMISSION_STATUSES.find((s) => s === value) ?? "pending_review";
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const status = parseStatus(url.searchParams.get("status"));
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (status !== "all") query.set("status", status);

  const list = await adminGetJson<AdminSubmissionList>(
    request,
    `/submissions?${query}`,
  );
  return { list, status };
}

export { AdminRouteError as ErrorBoundary };

type Run = ReturnType<typeof useFormAction>["run"];

/** Review, open the PDF, and quick decisions, posted to the review page's action. */
function RowActions({
  submission,
  run,
}: {
  submission: AdminSubmission;
  run: Run;
}) {
  const decide = (status: SubmissionStatus) =>
    run(
      { intent: "status", status },
      status === "published" ? "Paper published" : "Paper rejected",
      adminSubmissionUrl(submission.id),
    );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground data-[state=open]:bg-muted"
          aria-label={`Actions for ${submission.classification.course.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenuItem asChild>
          <Link to={adminSubmissionUrl(submission.id)}>
            <Eye />
            Review
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={adminSubmissionFileUrl(submission.id)}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink />
            Open PDF
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={
            submission.status === "published" || submission.questionId === null
          }
          onSelect={() => decide("published")}
        >
          <CircleCheck />
          Publish
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={submission.status === "rejected"}
          onSelect={() => decide("rejected")}
        >
          <CircleX />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminSubmissions({ loaderData }: Route.ComponentProps) {
  const { list, status } = loaderData;
  const { counts } = list;
  const navigate = useNavigate();
  // Owned by the page: a published paper leaves the pending list, row and all.
  const { run } = useFormAction();

  const tabs = [
    {
      value: "pending_review",
      label: STATUS_LABELS.pending_review,
      search: "",
      count: counts.pendingReview,
    },
    {
      value: "published",
      label: STATUS_LABELS.published,
      search: "?status=published",
      count: counts.published,
    },
    {
      value: "rejected",
      label: STATUS_LABELS.rejected,
      search: "?status=rejected",
      count: counts.rejected,
    },
    {
      value: "all",
      label: "All",
      search: "?status=all",
      count: counts.published + counts.pendingReview + counts.rejected,
    },
  ];

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (status !== "pending_review") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    return `?${params}`;
  };

  return (
    <>
      <AdminPageHeader
        title="Submissions"
        description="Review uploaded papers. Reported papers are listed first."
      />
      <UrlTabs label="Filter by status" tabs={tabs} value={status}>
        {list.items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={
              status === "pending_review"
                ? "Nothing to review"
                : "No submissions here"
            }
            description={
              status === "pending_review"
                ? "New uploads show up here."
                : undefined
            }
          />
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Paper</TableHead>
                  <TableHead className="hidden @3xl/main:table-cell">
                    Uploader
                  </TableHead>
                  <TableHead className="hidden @xl/main:table-cell">
                    Submitted
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.items.map((submission) => (
                  <TableRow
                    key={submission.id}
                    className="cursor-pointer"
                    onClick={() => navigate(adminSubmissionUrl(submission.id))}
                  >
                    <TableCell className="w-full max-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <Link
                          to={adminSubmissionUrl(submission.id)}
                          prefetch="intent"
                          className="truncate font-medium hover:underline"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {submission.classification.course.name}
                        </Link>
                        <SubmissionFlags {...submission} />
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {classificationLine(submission.classification)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden @3xl/main:table-cell">
                      {submission.uploader ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={submission.uploader.name}
                            image={submission.uploader.image}
                            className="size-6"
                          />
                          <span className="max-w-40 truncate">
                            {submission.uploader.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Deleted account
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground @xl/main:table-cell">
                      {formatDate(submission.createdAt)}
                    </TableCell>
                    <TableCell>
                      <SubmissionStatusBadge status={submission.status} />
                    </TableCell>
                    <TableCell>
                      <RowActions submission={submission} run={run} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TablePagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          noun="submission"
          hrefFor={hrefFor}
        />
      </UrlTabs>
    </>
  );
}
