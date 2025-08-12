import { CourseForm } from "../components/course-form";
import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Create Course | DIU QBank Admin",
  description: "Create a new course",
};

export default function CreateCoursePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Course"
        description="Add a new course"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { label: "Create Course" },
        ]}
      />
      <CourseForm />
    </div>
  );
}
