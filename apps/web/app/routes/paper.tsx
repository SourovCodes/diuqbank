import type { Paper } from "@qb/shared";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { data, Link } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { apiFetch, readJson } from "~/lib/api.server";
import { formatBytes } from "~/lib/format";
import type { Route } from "./+types/paper";

// Fixed time zone so server and client render the same string (no hydration mismatch).
const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const res = await apiFetch(
    request,
    `/api/v1/papers/${encodeURIComponent(params.id)}`,
  );
  if (res.status === 404) throw data("Paper not found", { status: 404 });
  if (!res.ok) throw data("Failed to load paper", { status: 502 });
  return { paper: await readJson<Paper>(res) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Paper not found — QuestionBank" }];
  const { paper } = loaderData;
  return [
    { title: `${paper.subject} ${paper.year}: ${paper.title} — QuestionBank` },
    {
      name: "description",
      content: `Download the ${paper.year} ${paper.subject} question paper "${paper.title}" as a PDF.`,
    },
  ];
};

export default function PaperPage({ loaderData }: Route.ComponentProps) {
  const { paper } = loaderData;
  const fileUrl = `/api/v1/papers/${paper.id}/file`;

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All papers
      </Link>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">{paper.subject}</p>
        <h1 className="text-3xl font-bold tracking-tight text-balance">
          {paper.title}
        </h1>
      </header>

      <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Year</dt>
          <dd className="font-medium">{paper.year}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">File size</dt>
          <dd className="font-medium">{formatBytes(paper.fileSize)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Added</dt>
          <dd className="font-medium">
            <time dateTime={paper.createdAt}>
              {dateFormatter.format(new Date(paper.createdAt))}
            </time>
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener"
          className={buttonVariants({ size: "lg" })}
        >
          <FileText aria-hidden />
          Open PDF
        </a>
        <a
          href={fileUrl}
          download
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <Download aria-hidden />
          Download
        </a>
      </div>
    </article>
  );
}
