import { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionForm } from "../components/question-form";
import {
  getDepartmentsForDropdown,
  getCoursesForDropdown,
  getSemestersForDropdown,
  getExamTypesForDropdown,
} from "../actions";

export const metadata: Metadata = {
  title: "Create Question | DIU QBank Admin",
  description: "Create a new question",
};

export default async function CreateQuestionPage() {
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
        title="Create Question"
        description="Add a new question to the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/questions", label: "Questions" },
          { label: "Create" },
        ]}
      />
      <QuestionForm dropdowns={dropdowns} />
    </div>
  );
}
