import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getCourse,
  getAllUserCourses,
  migrateCourseQuestions,
} from "../../actions";
import { PageHeader } from "@/components/admin/page-header";
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

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const resolvedParams = await params;
  const courseId = resolvedParams.id;

  if (!courseId) {
    notFound();
  }

  const [courseResult, allCoursesResult] = await Promise.all([
    getCourse(courseId),
    getAllUserCourses(),
  ]);

  if (!courseResult.success || !courseResult.data) {
    notFound();
  }
  const course = courseResult.data;

  const allCourses = allCoursesResult.success
    ? allCoursesResult.data || []
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Course: ${course.name}`}
        description="Modify course details"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { label: "Edit Course" },
        ]}
        actions={
          <MigrationDialog
            entityType="Course"
            currentEntity={{
              id: course.id,
              name: course.name,
              questionCount:
                allCourses.find((c) => c.id === course.id)?.questionCount || 0,
            }}
            availableEntities={allCourses}
            migrateAction={migrateCourseQuestions}
            disabled={allCourses.length <= 1}
            disabledReason={
              allCourses.length <= 1 ? "No other courses available" : undefined
            }
          />
        }
      />

      <CourseForm initialData={course} isEditing courseId={courseId} />
    </div>
  );
}
