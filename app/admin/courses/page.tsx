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
import { GenericDeleteButton } from "@/components/admin/generic-delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { EmptyState } from "@/components/admin/empty-state";
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

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { page, search } = await parseListSearchParams(searchParams);

  const { data } = await getPaginatedCourses(page, 10, search);

  const courses = data?.courses ?? [];
  const pagination = data?.pagination ?? defaultPagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Manage your courses"
        crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Courses" }]}
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
          searchPlaceholder="Search courses..."
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
