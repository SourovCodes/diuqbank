"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Crumb {
  href?: string;
  label: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((c, idx) => (
            <span key={`crumb-${idx}`} className="contents">
              <BreadcrumbItem>
                {c.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink className="text-foreground font-medium">
                    {c.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {idx < crumbs.length - 1 && <BreadcrumbSeparator />}
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
