import type { AdminReport, AdminReportList, ReportStatus } from "@qb/shared";
import { REPORT_HIDE_THRESHOLD, REPORT_STATUSES } from "@qb/shared/constants";
import {
  ArrowRight,
  CheckCircle2,
  EyeOff,
  Flag,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router";
import { ActionButton } from "~/components/admin/actions";
import { FilterTabs } from "~/components/admin/filter-tabs";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { Pagination } from "~/components/pagination";
import { StatusBadge } from "~/components/status-badge";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  adminSubmissionUrl,
  classificationLine,
  REPORT_STATUS_LABELS,
} from "~/lib/admin";
import { adminGetJson, adminRequest } from "~/lib/admin.server";
import { formatDate } from "~/lib/dates";
import { REPORT_REASON_LABELS } from "~/lib/engagement";
import { plural } from "~/lib/submissions";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/admin-reports";

export const meta: Route.MetaFunction = () => [
  { title: "Reports — Admin — QuestionBank" },
  { name: "robots", content: "noindex" },
];

const PAGE_SIZE = 20;

/** `?status=` filter: open reports by default, or `all`. */
function parseStatus(value: string | null): ReportStatus | "all" {
  if (value === "all") return "all";
  return REPORT_STATUSES.find((s) => s === value) ?? "pending";
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

  const list = await adminGetJson<AdminReportList>(
    request,
    `/reports?${query}`,
  );
  return { list, status };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  return adminRequest(
    request,
    "report",
    "PATCH",
    `/reports/${encodeURIComponent(String(form.get("reportId")))}`,
    { status: form.get("status") },
  );
}

function ReportCard({ report }: { report: AdminReport }) {
  const { submission } = report;
  const open = report.status === "pending";
  const hidden =
    submission.status === "pending_review" &&
    submission.pendingReportCount >= REPORT_HIDE_THRESHOLD;
  const id = String(report.id);

  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "rounded-lg p-2",
              open
                ? "bg-red-500/10 text-red-700 dark:text-red-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Flag className="size-4" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <h2 className="font-medium">
              {REPORT_REASON_LABELS[report.reason]}
            </h2>
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <ContributorAvatar
                name={report.reporter.name}
                image={report.reporter.image}
                size="xs"
              />
              <span>{report.reporter.name}</span>
              <span aria-hidden>·</span>
              <span>{report.reporter.email}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(report.createdAt)}</span>
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(!open && "text-muted-foreground")}
        >
          {REPORT_STATUS_LABELS[report.status]}
        </Badge>
      </div>

      {report.details && (
        <blockquote className="rounded-lg border-l-2 bg-muted/40 px-4 py-2.5 text-sm">
          {report.details}
        </blockquote>
      )}

      <Link
        to={adminSubmissionUrl(submission.id)}
        prefetch="intent"
        className="group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium group-hover:text-primary">
            {submission.classification.course.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {classificationLine(submission.classification)} ·{" "}
            {plural(submission.pendingReportCount, "open report")}
          </p>
        </div>
        {hidden && (
          <Badge
            variant="outline"
            className="text-amber-700 dark:text-amber-400"
          >
            <EyeOff aria-hidden />
            Hidden
          </Badge>
        )}
        <StatusBadge status={submission.status} />
        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {open ? (
          <>
            <ActionButton
              fields={{ reportId: id, status: "resolved" }}
              size="sm"
              pendingLabel="Resolving…"
            >
              <CheckCircle2 aria-hidden />
              Resolve
            </ActionButton>
            <ActionButton
              fields={{ reportId: id, status: "dismissed" }}
              size="sm"
              variant="outline"
              pendingLabel="Dismissing…"
            >
              Dismiss
            </ActionButton>
          </>
        ) : (
          <ActionButton
            fields={{ reportId: id, status: "pending" }}
            size="sm"
            variant="ghost"
          >
            <RotateCcw aria-hidden />
            Reopen
          </ActionButton>
        )}
        <Link
          to={adminSubmissionUrl(submission.id)}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "ml-auto",
          )}
        >
          Review paper
        </Link>
      </div>
    </Card>
  );
}

export default function AdminReports({ loaderData }: Route.ComponentProps) {
  const { list, status } = loaderData;
  const { counts } = list;

  const tabs = [
    ...REPORT_STATUSES.map((s) => ({
      search: s === "pending" ? "" : `?status=${s}`,
      label: REPORT_STATUS_LABELS[s],
      count: counts[s],
      active: status === s,
    })),
    {
      search: "?status=all",
      label: "All",
      count: counts.pending + counts.resolved + counts.dismissed,
      active: status === "all",
    },
  ];

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (status !== "pending") params.set("status", status);
    if (page > 1) params.set("page", String(page));
    return `?${params}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Moderation"
        title="Reports"
        description={`Problems readers flagged on published papers. A paper is hidden once it has ${REPORT_HIDE_THRESHOLD} open reports; resolving a report doesn’t publish it again.`}
      />

      <FilterTabs label="Filter by status" tabs={tabs} />

      {list.items.length === 0 ? (
        <EmptyState
          icon={Flag}
          title={status === "pending" ? "No open reports" : "No reports here"}
          description={
            status === "pending"
              ? "When readers report a problem with a paper, it shows up here."
              : undefined
          }
        />
      ) : (
        <ul className="grid gap-4">
          {list.items.map((report) => (
            <li key={report.id}>
              <ReportCard report={report} />
            </li>
          ))}
        </ul>
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
