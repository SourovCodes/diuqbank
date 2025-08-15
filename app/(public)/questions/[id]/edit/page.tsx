import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { QuestionForm } from "../../components/question-form";
import { getQuestionForEdit } from "../../actions";

export const metadata: Metadata = {
  title: "Edit Question | DIU QBank",
  description: "Edit your submitted question",
};

interface EditQuestionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditQuestionPage({
  params,
}: EditQuestionPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const awaitedParams = await params;
  const res = await getQuestionForEdit(awaitedParams.id);

  if (!res.success || !res.data) {
    notFound();
  }

  const data = res.data;

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header section */}
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Edit{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
            Question
          </span>
        </h1>
        <div className="mx-auto w-20 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full mb-6"></div>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Update your question details. Changes will need to be reviewed again
          before being published.
        </p>
      </div>

      <QuestionForm
        initialData={data}
        isEditing={true}
        questionId={awaitedParams.id}
      />
    </div>
  );
}
