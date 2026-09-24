import type { AdminSubmissionList, SubmissionStatus } from "@qb/shared";
import { SUBMISSION_STATUSES } from "@qb/shared/constants";
import { Inbox } from "lucide-react";
import { FilterTabs } from "~/components/admin/filter-tabs";
import { SubmissionItem } from "~/components/admin/submission-item";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { Pagination } from "~/components/pagination";
import { Card } from "~/components/ui/card";
import { adminGetJson } from "~/lib/admin.server";
import { STATUS_LABELS } from "~/lib/submissions";
import type { Route } from "./+types/admin-submissions";

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

const DESCRIPTIONS: Record<SubmissionStatus | "all", string> = {
  pending_review:
    "Papers waiting for a decision. Reported papers are listed first.",
  published: "Papers everyone can read.",
  rejected: "Papers that were turned down. Their uploaders can withdraw them.",
  all: "Every submission, in any status.",
};

export default function AdminSubmissions({ loaderData }: Route.ComponentProps) {
  const { list, status } = loaderData;
  const { counts } = list;
  const total = counts.published + counts.pendingReview + counts.rejected;

  const tabs = [
    {
      search: "",
      label: STATUS_LABELS.pending_review,
      count: counts.pendingReview,
      active: status === "pending_review",
    },
    {
      search: "?status=published",
      label: STATUS_LABELS.published,
      count: counts.published,
      active: status === "published",
    },
    {
      search: "?status=rejected",
      label: STATUS_LABELS.rejected,
      count: counts.rejected,
      active: status === "rejected",
    },
    {
      search: "?status=all",
      label: "All",
      count: total,
      active: status === "all",
    },
  ];

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (status !== "pending_review") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    return `?${params}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Moderation"
        title="Submissions"
        description={DESCRIPTIONS[status]}
      />

      <FilterTabs label="Filter by status" tabs={tabs} />

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
              ? "New uploads show up here. Enjoy the quiet."
              : undefined
          }
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <ul className="divide-y">
            {list.items.map((submission) => (
              <li key={submission.id}>
                <SubmissionItem submission={submission} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Pagination
        page={list.page}
        pageSize={list.pageSize}
        total={list.total}
        hrefFor={hrefFor}
      />
    </div>
  );
}
