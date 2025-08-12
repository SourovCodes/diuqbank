import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getSemester,
  getAllUserSemesters,
  migrateSemesterQuestions,
} from "../../actions";
import { PageHeader } from "@/components/admin/page-header";
import { MigrationDialog } from "@/components/admin/migration-dialog";

import { SemesterForm } from "../../components/semester-form";

interface EditSemesterPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Semester | DIU QBank Admin",
  description: "Edit semester details",
};

export default async function EditSemesterPage({
  params,
}: EditSemesterPageProps) {
  const resolvedParams = await params;
  const semesterId = resolvedParams.id;

  if (!semesterId) {
    notFound();
  }

  const [semesterResult, allSemestersResult] = await Promise.all([
    getSemester(semesterId),
    getAllUserSemesters(),
  ]);

  const { data: semester, error } = semesterResult;

  if (error || !semester) {
    notFound();
  }

  const allSemesters = allSemestersResult.success
    ? allSemestersResult.data || []
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Semester: ${semester.name}`}
        description="Modify semester details"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/semesters", label: "Semesters" },
          { label: "Edit Semester" },
        ]}
        actions={
          <MigrationDialog
            entityType="Semester"
            currentEntity={{
              id: semester.id,
              name: semester.name,
              questionCount:
                allSemesters.find((s) => s.id === semester.id)?.questionCount ||
                0,
            }}
            availableEntities={allSemesters}
            migrateAction={migrateSemesterQuestions}
            disabled={allSemesters.length <= 1}
            disabledReason={
              allSemesters.length <= 1
                ? "No other semesters available"
                : undefined
            }
          />
        }
      />

      <SemesterForm initialData={semester} isEditing semesterId={semesterId} />
    </div>
  );
}
