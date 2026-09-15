import type { ApiError, Paper } from "@qb/shared";
import { MAX_PAPER_FILE_BYTES, MIN_PAPER_YEAR } from "@qb/shared/constants";
import { Form, useNavigation } from "react-router";
import { FormField, FormMessage } from "~/components/form";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { apiFetch, readJson } from "~/lib/api.server";
import { fieldErrorsFrom } from "~/lib/api-errors";
import { formatBytes } from "~/lib/format";
import { requireUser } from "~/lib/session.server";
import type { Route } from "./+types/contribute";

export const meta: Route.MetaFunction = () => [
  { title: "Contribute a paper — QuestionBank" },
  { name: "robots", content: "noindex" },
];

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);
  const res = await apiFetch(request, "/api/v1/papers", {
    method: "POST",
    body: await request.formData(),
  });

  if (res.ok) {
    return { ok: true as const, paper: await readJson<Paper>(res) };
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

export default function Contribute({ actionData }: Route.ComponentProps) {
  const submitting = useNavigation().state === "submitting";
  const maxYear = new Date().getUTCFullYear() + 1;
  const failed = actionData && !actionData.ok ? actionData : null;
  const fieldErrors = failed?.fieldErrors ?? {};

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Contribute a paper
        </h1>
        <p className="text-muted-foreground">
          Upload a question paper PDF. It becomes public after a quick review.
        </p>
      </header>

      {actionData?.ok && (
        <p
          role="status"
          className="rounded-xl border border-emerald-600/30 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          Thanks! “{actionData.paper.title}” was submitted for review.
        </p>
      )}

      <Card>
        <CardContent>
          {/* Re-mount after each successful upload to clear the form. */}
          <Form
            key={actionData?.ok ? actionData.paper.id : "form"}
            method="post"
            encType="multipart/form-data"
            className="grid gap-4"
          >
            <FormField
              label="Title"
              name="title"
              required
              minLength={3}
              maxLength={200}
              placeholder="e.g. Final Examination"
              error={fieldErrors.title}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Subject"
                name="subject"
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Physics"
                error={fieldErrors.subject}
              />
              <FormField
                label="Year"
                name="year"
                type="number"
                inputMode="numeric"
                required
                min={MIN_PAPER_YEAR}
                max={maxYear}
                error={fieldErrors.year}
              />
            </div>
            <FormField
              label={`PDF file (max ${formatBytes(MAX_PAPER_FILE_BYTES)})`}
              name="file"
              type="file"
              accept="application/pdf,.pdf"
              required
              error={fieldErrors.file}
            />
            <FormMessage message={failed?.message} />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Uploading…" : "Submit paper"}
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
