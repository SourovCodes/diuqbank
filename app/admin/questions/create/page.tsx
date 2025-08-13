import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionForm } from "../components/question-form";

// This page reads auth/session via server actions and NextAuth (uses headers/cookies),
// so opt out of static rendering to prevent build-time dynamic server usage errors.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Question | DIU QBank Admin",
  description: "Create a new question",
};

export default async function CreateQuestionPage() {
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
