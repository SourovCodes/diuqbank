import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
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
import { getPaginatedSemesters, deleteSemester } from "./actions";
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
    title: "Semesters Management | DIU QBank Admin",
    description: "Manage semesters",
};

interface SemestersPageProps {
    searchParams: Promise<SearchParamsBase>;
}

export default async function SemestersPage({
    searchParams,
}: SemestersPageProps) {
    const { page, search, sortBy, sortOrder } = await parseListSearchParams(searchParams);

    const result = await getPaginatedSemesters(page, 10, search, sortBy, sortOrder);

    const semesters = result.success ? result.data?.semesters ?? [] : [];
    const pagination = result.success
        ? result.data?.pagination ?? defaultPagination
        : defaultPagination;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Semesters"
                description="Manage semesters in the system"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { label: "Semesters" },
                ]}
                actions={
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/semesters/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Semester
                        </Link>
                    </Button>
                }
            />

            <Card>
                <AdminListHeader
                    title="Semesters List"
                    description={formatTotalLabel("semester", pagination.totalCount)}
                    searchPlaceholder="Search semesters..."
                />
                <CardContent>
                    {semesters.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="h-6 w-6" />}
                            title="No semesters found"
                            description={
                                search
                                    ? "No semesters match your search criteria. Try a different search query or create a new semester."
                                    : "Get started by creating your first semester."
                            }
                            action={
                                <Button asChild variant="outline">
                                    <Link href="/admin/semesters/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Semester
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
                                                Semester Name
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="order" className="w-[150px]">
                                                Display Order
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="questionCount" className="hidden md:table-cell">
                                                Questions
                                            </SortableTableHeader>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {semesters.map((semester) => (
                                            <TableRow key={semester.id}>
                                                <TableCell>
                                                    <div className="font-medium">{semester.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {semester.order}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary">
                                                        {semester.questionCount}
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
                                                                href={`/admin/semesters/${semester.id}/edit`}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <GenericDeleteButton
                                                            id={semester.id.toString()}
                                                            name={semester.name}
                                                            entityName="Semester"
                                                            deleteAction={deleteSemester}
                                                            isDisabled={semester.questionCount > 0}
                                                            disabledReason="Cannot delete a semester with questions"
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
