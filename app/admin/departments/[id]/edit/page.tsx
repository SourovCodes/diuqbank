import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getDepartment, getAllDepartments, migrateDepartmentQuestions } from "../../actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

    const { data: department, error } = departmentResult;

    if (error || !department) {
        notFound();
    }

    const allDepartments = allDepartmentsResult.success ? allDepartmentsResult.data || [] : [];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/admin/departments">Departments</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit Department
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Department: {department.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify department details
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <MigrationDialog
                            entityType="Department"
                            currentEntity={{
                                id: department.id,
                                name: department.name,
                                questionCount: allDepartments.find(d => d.id === department.id)?.questionCount || 0,
                            }}
                            availableEntities={allDepartments}
                            migrateAction={migrateDepartmentQuestions}
                            disabled={allDepartments.length <= 1}
                            disabledReason={allDepartments.length <= 1 ? "No other departments available" : undefined}
                        />
                    </div>
                </div>
            </div>

            <DepartmentForm initialData={department} isEditing departmentId={departmentId} />
        </div>
    );
} 