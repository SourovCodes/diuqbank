import type { Submission } from "@qb/shared";
import { ChevronRight, UserRound } from "lucide-react";
import { Link } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { Card } from "~/components/ui/card";
import { formatDate } from "~/lib/dates";
import { formatBytes } from "~/lib/format";

/** Who uploaded the currently selected submission. */
export function UploaderCard({ submission }: { submission: Submission }) {
  const { uploader } = submission;
  const details = `Added ${formatDate(submission.createdAt)} · ${formatBytes(submission.fileSize)}`;

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Uploaded by</h2>
      </div>
      {uploader ? (
        <Link
          to={`/contributors/${encodeURIComponent(uploader.id)}`}
          className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/60"
        >
          <ContributorAvatar name={uploader.name} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium group-hover:text-primary">
              {uploader.name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {details}
            </span>
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">Unknown contributor</span>
            <span className="block text-xs text-muted-foreground">
              {details}
            </span>
          </span>
        </div>
      )}
    </Card>
  );
}
