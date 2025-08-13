import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionForm } from "../components/question-form";

export const metadata: Metadata = {
  title: "Create Question | DIU QBank Admin",
  description: "Create a new question",
};

export default function CreateQuestionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Question"
        description="Add a new question to the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/questions", label: "Questions" },
          { label: "Create" },
        ]}
      />
      <QuestionForm />
    </div>
  );
}
