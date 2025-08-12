import Link from "next/link";
import { FileText, Plus, Pencil } from "lucide-react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CustomPagination } from "@/components/custom-pagination";
import { getPaginatedDepartments, deleteDepartment } from "./actions";
import { GenericSearch } from "@/components/admin/generic-search";
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
    title: "Departments Management | DIU QBank Admin",
    description: "Manage departments",
};

interface DepartmentsPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function DepartmentsPage({
    searchParams,
}: DepartmentsPageProps) {
    const awaitedSearchParams = await searchParams;
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;

    const { data } = await getPaginatedDepartments(page, 10, search);

    const departments = data?.departments ?? [];
    const pagination = data?.pagination ?? {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Departments
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage departments in the system
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/departments/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Department
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                        <CardTitle className="text-xl">Departments List</CardTitle>
                        <CardDescription>
                            Total: {pagination.totalCount} department
                            {pagination.totalCount !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    <GenericSearch placeholder="Search departments..." />
                </CardHeader>
                <CardContent>
                    {departments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <div className="rounded-full bg-muted p-3">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">
                                No departments found
                            </h3>
                            {search ? (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    No departments match your search criteria. Try a different
                                    search query or create a new department.
                                </p>
                            ) : (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    Get started by creating your first department.
                                </p>
                            )}
                            <Button asChild variant="outline" className="mt-2">
                                <Link href="/admin/departments/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Department
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">Name</TableHead>
                                            <TableHead className="w-[150px]">Short Name</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Questions
                                            </TableHead>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departments.map((department) => (
                                            <TableRow key={department.id}>
                                                <TableCell>
                                                    <div className="font-medium">{department.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {department.shortName}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary">
                                                        {department.questionCount}
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
                                                                href={`/admin/departments/${department.id}/edit`}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <GenericDeleteButton
                                                            id={department.id.toString()}
                                                            name={department.name}
                                                            entityName="Department"
                                                            deleteAction={deleteDepartment}
                                                            isDisabled={department.questionCount > 0}
                                                            disabledReason="Cannot delete a department with questions"
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