import type { MySubmissionDetail, UploaderAnalysis } from "@qb/shared";
import {
  Bot,
  ChevronDown,
  CircleCheck,
  ExternalLink,
  Globe,
  LoaderCircle,
  Pencil,
  Trash2,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { data, Link, redirect, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ActionDialog, ConfirmAction } from "~/components/actions";
import {
  ClassificationFields,
  defaultsFrom,
} from "~/components/classification-fields";
import { PageHeader } from "~/components/page-header";
import { PaperDetailsFields } from "~/components/paper-details-fields";
import { PdfViewer } from "~/components/pdf-viewer";
import { RelativeTime } from "~/components/relative-time";
import { TONE_CLASSES, ToneIcon } from "~/components/review-stage";
import { StatusBadge } from "~/components/status-badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useRefreshWhile } from "~/hooks/use-refresh-while";
import {
  classificationFields,
  classificationFromAnalysis,
  compareWithAnalysis,
  type ComparisonRow,
} from "~/lib/analysis";
import { apiFetch, apiRequest, readJson } from "~/lib/api.server";
import { formatBytes } from "~/lib/format";
import { formObject } from "~/lib/form";
import { isChecking, reviewStage, type ReviewStage } from "~/lib/review";
import { requireUser } from "~/lib/session.server";
import {
  classificationLine,
  ownSubmissionFileUrl,
  paperDetails,
  publicUrl,
} from "~/lib/submissions";
import { loadTaxonomy } from "~/lib/taxonomy.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/account-submission";

export const meta: Route.MetaFunction = ({ loaderData }) => [
  {
    title: `${loaderData?.submission.classification.course.name ?? "Submission"} — My submissions — QuestionBank`,
  },
  { name: "robots", content: "noindex" },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireUser(request);
  const res = await apiFetch(
    request,
    `/api/v1/me/submissions/${encodeURIComponent(params.id)}`,
  );
  if (res.status === 404) throw data("Not found", { status: 404 });
  if (!res.ok) throw data("Could not load the submission", { status: 502 });
  const submission = await readJson<MySubmissionDetail>(res);
  // The pickers are only needed while the details can still be changed.
  const taxonomy =
    submission.status === "pending_review" ? await loadTaxonomy(request) : null;
  return { submission, taxonomy };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireUser(request);
  const form = await request.formData();
  const intent = String(form.get("intent"));
  const path = `/api/v1/me/submissions/${encodeURIComponent(params.id)}`;

  if (intent === "withdraw") {
    const result = await apiRequest(request, intent, "DELETE", path);
    return result.data.ok ? redirect("/account/submissions") : result;
  }
  if (intent === "details") {
    return apiRequest(
      request,
      intent,
      "PUT",
      `${path}/classification`,
      formObject(form, "intent"),
    );
  }
  throw new Response("Unknown intent", { status: 400 });
}

const BANNER_TONES: Record<ReviewStage["tone"], string> = {
  progress: "border-sky-500/30 bg-sky-500/5",
  success: "border-emerald-500/30 bg-emerald-500/5",
  attention: "border-amber-500/40 bg-amber-500/5",
  neutral: "bg-muted/40",
};

/** One sentence of where the paper stands, coloured by how it's going. */
function StatusBanner({ stage }: { stage: ReviewStage }) {
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        BANNER_TONES[stage.tone],
      )}
    >
      <ToneIcon
        tone={stage.tone}
        className={cn("mt-0.5 size-5", TONE_CLASSES[stage.tone])}
      />
      <div className="grid gap-0.5">
        <p className={cn("font-medium", TONE_CLASSES[stage.tone])}>
          {stage.label}
        </p>
        <p className="text-sm text-muted-foreground">{stage.description}</p>
      </div>
    </div>
  );
}

type Taxonomy = NonNullable<Route.ComponentProps["loaderData"]["taxonomy"]>;

/** Change department, course, semester, exam type, section and batch. */
function EditDetailsDialog({
  submission,
  taxonomy,
  trigger,
}: {
  submission: MySubmissionDetail;
  taxonomy: Taxonomy;
  trigger: React.ReactElement;
}) {
  return (
    <ActionDialog
      trigger={trigger}
      title="Edit details"
      description="Correct what the paper is filed under. If your details then match what the AI read, it’s published right away."
      submitLabel="Save"
      pendingLabel="Saving…"
      successMessage="Details saved"
      fields={{ intent: "details" }}
      className="sm:max-w-2xl"
    >
      {(fieldErrors) => (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ClassificationFields
            {...taxonomy}
            fieldErrors={fieldErrors}
            defaults={defaultsFrom(submission.classification)}
          />
          <PaperDetailsFields fieldErrors={fieldErrors} defaults={submission} />
        </div>
      )}
    </ActionDialog>
  );
}

function ComparisonItem({ row }: { row: ComparisonRow }) {
  return (
    <div className="grid gap-1 text-sm">
      <dt className="text-muted-foreground">{row.label}</dt>
      <dd className="grid gap-0.5">
        {row.differs ? (
          <>
            <span className="break-words">
              <span className="text-muted-foreground">You chose </span>
              {row.submitted ?? "nothing"}
            </span>
            <span className="flex items-start gap-1.5 font-medium break-words text-amber-700 dark:text-amber-400">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                <span className="font-normal">The AI read </span>
                {row.ai}
              </span>
            </span>
          </>
        ) : (
          <span className="flex items-start gap-1.5 break-words">
            <CircleCheck
              className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
              aria-label="Matches"
            />
            {row.submitted ?? row.ai}
          </span>
        )}
      </dd>
    </div>
  );
}

/** The AI's verdict, and its reading next to the uploader's details. */
function DetailsCheck({
  submission,
  analysis,
  taxonomy,
}: {
  submission: MySubmissionDetail;
  analysis: UploaderAnalysis;
  taxonomy: Taxonomy | null;
}) {
  const [showMatching, setShowMatching] = useState(false);
  const values = analysis.values!;
  // Department, course, semester and exam type; section and batch only when set.
  const rows = compareWithAnalysis(submission, values).filter(
    (row, i) => i < 4 || row.submitted !== null || row.ai !== null,
  );
  const differing = rows.filter((row) => row.differs);
  const matching = rows.filter((row) => !row.differs);
  const matchingMain = rows.slice(0, 4).filter((row) => !row.differs).length;
  const problem =
    analysis.flag === "not_a_paper"
      ? "It doesn’t look like an exam question paper."
      : analysis.flag === "multiple_papers"
        ? `The file holds ${analysis.paperCount} question papers; upload each one on its own.`
        : null;
  const summary =
    problem ??
    (differing.length === 0
      ? "One question paper, and every detail matches yours."
      : `One question paper. ${matchingMain} of 4 details match yours.`);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="size-4" aria-hidden />
          AI check
        </CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {analysis.note && (
          <p className="border-l-2 pl-3 text-sm text-muted-foreground">
            {analysis.note}
          </p>
        )}
        {differing.length > 0 && (
          <dl className="grid gap-3">
            {differing.map((row) => (
              <ComparisonItem key={row.label} row={row} />
            ))}
          </dl>
        )}
        {matching.length > 0 &&
          (differing.length === 0 || showMatching ? (
            <dl className="grid gap-3">
              {matching.map((row) => (
                <ComparisonItem key={row.label} row={row} />
              ))}
            </dl>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 justify-self-start text-muted-foreground"
              onClick={() => setShowMatching(true)}
            >
              <ChevronDown />
              Show {matching.length} matching{" "}
              {matching.length === 1 ? "detail" : "details"}
            </Button>
          ))}
        {submission.status === "pending_review" &&
          taxonomy &&
          differing.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <ConfirmAction
                trigger={
                  <Button size="sm">
                    <Wand2 />
                    Use the AI’s details
                  </Button>
                }
                title="Use the AI’s details?"
                description="Your paper is filed under what the AI read. If that all matches existing entries, it’s published right away."
                confirmLabel="Use them"
                successMessage="Details updated"
                fields={{
                  intent: "details",
                  ...classificationFields(
                    classificationFromAnalysis(
                      submission.classification,
                      values,
                    ),
                    {
                      section: values.section ?? submission.section,
                      batch: values.batch ?? submission.batch,
                    },
                  ),
                }}
              />
              <EditDetailsDialog
                submission={submission}
                taxonomy={taxonomy}
                trigger={
                  <Button size="sm" variant="outline">
                    <Pencil />
                    Edit my details
                  </Button>
                }
              />
            </div>
          )}
      </CardContent>
    </Card>
  );
}

/** When things happened, and the file. */
function ActivityCard({ submission }: { submission: MySubmissionDetail }) {
  const completedAt = submission.analysisDetail?.completedAt;
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Uploaded", value: <RelativeTime iso={submission.createdAt} /> },
    ...(completedAt
      ? [{ label: "AI checked", value: <RelativeTime iso={completedAt} /> }]
      : []),
    { label: "File size", value: formatBytes(submission.fileSize) },
  ];

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {rows.map(({ label, value }) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

/** The AI check while it runs, its result, or a way to fix details without one. */
function CheckPanel({
  submission,
  taxonomy,
}: {
  submission: MySubmissionDetail;
  taxonomy: Taxonomy | null;
}) {
  const analysis = submission.analysisDetail;
  if (isChecking(submission)) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 text-sm">
          <LoaderCircle className="size-4 shrink-0 animate-spin text-sky-600 dark:text-sky-400" />
          The AI is reading your paper. This page updates by itself.
        </CardContent>
      </Card>
    );
  }
  if (analysis?.status === "completed" && analysis.values) {
    return (
      <DetailsCheck
        submission={submission}
        analysis={analysis}
        taxonomy={taxonomy}
      />
    );
  }
  if (submission.status === "pending_review" && taxonomy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your details</CardTitle>
          <CardDescription>
            Spotted a mistake? Fix it before an admin reviews the paper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditDetailsDialog
            submission={submission}
            taxonomy={taxonomy}
            trigger={
              <Button size="sm" variant="outline">
                <Pencil />
                Edit details
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }
  return null;
}

/** "Thanks!" once after arriving from the upload form (`?uploaded`). */
function useUploadedToast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const shown = useRef(false);
  useEffect(() => {
    if (shown.current || !searchParams.has("uploaded")) return;
    shown.current = true;
    toast.success("Thanks! Your paper was uploaded.");
    setSearchParams({}, { replace: true, preventScrollReset: true });
  }, [searchParams, setSearchParams]);
}

export default function AccountSubmission({
  loaderData,
}: Route.ComponentProps) {
  const { submission, taxonomy } = loaderData;
  const [withdrawing, setWithdrawing] = useState(false);
  useRefreshWhile(isChecking(submission));
  useUploadedToast();

  const { classification } = submission;
  const href = publicUrl(submission);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Account", to: "/account" },
          { label: "My submissions", to: "/account/submissions" },
          { label: classification.course.name },
        ]}
        title={classification.course.name}
        description={[
          classification.department.name,
          classificationLine(classification),
          paperDetails(submission),
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <>
            {href && (
              <Button size="sm" asChild>
                <Link to={href}>
                  <Globe />
                  Public page
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a
                href={ownSubmissionFileUrl(submission.id)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
                Open PDF
              </a>
            </Button>
            {submission.status !== "published" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWithdrawing(true)}
              >
                <Trash2 />
                Withdraw
              </Button>
            )}
          </>
        }
      >
        <div className="pt-1">
          <StatusBadge status={submission.status} />
        </div>
      </PageHeader>

      <StatusBanner stage={reviewStage(submission)} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-4 lg:order-2">
          <CheckPanel submission={submission} taxonomy={taxonomy} />
          <ActivityCard submission={submission} />
        </div>
        <div className="min-w-0 lg:order-1">
          <PdfViewer
            src={ownSubmissionFileUrl(submission.id)}
            title={`${classification.course.name} — your upload`}
          />
        </div>
      </div>

      <ConfirmAction
        open={withdrawing}
        onOpenChange={setWithdrawing}
        title="Withdraw this submission?"
        description={`${classification.course.name} · ${classificationLine(classification)}. The PDF is deleted and can’t be recovered.`}
        confirmLabel="Withdraw"
        destructive
        fields={{ intent: "withdraw" }}
      />
    </div>
  );
}
