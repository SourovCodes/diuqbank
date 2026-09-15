import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  /** Small label above the title, e.g. the parent category. */
  eyebrow?: string;
  back?: { to: string; label: string };
  /** Buttons aligned to the right on wide screens. */
  actions?: React.ReactNode;
  /** Extra content under the title, e.g. badges. */
  children?: React.ReactNode;
};

/** The standard header every page starts with, so all pages share one rhythm. */
export function PageHeader({
  title,
  description,
  eyebrow,
  back,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      {back && (
        <Link
          to={back.to}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-muted-foreground">{description}</p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
