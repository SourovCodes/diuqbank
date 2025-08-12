import Link from "next/link";
import { Users, Plus, Pencil } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedUsers, deleteUser } from "./actions";
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import { EmptyState } from "@/components/admin/empty-state";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Users Management | DIU QBank Admin",
  description: "Manage users",
};

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page ?? "1", 10);
  const search = awaitedSearchParams.search || undefined;

  const { data } = await getPaginatedUsers(page, 10, search);

  const users = data?.users ?? [];
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage users in the system"
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Users" }]}
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/users/create">
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Link>
          </Button>
        }
      />

      <Card>
        <AdminListHeader
          title="Users List"
          description={`Total: ${pagination.totalCount} user${pagination.totalCount !== 1 ? "s" : ""}`}
          searchPlaceholder="Search users..."
        />
        <CardContent>
          {users.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title="No users found"
              description={
                search
                  ? "No users match your search criteria. Try a different search query or create a new user."
                  : "Get started by creating your first user."
              }
              action={
                <Button asChild variant="outline">
                  <Link href="/admin/users/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create User
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Avatar</TableHead>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="w-[250px]">Email</TableHead>
                      <TableHead className="w-[150px]">Username</TableHead>
                      <TableHead className="w-[150px]">Student ID</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Questions
                      </TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.image || undefined}
                              alt={user.name || "User"}
                            />
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{user.name}</div>
                          {user.emailVerified && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.username}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.studentId ? (
                            <Badge variant="outline">{user.studentId}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {user.questionCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              asChild
                            >
                              <Link
                                href={`/admin/users/${user.id}/edit`}
                                className="flex items-center justify-center"
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <GenericDeleteButton
                              id={user.id}
                              name={user.name || user.email || "Unknown User"}
                              entityName="User"
                              deleteAction={deleteUser}
                              isDisabled={user.questionCount > 0}
                              disabledReason="Cannot delete a user with questions"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex justify-center">
                <CustomPagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
