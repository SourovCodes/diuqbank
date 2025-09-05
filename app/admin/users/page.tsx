import Link from "next/link";
import { Users, Plus, Pencil, CheckCircle, XCircle } from "lucide-react";
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
import { GenericDeleteButton } from "../components/generic-delete-button";
import { PageHeader } from "../components/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminListHeader } from "../components/admin-list-header";
import { EmptyState } from "../components/empty-state";
import { SortableTableHeader } from "../components/sortable-table-header";
import {
    defaultPagination,
    formatTotalLabel,
    parseListSearchParams,
    SearchParamsBase,
} from "@/lib/action-utils";

export const metadata: Metadata = {
    title: "Users Management | DIU QBank Admin",
    description: "Manage users",
};

interface UsersPageProps {
    searchParams: Promise<SearchParamsBase>;
}

export default async function UsersPage({
    searchParams,
}: UsersPageProps) {
    const { page, search, sortBy, sortOrder } = await parseListSearchParams(searchParams);

    const result = await getPaginatedUsers(page, 10, search, sortBy, sortOrder);

    const users = result.success ? result.data?.users ?? [] : [];
    const pagination = result.success
        ? result.data?.pagination ?? defaultPagination
        : defaultPagination;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Users"
                description="Manage users in the system"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { label: "Users" },
                ]}
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
                    description={formatTotalLabel("user", pagination.totalCount)}
                    searchPlaceholder="Search users by name or email..."
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
                                            <SortableTableHeader sortKey="name" className="w-[200px]">
                                                Name
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="email" className="w-[250px]">
                                                Email
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="emailVerified" className="w-[120px] hidden md:table-cell">
                                                Verified
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="questionCount" className="hidden lg:table-cell">
                                                Questions
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="createdAt" className="hidden xl:table-cell">
                                                Created
                                            </SortableTableHeader>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="font-medium">{user.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex items-center">
                                                        {user.emailVerified ? (
                                                            <Badge variant="default" className="flex items-center gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                                <XCircle className="h-3 w-3" />
                                                                Unverified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell">
                                                    <Badge variant="outline">
                                                        {user.questionCount}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell">
                                                    <div className="text-sm text-muted-foreground">
                                                        {user.createdAt.toLocaleDateString()}
                                                    </div>
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
                                                            name={user.name}
                                                            entityName="User"
                                                            deleteAction={deleteUser}
                                                            isDisabled={user.questionCount > 0}
                                                            disabledReason="Cannot delete a user with submitted questions"
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
