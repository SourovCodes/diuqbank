import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionForm } from "../../components/question-form";
import {
  getQuestion,
  getDepartmentsForDropdown,
  getCoursesForDropdown,
  getSemestersForDropdown,
  getExamTypesForDropdown,
} from "../../actions";

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
  const res = await getQuestion(awaitedParams.id);

  if (!res.success || !res.data) {
    notFound();
  }
  const data = res.data;

  const [deptResult, courseResult, semesterResult, examTypeResult] =
    await Promise.all([
      getDepartmentsForDropdown(),
      getCoursesForDropdown(),
      getSemestersForDropdown(),
      getExamTypesForDropdown(),
    ]);

  const dropdowns = {
    departments: deptResult.success ? deptResult.data || [] : [],
    courses: courseResult.success ? courseResult.data || [] : [],
    semesters: semesterResult.success ? semesterResult.data || [] : [],
    examTypes: examTypeResult.success ? examTypeResult.data || [] : [],
  } as const;

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
        dropdowns={dropdowns}
      />
    </div>
  );
}
