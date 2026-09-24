import { useState } from "react";
import { useFetcher } from "react-router";
import { FormMessage } from "~/components/form";
import { Button } from "~/components/ui/button";
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
import type { AdminActionResult } from "~/lib/admin.server";
import { cn } from "~/lib/utils";

function HiddenFields({ fields }: { fields: Record<string, string> }) {
  return Object.entries(fields).map(([name, value]) => (
    <input key={name} type="hidden" name={name} value={value} />
  ));
}

type ActionDialogProps = {
  /** The button that opens the dialog. */
  trigger: React.ReactElement;
  title: string;
  description?: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  destructive?: boolean;
  /** Hidden form fields, such as the `intent` and an entry's id. */
  fields: Record<string, string>;
  /** Route action to post to. Defaults to the current route. */
  action?: string;
  className?: string;
  /** Visible form fields, given the errors from the last attempt. */
  children?: (fieldErrors: Record<string, string>) => React.ReactNode;
};

/**
 * A dialog with a form that posts to a route action through a fetcher. It stays open
 * to show errors and closes once the action succeeds.
 */
export function ActionDialog({
  trigger,
  title,
  description,
  submitLabel,
  pendingLabel,
  destructive = false,
  fields,
  action,
  className,
  children,
}: ActionDialogProps) {
  const fetcher = useFetcher<AdminActionResult>();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const busy = fetcher.state !== "idle";
  const result = submitted && !busy ? fetcher.data : undefined;
  const failed = result?.ok === false ? result : undefined;

  return (
    <Dialog
      open={open && result?.ok !== true}
      onOpenChange={(next) => {
        setOpen(next);
        setSubmitted(false);
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <fetcher.Form
          method="post"
          action={action}
          onSubmit={() => setSubmitted(true)}
          className="grid gap-4"
        >
          <HiddenFields fields={fields} />
          {children?.(failed?.fieldErrors ?? {})}
          <FormMessage message={failed?.error} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant={destructive ? "destructive" : "default"}
              disabled={busy}
            >
              {busy ? (pendingLabel ?? `${submitLabel}…`) : submitLabel}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

type ActionButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "type" | "form"
> & {
  fields: Record<string, string>;
  action?: string;
  pendingLabel?: string;
};

/** A button that posts one action right away, showing its error beside it. */
export function ActionButton({
  fields,
  action,
  pendingLabel,
  children,
  disabled,
  ...buttonProps
}: ActionButtonProps) {
  const fetcher = useFetcher<AdminActionResult>();
  const busy = fetcher.state !== "idle";
  const error =
    !busy && fetcher.data?.ok === false ? fetcher.data.error : undefined;

  return (
    <fetcher.Form method="post" action={action} className="contents">
      <HiddenFields fields={fields} />
      <Button type="submit" disabled={disabled || busy} {...buttonProps}>
        {busy && pendingLabel ? pendingLabel : children}
      </Button>
      {error && (
        <p role="alert" className="basis-full text-xs text-destructive">
          {error}
        </p>
      )}
    </fetcher.Form>
  );
}
