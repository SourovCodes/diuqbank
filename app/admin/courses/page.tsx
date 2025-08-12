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
import { getPaginatedCourses, deleteCourse } from "./actions";
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
    title: "Courses Management | DIU QBank Admin",
    description: "Manage courses",
};

interface CoursesPageProps {
    searchParams: Promise<{
        page?: string;
        search?: string;
    }>;
}

export default async function CoursesPage({
    searchParams,
}: CoursesPageProps) {
    const awaitedSearchParams = await searchParams;
    const page = parseInt(awaitedSearchParams.page ?? "1", 10);
    const search = awaitedSearchParams.search || undefined;

    const { data } = await getPaginatedCourses(page, 10, search);

    const courses = data?.courses ?? [];
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
                                Courses
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your courses
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/courses/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                        <CardTitle className="text-xl">Courses List</CardTitle>
                        <CardDescription>
                            Total: {pagination.totalCount} course
                            {pagination.totalCount !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    <GenericSearch placeholder="Search courses..." />
                </CardHeader>
                <CardContent>
                    {courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                            <div className="rounded-full bg-muted p-3">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">
                                No courses found
                            </h3>
                            {search ? (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    No courses match your search criteria. Try a different
                                    search query or create a new course.
                                </p>
                            ) : (
                                <p className="mb-4 mt-2 text-center text-sm text-muted-foreground max-w-xs">
                                    Get started by creating your first course.
                                </p>
                            )}
                            <Button asChild variant="outline" className="mt-2">
                                <Link href="/admin/courses/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Course
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
                                            <TableHead className="hidden md:table-cell">
                                                Created By
                                            </TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Questions
                                            </TableHead>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell>
                                                    <div className="font-medium">{course.name}</div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="text-muted-foreground">
                                                        {course.createdBy || "Unknown"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <Badge variant="secondary">
                                                        {course.questionCount}
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
                                                                href={`/admin/courses/${course.id}/edit`}
                                                                className="flex items-center justify-center"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <GenericDeleteButton
                                                            id={course.id.toString()}
                                                            name={course.name}
                                                            entityName="Course"
                                                            deleteAction={deleteCourse}
                                                            isDisabled={course.questionCount > 0}
                                                            disabledReason="Cannot delete a course with questions"
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