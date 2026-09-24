import type {
  AdminSubmissionDetail,
  AdminSubmissionReport,
  SubmissionStatus,
} from "@qb/shared";
import { REPORT_HIDE_THRESHOLD } from "@qb/shared/constants";
import {
  CircleCheck,
  CircleX,
  EllipsisVertical,
  ExternalLink,
  EyeOff,
  Globe,
  Pencil,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link, redirect } from "react-router";
import {
  ActionDialog,
  ConfirmAction,
  useFormAction,
} from "~/components/actions";
import { AdminPageHeader } from "~/components/admin/admin-header";
import {
  ReportStatusBadge,
  SubmissionFlags,
  SubmissionStatusBadge,
} from "~/components/admin/badges";
import { AdminRouteError } from "~/components/admin/route-error";
import { UserAvatar } from "~/components/admin/user-avatar";
import {
  ClassificationFields,
  defaultsFrom,
} from "~/components/classification-fields";
import { PaperDetailsFields } from "~/components/paper-details-fields";
import { PdfViewer } from "~/components/pdf-viewer";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  adminSubmissionFileUrl,
  classificationLine,
  proposesNewEntries,
} from "~/lib/admin";
import { adminGetJson, adminRequest, formObject } from "~/lib/admin.server";
import { formatDate } from "~/lib/dates";
import { REPORT_REASON_LABELS } from "~/lib/engagement";
import { formatBytes, formatCount } from "~/lib/format";
import { STATUS_LABELS } from "~/lib/submissions";
import { loadTaxonomy } from "~/lib/taxonomy.server";
import type { Route } from "./+types/admin-submission";

type LoaderData = Awaited<ReturnType<typeof loader>>;

export const handle = {
  breadcrumb: (data: unknown) =>
    (data as LoaderData | undefined)?.submission.classification.course.name ??
    "Submission",
};

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

export { AdminRouteError as ErrorBoundary };

const SUCCESS: Record<SubmissionStatus, string> = {
  published: "Paper published",
  rejected: "Paper rejected",
  pending_review: "Moved back to review",
};

/** Publish / reject / back-to-review buttons, plus a menu with the rest. */
function DecisionActions({
  submission,
}: {
  submission: AdminSubmissionDetail;
}) {
  const [deleting, setDeleting] = useState(false);
  const needsClassification = submission.questionId === null;
  const { status } = submission;
  const { busy, pending, run } = useFormAction();
  const decide = (next: SubmissionStatus) => ({
    disabled: busy,
    onClick: () => run({ intent: "status", status: next }, SUCCESS[next]),
  });
  const deciding = pending?.get("status");

  const publish = (
    <Button
      {...decide("published")}
      size="sm"
      disabled={busy || needsClassification}
    >
      <CircleCheck />
      {deciding === "published" ? "Publishing…" : "Publish"}
    </Button>
  );

  return (
    <>
      {status !== "published" &&
        (needsClassification ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Disabled buttons don't fire pointer events; the span does. */}
              <span tabIndex={0}>{publish}</span>
            </TooltipTrigger>
            <TooltipContent>Approve the new entries first</TooltipContent>
          </Tooltip>
        ) : (
          publish
        ))}
      {status !== "rejected" && (
        <Button {...decide("rejected")} size="sm" variant="outline">
          <CircleX />
          {deciding === "rejected" ? "Rejecting…" : "Reject"}
        </Button>
      )}
      {status !== "pending_review" && (
        <Button {...decide("pending_review")} size="sm" variant="outline">
          <RotateCcw />
          Back to review
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label="More actions">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
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
          {submission.questionId !== null && status === "published" && (
            <DropdownMenuItem asChild>
              <Link
                to={`/questions/${submission.questionId}?submission=${encodeURIComponent(submission.id)}`}
              >
                <Globe />
                Open the public page
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleting(true)}
          >
            <Trash2 />
            Delete paper
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmAction
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this paper?"
        description={`${submission.classification.course.name} · ${classificationLine(submission.classification)}. The PDF, its votes and its reports are deleted for good.`}
        confirmLabel="Delete"
        destructive
        fields={{ intent: "delete" }}
      />
    </>
  );
}

function ClassificationCard({
  submission,
  taxonomy,
}: {
  submission: AdminSubmissionDetail;
  taxonomy: LoaderData["taxonomy"];
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
    { label: "Section", value: submission.section ?? "—", isNew: false },
    { label: "Batch", value: submission.batch ?? "—", isNew: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classification</CardTitle>
        <CardAction>
          <ActionDialog
            trigger={
              <Button variant={proposes ? "default" : "outline"} size="sm">
                {proposes ? <Sparkles /> : <Pencil />}
                {proposes ? "Review entries" : "Edit"}
              </Button>
            }
            title={proposes ? "Approve new entries" : "Edit classification"}
            description={
              proposes
                ? "New names are added to the catalog when you save. Pick an existing entry instead if one already fits."
                : "Move this paper to another department, course, semester or exam type, or fix its section and batch."
            }
            submitLabel={proposes ? "Approve and save" : "Save"}
            pendingLabel="Saving…"
            successMessage={
              proposes ? "New entries approved" : "Classification saved"
            }
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
                <PaperDetailsFields
                  fieldErrors={fieldErrors}
                  defaults={submission}
                />
              </div>
            )}
          </ActionDialog>
        </CardAction>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 text-sm">
          {rows.map(({ label, value, isNew }) => (
            <div key={label} className="grid gap-0.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="flex items-center gap-2 font-medium">
                <span className="min-w-0 break-words">{value}</span>
                {isNew && <Badge variant="secondary">New</Badge>}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function DetailsCard({ submission }: { submission: AdminSubmissionDetail }) {
  const { uploader } = submission;
  const details = [
    { label: "Uploaded", value: formatDate(submission.createdAt) },
    { label: "Last changed", value: formatDate(submission.updatedAt) },
    { label: "File size", value: formatBytes(submission.fileSize) },
    { label: "Views", value: formatCount(submission.viewCount) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {uploader ? (
          <Link
            to={`/contributors/${encodeURIComponent(uploader.id)}`}
            className="-m-2 flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
          >
            <UserAvatar name={uploader.name} image={uploader.image} />
            <div className="grid min-w-0 text-sm leading-tight">
              <span className="truncate font-medium">{uploader.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {uploader.email}
              </span>
            </div>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">
            The uploader deleted their account.
          </p>
        )}
        <Separator />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {details.map(({ label, value }) => (
            <div key={label} className="grid gap-0.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-4 text-sm text-muted-foreground">
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
      </CardContent>
    </Card>
  );
}

function ReportItem({ report }: { report: AdminSubmissionReport }) {
  const { busy, run } = useFormAction();
  const update = (status: string, message: string) => ({
    size: "xs" as const,
    disabled: busy,
    onClick: () =>
      run({ intent: "report", reportId: String(report.id), status }, message),
  });

  return (
    <li className="grid gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium">
          {REPORT_REASON_LABELS[report.reason]}
        </p>
        <ReportStatusBadge status={report.status} />
      </div>
      {report.details && (
        <p className="border-l-2 pl-3 text-sm text-muted-foreground">
          {report.details}
        </p>
      )}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <UserAvatar
          name={report.reporter.name}
          image={report.reporter.image}
          className="size-5"
        />
        <span className="truncate">{report.reporter.name}</span>
        <span aria-hidden>·</span>
        <span className="shrink-0">{formatDate(report.createdAt)}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {report.status === "pending" ? (
          <>
            <Button
              {...update("resolved", "Report resolved")}
              variant="outline"
            >
              <CircleCheck />
              Resolve
            </Button>
            <Button
              {...update("dismissed", "Report dismissed")}
              variant="ghost"
            >
              Dismiss
            </Button>
          </>
        ) : (
          <Button {...update("pending", "Report reopened")} variant="ghost">
            <RotateCcw />
            Reopen
          </Button>
        )}
      </div>
    </li>
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
    <>
      <AdminPageHeader
        title={classification.course.name}
        description={`${classification.department.name} · ${classificationLine(classification)}`}
        actions={<DecisionActions submission={submission} />}
      >
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SubmissionStatusBadge status={submission.status} />
          <SubmissionFlags {...submission} />
        </div>
      </AdminPageHeader>

      {newEntries.length > 0 && (
        <Alert>
          <Sparkles />
          <AlertTitle>This paper proposes new catalog entries</AlertTitle>
          <AlertDescription>
            The uploader added a new {newEntries.join(", ")}. Approve them, or
            pick existing entries, before publishing.
          </AlertDescription>
        </Alert>
      )}
      {hiddenByReports && (
        <Alert>
          <EyeOff />
          <AlertTitle>
            Hidden after {submission.pendingReportCount} reports
          </AlertTitle>
          <AlertDescription>
            Resolve or dismiss the reports, then publish the paper again if it’s
            fine.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-4 @5xl/main:grid-cols-[minmax(0,1fr)_22rem]">
        <PdfViewer
          src={adminSubmissionFileUrl(submission.id)}
          title={`${classification.course.name} — ${STATUS_LABELS[submission.status]}`}
        />
        <div className="grid gap-4">
          <ClassificationCard submission={submission} taxonomy={taxonomy} />
          {submission.reports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
                <CardDescription>
                  {openReports.length} open of {submission.reports.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y">
                  {submission.reports.map((report) => (
                    <ReportItem key={report.id} report={report} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <DetailsCard submission={submission} />
        </div>
      </div>
    </>
  );
}
