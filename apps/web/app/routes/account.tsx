import { FileText, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { PageHeader } from "~/components/page-header";
import { requireUser } from "~/lib/session.server";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/account";

export async function loader({ request }: Route.LoaderArgs) {
  return { user: await requireUser(request) };
}

const SECTIONS = [
  { to: "/account", label: "Profile", icon: UserRound, end: true },
  { to: "/account/submissions", label: "My submissions", icon: FileText },
];

/** Shared shell for the signed-in user's pages: header plus section navigation. */
export default function AccountLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Account" }]}
        title={user.name}
        description={user.email}
        actions={
          <span className="hidden sm:block">
            <ContributorAvatar name={user.name} image={user.image} size="lg" />
          </span>
        }
      />

      <Separator />

      <div className="grid gap-6 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10">
        <nav
          aria-label="Account"
          className="flex gap-1 overflow-x-auto md:flex-col"
        >
          {SECTIONS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  buttonVariants({ variant: "ghost" }),
                  "shrink-0 justify-start",
                  isActive
                    ? "bg-muted hover:bg-muted"
                    : "text-muted-foreground hover:bg-transparent hover:underline",
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
