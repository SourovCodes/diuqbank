import { notFound } from "next/navigation";
import { Metadata } from "next";
import { PageHeader } from "@/app/admin/components/page-header";
import { QuestionForm } from "../../components/question-form";
import { getQuestion } from "../../actions";
import {
  getDepartmentsForDropdown,
  getSemestersForDropdown,
  getExamTypesForDropdown,
  getUsersForDropdown,
  getAllCoursesForDropdown,
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

  const [deptRes, semRes, examRes, userRes, allCoursesRes] = await Promise.all([
    getDepartmentsForDropdown(),
    getSemestersForDropdown(),
    getExamTypesForDropdown(),
    getUsersForDropdown(),
    getAllCoursesForDropdown(),
  ]);

  const departments = deptRes.success ? (deptRes.data || []) : [];
  const semesters = semRes.success ? (semRes.data || []) : [];
  const examTypes = examRes.success ? (examRes.data || []) : [];
  const users = userRes.success ? (userRes.data || []) : [];
  const allCourses = allCoursesRes.success ? (allCoursesRes.data || []) : [];

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
        departments={departments}
        semesters={semesters}
        examTypes={examTypes}
        users={users}
        allCourses={allCourses}
      />
    </div>
  );
}
