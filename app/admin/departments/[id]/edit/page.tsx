import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getDepartment,
  getAllDepartments,
  migrateDepartmentQuestions,
} from "../../actions";
import { PageHeader } from "@/components/admin/page-header";
import { MigrationDialog } from "@/components/admin/migration-dialog";

import { DepartmentForm } from "../../components/department-form";

interface EditDepartmentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Department | DIU QBank Admin",
  description: "Edit department details",
};

export default async function EditDepartmentPage({
  params,
}: EditDepartmentPageProps) {
  const resolvedParams = await params;
  const departmentId = resolvedParams.id;

  if (!departmentId) {
    notFound();
  }

  const [departmentResult, allDepartmentsResult] = await Promise.all([
    getDepartment(departmentId),
    getAllDepartments(),
  ]);

  if (!departmentResult.success || !departmentResult.data) {
    notFound();
  }
  const department = departmentResult.data;

  const allDepartments = allDepartmentsResult.success
    ? allDepartmentsResult.data || []
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Department: ${department.name}`}
        description="Modify department details"
        crumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/departments", label: "Departments" },
          { label: "Edit Department" },
        ]}
        actions={
          <MigrationDialog
            entityType="Department"
            currentEntity={{
              id: department.id,
              name: department.name,
              questionCount:
                allDepartments.find((d) => d.id === department.id)
                  ?.questionCount || 0,
            }}
            availableEntities={allDepartments}
            migrateAction={migrateDepartmentQuestions}
            disabled={allDepartments.length <= 1}
            disabledReason={
              allDepartments.length <= 1
                ? "No other departments available"
                : undefined
            }
          />
        }
      />

      <DepartmentForm
        initialData={department}
        isEditing
        departmentId={departmentId}
      />
    </div>
  );
}
