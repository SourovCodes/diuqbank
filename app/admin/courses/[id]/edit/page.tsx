import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getCourse, getAllUserCourses, migrateCourseQuestions } from "../../actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MigrationDialog } from "@/components/admin/migration-dialog";

import { CourseForm } from "../../components/course-form";

interface EditCoursePageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata: Metadata = {
    title: "Edit Course | DIU QBank Admin",
    description: "Edit course details",
};

export default async function EditCoursePage({
    params,
}: EditCoursePageProps) {
    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    if (!courseId) {
        notFound();
    }

    const [courseResult, allCoursesResult] = await Promise.all([
        getCourse(courseId),
        getAllUserCourses(),
    ]);

    const { data: course, error } = courseResult;

    if (error || !course) {
        notFound();
    }

    const allCourses = allCoursesResult.success ? allCoursesResult.data || [] : [];

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
                            <BreadcrumbLink asChild>
                                <Link href="/admin/courses">Courses</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit Course
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Course: {course.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify course details
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <MigrationDialog
                            entityType="Course"
                            currentEntity={{
                                id: course.id,
                                name: course.name,
                                questionCount: allCourses.find(c => c.id === course.id)?.questionCount || 0,
                            }}
                            availableEntities={allCourses}
                            migrateAction={migrateCourseQuestions}
                            disabled={allCourses.length <= 1}
                            disabledReason={allCourses.length <= 1 ? "No other courses available" : undefined}
                        />
                    </div>
                </div>
            </div>

            <CourseForm initialData={course} isEditing courseId={courseId} />
        </div>
    );
} 