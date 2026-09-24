import type { AdminStats } from "@qb/shared";
import {
  ArrowLeft,
  Flag,
  FolderTree,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { apiGetJson } from "~/lib/api.server";
import { formatCount } from "~/lib/format";
import { requireAdmin } from "~/lib/session.server";
import { cn } from "~/lib/utils";
import type { RouteHandle } from "~/root";
import type { Route } from "./+types/admin";

export const handle: RouteHandle = { fullBleed: true };

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);
  const stats = await apiGetJson<AdminStats>(request, "/api/v1/admin/stats");
  return { user, stats };
}

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Items waiting for an admin, shown as a badge. */
  count?: number;
};

function navGroups(stats: AdminStats): { label: string; items: NavItem[] }[] {
  return [
    {
      label: "Overview",
      items: [
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      ],
    },
    {
      label: "Moderation",
      items: [
        {
          to: "/admin/submissions",
          label: "Submissions",
          icon: Inbox,
          count: stats.submissions.pendingReview,
        },
        {
          to: "/admin/reports",
          label: "Reports",
          icon: Flag,
          count: stats.openReports,
        },
      ],
    },
    {
      label: "Manage",
      items: [
        { to: "/admin/catalog", label: "Catalog", icon: FolderTree },
        { to: "/admin/users", label: "Users", icon: Users },
      ],
    },
  ];
}

function CountBadge({ count, active }: { count?: number; active: boolean }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        "ml-auto min-w-5 rounded-full px-1.5 text-center text-[11px] leading-5 font-semibold tabular-nums",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary",
      )}
    >
      {formatCount(count)}
    </span>
  );
}

/** Admin shell: a sidebar on wide screens, a scrollable tab bar on phones. */
export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const { user, stats } = loaderData;
  const groups = navGroups(stats);

  return (
    <div className="flex flex-1">
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
        <div className="sticky top-14 flex h-[calc(100dvh-3.5rem)] flex-col gap-6 overflow-y-auto p-4">
          <div className="flex items-center gap-3 px-2 pt-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Admin panel</p>
              <p className="text-xs text-muted-foreground">QuestionBank</p>
            </div>
          </div>

          <nav aria-label="Admin" className="grid gap-5">
            {groups.map((group) => (
              <div key={group.label} className="grid gap-1">
                <p className="px-3 pb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  {group.label}
                </p>
                {group.items.map(({ to, label, icon: Icon, end, count }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    prefetch="intent"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn("size-4", isActive && "text-primary")}
                          aria-hidden
                        />
                        {label}
                        <CountBadge count={count} active={isActive} />
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="mt-auto grid gap-3 border-t pt-4">
            <div className="flex items-center gap-3 px-2">
              <ContributorAvatar
                name={user.name}
                image={user.image}
                size="sm"
              />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to the site
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <nav
          aria-label="Admin sections"
          className="sticky top-14 z-10 flex gap-1 overflow-x-auto border-b bg-background/90 px-4 py-2 backdrop-blur md:hidden"
        >
          {groups
            .flatMap((group) => group.items)
            .map(({ to, label, icon: Icon, end, count }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="size-4" aria-hidden />
                    {label}
                    <CountBadge count={count} active={isActive} />
                  </>
                )}
              </NavLink>
            ))}
        </nav>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
