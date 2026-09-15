import type { Paper } from "@qb/shared";
import { FileText } from "lucide-react";
import { Link } from "react-router";
import { formatBytes } from "~/lib/format";

export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <Link
      to={`/papers/${paper.id}`}
      prefetch="intent"
      className="group flex items-start gap-4 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <FileText className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <h3 className="truncate font-medium group-hover:text-primary">
          {paper.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {paper.subject} · {paper.year} · {formatBytes(paper.fileSize)}
        </p>
      </div>
    </Link>
  );
}
