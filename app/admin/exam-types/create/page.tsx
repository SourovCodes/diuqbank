import { ExamTypeForm } from "../components/exam-type-form";
import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Create Exam Type | DIU QBank Admin",
  description: "Create a new exam type",
};

export default function CreateExamTypePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Exam Type"
        description="Add a new exam type to the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/exam-types", label: "Exam Types" },
          { label: "Create Exam Type" },
        ]}
      />
      <ExamTypeForm />
    </div>
  );
}
