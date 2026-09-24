import type { ApiError, CreatedSubmission } from "@qb/shared";
import { CheckCircle2, Lightbulb } from "lucide-react";
import { Link, useNavigation } from "react-router";
import { ContributeForm } from "~/components/contribute-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { PageHeader } from "~/components/page-header";
import { apiFetch, readJson } from "~/lib/api.server";
import { fieldErrorsFrom } from "~/lib/api-errors";
import { requireUser } from "~/lib/session.server";
import { loadTaxonomy } from "~/lib/taxonomy.server";
import type { Route } from "./+types/contribute";

export const meta: Route.MetaFunction = () => [
  { title: "Contribute a paper — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  return loadTaxonomy(request);
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);
  // Forward the multipart body as-is; the API validates it.
  const res = await apiFetch(request, "/api/v1/submissions", {
    method: "POST",
    body: await request.formData(),
  });

  if (res.status === 201) {
    return {
      ok: true as const,
      submission: await readJson<CreatedSubmission>(res),
    };
  }
  const body = await readJson<ApiError>(res).catch(() => null);
  const fieldErrors = fieldErrorsFrom(body);
  return {
    ok: false as const,
    fieldErrors,
    message:
      Object.keys(fieldErrors).length > 0
        ? undefined
        : (body?.error.message ?? "Upload failed. Please try again."),
  };
}

const STEPS = [
  "Choose the department, course, semester and exam type.",
  "Upload the question paper as a PDF.",
  "An admin reviews it, along with any new entries, before it is published.",
];

export default function Contribute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const submitting = useNavigation().state === "submitting";
  const failed = actionData && !actionData.ok ? actionData : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contribute a paper"
        description="Upload a question paper PDF and tell us where it belongs. Every submission is reviewed before it is published."
      />

      {actionData?.ok && (
        <Alert role="status">
          <CheckCircle2 />
          <AlertTitle>Thanks! Your paper was submitted for review.</AlertTitle>
          <AlertDescription>
            <p>
              {actionData.submission.questionId !== null ? (
                <Link
                  to={`/questions/${actionData.submission.questionId}`}
                  className="underline underline-offset-4"
                >
                  View the question
                </Link>
              ) : (
                "New entries will be added once an admin approves them."
              )}{" "}
              ·{" "}
              <Link
                // The public profile only lists published papers; this one is pending.
                to="/account/submissions"
                className="underline underline-offset-4"
              >
                See your contributions
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        {/* Re-mount after each successful upload to reset the form. */}
        <ContributeForm
          key={actionData?.ok ? actionData.submission.id : "form"}
          {...loaderData}
          fieldErrors={failed?.fieldErrors ?? {}}
          message={failed?.message}
          submitting={submitting}
        />
        <Card className="gap-4 bg-muted/30 shadow-none">
          <CardHeader>
            <CardTitle>
              <h2>How it works</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <ol className="space-y-3">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-medium shadow-xs ring-1 ring-border">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
            <p className="flex gap-2 border-t pt-4 text-muted-foreground">
              <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                Can’t find a department, course or semester? Type its name and
                choose “Add”.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
