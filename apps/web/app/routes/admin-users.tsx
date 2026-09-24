import type { AdminUser, AdminUserList } from "@qb/shared";
import { Search, ShieldCheck, ShieldOff, UserRound } from "lucide-react";
import { Form, Link, useRouteLoaderData } from "react-router";
import { ActionDialog } from "~/components/admin/actions";
import { FilterTabs } from "~/components/admin/filter-tabs";
import { ContributorAvatar } from "~/components/contributor-avatar";
import { EmptyState } from "~/components/empty-state";
import { PageHeader } from "~/components/page-header";
import { Pagination } from "~/components/pagination";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { adminGetJson, adminRequest } from "~/lib/admin.server";
import { formatDate } from "~/lib/dates";
import type { loader as adminLoader } from "./admin";
import type { Route } from "./+types/admin-users";

export const meta: Route.MetaFunction = () => [
  { title: "Users — Admin — QuestionBank" },
  { name: "robots", content: "noindex" },
];

const PAGE_SIZE = 25;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const role = url.searchParams.get("role") === "admin" ? "admin" : null;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (q) query.set("q", q);
  if (role) query.set("role", role);

  const [list, admins] = await Promise.all([
    adminGetJson<AdminUserList>(request, `/users?${query}`),
    // Only the total, for the tab count.
    adminGetJson<AdminUserList>(request, "/users?role=admin&pageSize=1"),
  ]);
  return { list, q, role, adminCount: admins.total };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  return adminRequest(
    request,
    "role",
    "PATCH",
    `/users/${encodeURIComponent(String(form.get("id")))}`,
    { role: form.get("role") },
  );
}

function PaperCounts({ counts }: { counts: AdminUser["submissionCounts"] }) {
  const total = counts.published + counts.pendingReview + counts.rejected;
  if (total === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-2 tabular-nums">
      <span title="Published" className="flex items-center gap-1">
        <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
        {counts.published}
        <span className="sr-only">published</span>
      </span>
      <span title="Pending review" className="flex items-center gap-1">
        <span className="size-2 rounded-full bg-amber-500" aria-hidden />
        {counts.pendingReview}
        <span className="sr-only">pending review</span>
      </span>
      <span title="Rejected" className="flex items-center gap-1">
        <span className="size-2 rounded-full bg-red-500" aria-hidden />
        {counts.rejected}
        <span className="sr-only">rejected</span>
      </span>
    </span>
  );
}

function RoleAction({ user }: { user: AdminUser }) {
  const makeAdmin = user.role !== "admin";
  return (
    <ActionDialog
      trigger={
        <Button variant="ghost" size="sm">
          {makeAdmin ? <ShieldCheck aria-hidden /> : <ShieldOff aria-hidden />}
          {makeAdmin ? "Make admin" : "Remove admin"}
        </Button>
      }
      title={
        makeAdmin
          ? `Make ${user.name} an admin?`
          : `Remove ${user.name}’s admin rights?`
      }
      description={
        makeAdmin
          ? "Admins can publish, reject and delete papers, handle reports, edit the catalog and manage other admins."
          : "They keep their account and papers, but lose access to the admin panel right away."
      }
      submitLabel={makeAdmin ? "Make admin" : "Remove admin"}
      pendingLabel="Saving…"
      destructive={!makeAdmin}
      fields={{ id: user.id, role: makeAdmin ? "admin" : "user" }}
    />
  );
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
  const { list, q, role, adminCount } = loaderData;
  const { user: me } = useRouteLoaderData<typeof adminLoader>("routes/admin")!;
  const withQuery = (params: Record<string, string>) => {
    const search = new URLSearchParams(params);
    if (q) search.set("q", q);
    const text = search.toString();
    return text ? `?${text}` : "";
  };

  const tabs = [
    { search: withQuery({}), label: "Everyone", active: role === null },
    {
      search: withQuery({ role: "admin" }),
      label: "Admins",
      count: adminCount,
      active: role === "admin",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manage"
        title="Users"
        description="Everyone with an account, newest first. Grant admin rights to people you trust to moderate."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <FilterTabs label="Filter by role" tabs={tabs} />
        <Form role="search" className="relative sm:w-72">
          {role && <input type="hidden" name="role" value={role} />}
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            key={q}
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name or email…"
            aria-label="Search users"
            className="pl-9"
          />
        </Form>
      </div>

      {list.items.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title={q ? `No users match “${q}”` : "No users yet"}
        />
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="pl-4">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Papers</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <ContributorAvatar
                        name={user.name}
                        image={user.image}
                        size="sm"
                      />
                      <div className="min-w-0 leading-tight">
                        <p className="max-w-56 truncate font-medium">
                          {user.name}
                        </p>
                        <p className="max-w-56 truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge className="bg-primary/10 text-primary">
                        <ShieldCheck aria-hidden />
                        Admin
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">Member</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.submissionCounts.published +
                      user.submissionCounts.pendingReview +
                      user.submissionCounts.rejected >
                    0 ? (
                      <Link
                        to={`/contributors/${encodeURIComponent(user.id)}`}
                        className="hover:underline"
                      >
                        <PaperCounts counts={user.submissionCounts} />
                      </Link>
                    ) : (
                      <PaperCounts counts={user.submissionCounts} />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {user.id === me.id ? (
                      <span className="px-3 text-xs text-muted-foreground">
                        You
                      </span>
                    ) : (
                      <RoleAction user={user} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Pagination
        page={list.page}
        pageSize={list.pageSize}
        total={list.total}
        hrefFor={(page) =>
          withQuery({
            ...(role ? { role } : {}),
            ...(page > 1 ? { page: String(page) } : {}),
          })
        }
      />
    </div>
  );
}
