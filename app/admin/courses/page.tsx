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
import { getPaginatedCourses, deleteCourse } from "./actions";
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
    title: "Courses Management | DIU QBank Admin",
    description: "Manage courses",
};

interface CoursesPageProps {
    searchParams: Promise<SearchParamsBase>;
}

export default async function CoursesPage({
    searchParams,
}: CoursesPageProps) {
    const { page, search, sortBy, sortOrder } = await parseListSearchParams(searchParams);

    const result = await getPaginatedCourses(page, 10, search, sortBy, sortOrder);

    const courses = result.success ? result.data?.courses ?? [] : [];
    const pagination = result.success
        ? result.data?.pagination ?? defaultPagination
        : defaultPagination;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Courses"
                description="Manage courses in the system"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { label: "Courses" },
                ]}
                actions={
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/courses/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Course
                        </Link>
                    </Button>
                }
            />

            <Card>
                <AdminListHeader
                    title="Courses List"
                    description={formatTotalLabel("course", pagination.totalCount)}
                    searchPlaceholder="Search courses or departments..."
                />
                <CardContent>
                    {courses.length === 0 ? (
                        <EmptyState
                            icon={<FileText className="h-6 w-6" />}
                            title="No courses found"
                            description={
                                search
                                    ? "No courses match your search criteria. Try a different search query or create a new course."
                                    : "Get started by creating your first course."
                            }
                            action={
                                <Button asChild variant="outline">
                                    <Link href="/admin/courses/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Course
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
                                            <SortableTableHeader sortKey="name" className="w-[300px]">
                                                Course Name
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="departmentName" className="w-[200px]">
                                                Department
                                            </SortableTableHeader>
                                            <SortableTableHeader sortKey="questionCount" className="hidden md:table-cell">
                                                Questions
                                            </SortableTableHeader>
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {courses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell>
                                                    <div className="font-medium">{course.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">{course.departmentName}</span>
                                                        <Badge variant="outline" className="w-fit">
                                                            {course.departmentShortName}
                                                        </Badge>
                                                    </div>
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
