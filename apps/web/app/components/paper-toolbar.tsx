import type { ReportReason, Submission, VoteValue } from "@qb/shared";
import {
  MAX_REPORT_DETAILS_LENGTH,
  REPORT_REASONS,
} from "@qb/shared/constants";
import { Eye, Flag, ThumbsDown, ThumbsUp } from "lucide-react";
import { useId, useState } from "react";
import { Link, useFetcher, useLocation } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  parseVoteValue,
  REPORT_FETCHER_KEY,
  REPORT_REASON_LABELS,
  withVote,
  type PaperActionResult,
} from "~/lib/engagement";
import { formatCount, formatViews } from "~/lib/format";
import { cn } from "~/lib/utils";

/** Who is looking at the paper, which decides what they can do with it. */
export type PaperViewer =
  | { kind: "anonymous" }
  | { kind: "uploader" }
  | { kind: "member"; vote: VoteValue | null; reported: boolean };

type PaperToolbarProps = {
  submission: Submission;
  /** e.g. "Paper 2" */
  label: string;
  viewer: PaperViewer;
};

const VOTES = [
  { value: 1, label: "Like", icon: ThumbsUp },
  { value: -1, label: "Dislike", icon: ThumbsDown },
] as const;

const activeVoteClass: Record<VoteValue, string> = {
  1: "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
  [-1]: "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive",
};

/** Views, likes, dislikes and reporting for the paper shown in the viewer. */
export function PaperToolbar({ submission, label, viewer }: PaperToolbarProps) {
  const location = useLocation();
  const fetcher = useFetcher<PaperActionResult>({
    key: `vote-${submission.id}`,
  });

  // Show the new vote immediately; the loader's counts catch up after revalidation.
  const current = viewer.kind === "member" ? viewer.vote : null;
  const pending = parseVoteValue(fetcher.formData?.get("value"));
  const myVote = pending === undefined ? current : pending;
  const counts = withVote(submission, current, myVote);
  const countFor = (value: VoteValue) =>
    value === 1 ? counts.likeCount : counts.dislikeCount;

  const loginHref = `/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`;
  const ghost = buttonVariants({ variant: "ghost", size: "sm" });
  const voteError = fetcher.data?.ok === false ? fetcher.data.error : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl border bg-card px-2 py-1.5 shadow-sm sm:px-3">
      <p className="flex min-w-0 items-center gap-3 px-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Eye className="size-4" aria-hidden />
          {formatViews(submission.viewCount)}
        </span>
      </p>

      <div className="flex items-center gap-1">
        {viewer.kind === "anonymous" ? (
          <>
            {VOTES.map(({ value, label: voteLabel, icon: Icon }) => (
              <Link
                key={value}
                to={loginHref}
                aria-label={`Log in to ${voteLabel.toLowerCase()} (${countFor(value)})`}
                className={cn(ghost, "tabular-nums")}
              >
                <Icon aria-hidden />
                {formatCount(countFor(value))}
              </Link>
            ))}
            <Link to={loginHref} className={ghost}>
              <Flag aria-hidden />
              Report
            </Link>
          </>
        ) : (
          <>
            <fetcher.Form method="post" className="flex items-center gap-1">
              <input type="hidden" name="intent" value="vote" />
              <input type="hidden" name="submissionId" value={submission.id} />
              {VOTES.map(({ value, label: voteLabel, icon: Icon }) => {
                const active = myVote === value;
                return (
                  <Button
                    key={value}
                    type="submit"
                    name="value"
                    // Pressing the active vote again clears it.
                    value={active ? "none" : String(value)}
                    variant="ghost"
                    size="sm"
                    aria-pressed={active}
                    aria-label={`${voteLabel} (${countFor(value)})`}
                    disabled={viewer.kind === "uploader"}
                    title={
                      viewer.kind === "uploader"
                        ? "You can’t vote on your own paper"
                        : undefined
                    }
                    className={cn(
                      "tabular-nums",
                      active && activeVoteClass[value],
                    )}
                  >
                    <Icon aria-hidden />
                    {formatCount(countFor(value))}
                  </Button>
                );
              })}
            </fetcher.Form>
            {viewer.kind === "member" && (
              <ReportDialog
                submissionId={submission.id}
                label={label}
                reported={viewer.reported}
              />
            )}
          </>
        )}
      </div>

      {voteError && (
        <p role="alert" className="w-full px-1 text-xs text-destructive">
          {voteError}
        </p>
      )}
    </div>
  );
}

function ReportDialog({
  submissionId,
  label,
  reported,
}: {
  submissionId: string;
  label: string;
  reported: boolean;
}) {
  const fetcher = useFetcher<PaperActionResult>({ key: REPORT_FETCHER_KEY });
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0]);
  const detailsId = useId();
  const sending =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("submissionId") === submissionId;

  if (reported || sending) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Flag aria-hidden />
        {sending ? "Reporting…" : "Reported"}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Flag aria-hidden />
          Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {label.toLowerCase()}</DialogTitle>
          <DialogDescription>
            An admin reviews every report. Papers reported by several people are
            hidden until then.
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form
          method="post"
          onSubmit={() => setOpen(false)}
          className="grid gap-4"
        >
          <input type="hidden" name="intent" value="report" />
          <input type="hidden" name="submissionId" value={submissionId} />
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">What’s wrong?</legend>
            {REPORT_REASONS.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent/60 has-checked:border-primary has-checked:bg-primary/5"
              >
                <input
                  type="radio"
                  name="reason"
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  className="accent-primary"
                />
                {REPORT_REASON_LABELS[value]}
              </label>
            ))}
          </fieldset>
          <div className="grid gap-1.5">
            <Label htmlFor={detailsId}>
              Details{" "}
              {reason !== "other" && (
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              )}
            </Label>
            <textarea
              id={detailsId}
              name="details"
              rows={3}
              maxLength={MAX_REPORT_DETAILS_LENGTH}
              required={reason === "other"}
              placeholder="Tell the admin what you noticed"
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send report</Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

/** The outcome of the last report on this question, shown above the viewer. */
export function ReportNotice({ questionId }: { questionId: number }) {
  const result = useFetcher<PaperActionResult>({
    key: REPORT_FETCHER_KEY,
  }).data;
  if (!result || result.questionId !== questionId) return null;

  if (!result.ok) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
      >
        {result.error}
      </p>
    );
  }
  return (
    <p
      role="status"
      className="rounded-lg border border-emerald-600/30 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
    >
      Thanks for the report. An admin will review it.
      {result.submissionHidden &&
        " The paper is hidden until it has been reviewed."}
    </p>
  );
}
