import { PageHeader } from "../../components/page-header";
import { SemesterForm } from "../components/semester-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Semester | DIU QBank Admin",
    description: "Create a new semester",
};

export default function CreateSemesterPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Create New Semester"
                description="Add a new semester to the system"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { href: "/admin/semesters", label: "Semesters" },
                    { label: "Create Semester" },
                ]}
            />
            <SemesterForm />
        </div>
    );
}
