import { PageHeader } from "../../components/page-header";
import { CourseForm } from "../components/course-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Course | DIU QBank Admin",
    description: "Create a new course",
};

export default function CreateCoursePage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Create New Course"
                description="Add a new course to the system"
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
