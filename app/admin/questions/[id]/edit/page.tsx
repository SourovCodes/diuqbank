import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionForm } from "../../components/question-form";
import { getQuestion } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Question | DIU QBank Admin",
  description: "Edit an existing question",
};

interface EditQuestionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuestionPage({
  params,
}: EditQuestionPageProps) {
  const awaitedParams = await params;
  const { data } = await getQuestion(awaitedParams.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Question"
        description="Update question details and status"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/questions", label: "Questions" },
          { label: "Edit" },
        ]}
      />

      <QuestionForm
        initialData={data}
        isEditing={true}
        questionId={awaitedParams.id}
      />
    </div>
  );
}
