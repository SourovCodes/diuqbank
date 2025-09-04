import { Metadata } from "next";
import { PageHeader } from "@/app/admin/components/page-header";
import { QuestionForm } from "../components/question-form";
import {
  getDepartmentsForDropdown,
  getSemestersForDropdown,
  getExamTypesForDropdown,
  getUsersForDropdown,
  getAllCoursesForDropdown,
} from "../actions";

export const metadata: Metadata = {
  title: "Create Question | DIU QBank Admin",
  description: "Create a new question",
};
export const dynamic = 'force-dynamic';
export default async function CreateQuestionPage() {
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
        title="Create Question"
        description="Add a new question to the system"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/questions", label: "Questions" },
          { label: "Create" },
        ]}
      />
      <QuestionForm
        departments={departments}
        semesters={semesters}
        examTypes={examTypes}
        users={users}
        allCourses={allCourses}
      />
    </div>
  );
}
