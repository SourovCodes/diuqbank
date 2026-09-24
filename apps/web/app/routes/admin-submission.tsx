import type {
  AdminSubmissionDetail,
  AdminSubmissionReport,
  SubmissionStatus,
} from "@qb/shared";
import { REPORT_HIDE_THRESHOLD } from "@qb/shared/constants";
import {
  CheckCircle2,
  Clock,
  EyeOff,
  Flag,
  Pencil,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link, redirect } from "react-router";
import { ActionButton, ActionDialog } from "~/components/admin/actions";
import { SubmissionFlags } from "~/components/admin/submission-item";
import {
  ClassificationFields,
  defaultsFrom,
} from "~/components/classification-fields";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { PdfViewer } from "~/components/pdf-viewer";
import { StatusBadge } from "~/components/status-badge";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  adminSubmissionFileUrl,
  classificationLine,
  proposesNewEntries,
  REPORT_STATUS_LABELS,
} from "~/lib/admin";
import { adminGetJson, adminRequest, formObject } from "~/lib/admin.server";
import { formatDate } from "~/lib/dates";
import { REPORT_REASON_LABELS } from "~/lib/engagement";
import { formatBytes, formatCount } from "~/lib/format";
import { STATUS_LABELS } from "~/lib/submissions";
import { loadTaxonomy } from "~/lib/taxonomy.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/admin-submission";

export const meta: Route.MetaFunction = ({ loaderData }) => [
  {
    title: `${loaderData?.submission.classification.course.name ?? "Submission"} — Admin — QuestionBank`,
  },
  { name: "robots", content: "noindex" },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  const [submission, taxonomy] = await Promise.all([
    adminGetJson<AdminSubmissionDetail>(
      request,
      `/submissions/${encodeURIComponent(params.id)}`,
    ),
    loadTaxonomy(request),
  ]);
  return { submission, taxonomy };
}

export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const path = `/submissions/${encodeURIComponent(params.id)}`;

  switch (intent) {
    case "status":
      return adminRequest(request, intent, "PATCH", path, {
        status: form.get("status"),
      });
    case "classify":
      return adminRequest(
        request,
        intent,
        "PUT",
        `${path}/classification`,
        formObject(form, "intent"),
      );
    case "report":
      return adminRequest(
        request,
        intent,
        "PATCH",
        `/reports/${encodeURIComponent(String(form.get("reportId")))}`,
        { status: form.get("status") },
      );
    case "delete": {
      const result = await adminRequest(request, intent, "DELETE", path);
      return result.data.ok ? redirect("/admin/submissions") : result;
    }
    default:
      throw new Response("Unknown intent", { status: 400 });
  }
}

const DECISIONS: {
  status: SubmissionStatus;
  label: string;
  icon: typeof CheckCircle2;
  variant: "default" | "outline" | "ghost";
}[] = [
  {
    status: "published",
    label: "Publish",
    icon: CheckCircle2,
    variant: "default",
  },
  { status: "rejected", label: "Reject", icon: XCircle, variant: "outline" },
  {
    status: "pending_review",
    label: "Back to review",
    icon: RotateCcw,
    variant: "ghost",
  },
];

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-4 p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

function DecisionPanel({ submission }: { submission: AdminSubmissionDetail }) {
  const needsClassification = submission.questionId === null;

  return (
    <Panel title="Decision" action={<StatusBadge status={submission.status} />}>
      <div className="flex flex-wrap gap-2">
        {DECISIONS.filter((d) => d.status !== submission.status).map(
          ({ status, label, icon: Icon, variant }) => (
            <ActionButton
              key={status}
              fields={{ intent: "status", status }}
              variant={variant}
              size="sm"
              disabled={status === "published" && needsClassification}
              pendingLabel={`${label}…`}
              className={cn(
                variant === "outline" &&
                  "text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
            >
              <Icon aria-hidden />
              {label}
            </ActionButton>
          ),
        )}
      </div>
      {needsClassification && (
        <p className="text-xs text-muted-foreground">
          Approve the new entries under Classification before publishing.
        </p>
      )}
      <div className="border-t pt-4">
        <ActionDialog
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 aria-hidden />
              Delete paper
            </Button>
          }
          title="Delete this paper?"
          description={`${submission.classification.course.name} · ${classificationLine(submission.classification)}. The PDF, its votes and its reports are deleted for good.`}
          submitLabel="Delete"
          pendingLabel="Deleting…"
          destructive
          fields={{ intent: "delete" }}
        />
      </div>
    </Panel>
  );
}

function ClassificationPanel({
  submission,
  taxonomy,
}: {
  submission: AdminSubmissionDetail;
  taxonomy: Awaited<ReturnType<typeof loadTaxonomy>>;
}) {
  const { department, course, semester, examType } = submission.classification;
  const proposes = proposesNewEntries(submission.classification);
  const rows = [
    {
      label: "Department",
      value: department.shortName
        ? `${department.name} (${department.shortName})`
        : department.name,
      isNew: department.id === null,
    },
    { label: "Course", value: course.name, isNew: course.id === null },
    { label: "Semester", value: semester.name, isNew: semester.id === null },
    { label: "Exam type", value: examType.name, isNew: false },
  ];

  return (
    <Panel
      title="Classification"
      action={
        <ActionDialog
          trigger={
            <Button variant={proposes ? "default" : "outline"} size="sm">
              {proposes ? <Sparkles aria-hidden /> : <Pencil aria-hidden />}
              {proposes ? "Review entries" : "Edit"}
            </Button>
          }
          title={proposes ? "Approve new entries" : "Edit classification"}
          description={
            proposes
              ? "New names are added to the catalog when you save. Pick an existing entry instead if one already fits."
              : "Move this paper to another department, course, semester or exam type."
          }
          submitLabel={proposes ? "Approve and save" : "Save"}
          pendingLabel="Saving…"
          fields={{ intent: "classify" }}
          className="sm:max-w-2xl"
        >
          {(fieldErrors) => (
            <div className="grid gap-5 sm:grid-cols-2">
              <ClassificationFields
                {...taxonomy}
                fieldErrors={fieldErrors}
                defaults={defaultsFrom(submission.classification)}
                shortNameOptional={false}
              />
            </div>
          )}
        </ActionDialog>
      }
    >
      <dl className="grid gap-3 text-sm">
        {rows.map(({ label, value, isNew }) => (
          <div key={label} className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-2 font-medium">
              <span className="min-w-0 break-words">{value}</span>
              {isNew && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-primary"
                >
                  New
                </Badge>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {submission.questionId !== null && submission.status === "published" && (
        <Link
          to={`/questions/${submission.questionId}?submission=${encodeURIComponent(submission.id)}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Open the public page
        </Link>
      )}
    </Panel>
  );
}

function DetailsPanel({ submission }: { submission: AdminSubmissionDetail }) {
  const { uploader } = submission;
  const details = [
    { label: "Uploaded", value: formatDate(submission.createdAt) },
    { label: "Last changed", value: formatDate(submission.updatedAt) },
    { label: "File size", value: formatBytes(submission.fileSize) },
    { label: "Views", value: formatCount(submission.viewCount) },
  ];

  return (
    <Panel title="Details">
      {uploader ? (
        <Link
          to={`/contributors/${encodeURIComponent(uploader.id)}`}
          className="-m-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <ContributorAvatar name={uploader.name} image={uploader.image} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{uploader.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {uploader.email}
            </p>
          </div>
        </Link>
      ) : (
        <p className="text-sm text-muted-foreground">
          The uploader deleted their account.
        </p>
      )}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {details.map(({ label, value }) => (
          <div key={label} className="grid gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
        <div className="col-span-2 flex gap-4 text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ThumbsUp className="size-4" aria-hidden />
            <span className="sr-only">Likes</span>
            {formatCount(submission.likeCount)}
          </span>
          <span className="flex items-center gap-1.5">
            <ThumbsDown className="size-4" aria-hidden />
            <span className="sr-only">Dislikes</span>
            {formatCount(submission.dislikeCount)}
          </span>
        </div>
      </dl>
    </Panel>
  );
}

function ReportItem({ report }: { report: AdminSubmissionReport }) {
  const open = report.status === "pending";
  return (
    <li className="grid gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">
          {REPORT_REASON_LABELS[report.reason]}
        </p>
        <Badge
          variant="outline"
          className={cn(
            open ? "text-red-700 dark:text-red-400" : "text-muted-foreground",
          )}
        >
          {REPORT_STATUS_LABELS[report.status]}
        </Badge>
      </div>
      {report.details && (
        <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">
          {report.details}
        </blockquote>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ContributorAvatar
          name={report.reporter.name}
          image={report.reporter.image}
          size="xs"
        />
        <span className="truncate">{report.reporter.name}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0">{formatDate(report.createdAt)}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {open ? (
          <>
            <ActionButton
              fields={{
                intent: "report",
                reportId: String(report.id),
                status: "resolved",
              }}
              variant="outline"
              size="xs"
            >
              <CheckCircle2 aria-hidden />
              Resolve
            </ActionButton>
            <ActionButton
              fields={{
                intent: "report",
                reportId: String(report.id),
                status: "dismissed",
              }}
              variant="ghost"
              size="xs"
            >
              Dismiss
            </ActionButton>
          </>
        ) : (
          <ActionButton
            fields={{
              intent: "report",
              reportId: String(report.id),
              status: "pending",
            }}
            variant="ghost"
            size="xs"
          >
            <RotateCcw aria-hidden />
            Reopen
          </ActionButton>
        )}
      </div>
    </li>
  );
}

function Callout({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: typeof Sparkles;
  tone: "primary" | "amber";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-sm",
        tone === "primary"
          ? "border-primary/30 bg-primary/5"
          : "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "primary"
            ? "text-primary"
            : "text-amber-700 dark:text-amber-400",
        )}
        aria-hidden
      />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

export default function AdminSubmission({ loaderData }: Route.ComponentProps) {
  const { submission, taxonomy } = loaderData;
  const { classification } = submission;
  const openReports = submission.reports.filter((r) => r.status === "pending");
  const hiddenByReports =
    submission.status === "pending_review" &&
    submission.pendingReportCount >= REPORT_HIDE_THRESHOLD;
  const newEntries = [
    classification.department.id === null &&
      `department “${classification.department.name}”`,
    classification.course.id === null &&
      `course “${classification.course.name}”`,
    classification.semester.id === null &&
      `semester “${classification.semester.name}”`,
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: "/admin/submissions", label: "Submissions" }}
        eyebrow={classification.department.name}
        title={classification.course.name}
        description={classificationLine(classification)}
      >
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <StatusBadge status={submission.status} />
          <SubmissionFlags submission={submission} />
        </div>
      </PageHeader>

      {newEntries.length > 0 && (
        <Callout
          icon={Sparkles}
          tone="primary"
          title="This paper proposes new catalog entries"
        >
          The uploader added a new {newEntries.join(", ")}. Approve them, or
          pick existing entries, before publishing.
        </Callout>
      )}
      {hiddenByReports && (
        <Callout
          icon={EyeOff}
          tone="amber"
          title={`Hidden after ${submission.pendingReportCount} reports`}
        >
          Resolve or dismiss the reports, then publish the paper again if it’s
          fine.
        </Callout>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <PdfViewer
          src={adminSubmissionFileUrl(submission.id)}
          title={`${classification.course.name} — ${STATUS_LABELS[submission.status]}`}
        />

        <div className="grid gap-4 lg:sticky lg:top-20">
          <DecisionPanel submission={submission} />
          <ClassificationPanel submission={submission} taxonomy={taxonomy} />
          {submission.reports.length > 0 && (
            <Panel
              title="Reports"
              action={
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {openReports.length > 0 ? (
                    <Flag className="size-3.5" aria-hidden />
                  ) : (
                    <Clock className="size-3.5" aria-hidden />
                  )}
                  {openReports.length} open
                </span>
              }
            >
              <ul className="divide-y">
                {submission.reports.map((report) => (
                  <ReportItem key={report.id} report={report} />
                ))}
              </ul>
            </Panel>
          )}
          <DetailsPanel submission={submission} />
        </div>
      </div>
    </div>
  );
}
