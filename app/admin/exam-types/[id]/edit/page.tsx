import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getExamType, getAllExamTypes, migrateExamTypeQuestions } from "../../actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MigrationDialog } from "@/components/admin/migration-dialog";

import { ExamTypeForm } from "../../components/exam-type-form";

interface EditExamTypePageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Edit Exam Type | DIU QBank Admin",
  description: "Edit exam type details",
};

export default async function EditExamTypePage({
  params,
}: EditExamTypePageProps) {
  const resolvedParams = await params;
  const examTypeId = resolvedParams.id;

  if (!examTypeId) {
    notFound();
  }

  const [examTypeResult, allExamTypesResult] = await Promise.all([
    getExamType(examTypeId),
    getAllExamTypes(),
  ]);

  const { data: examType, error } = examTypeResult;

  if (error || !examType) {
    notFound();
  }

  const allExamTypes = allExamTypesResult.success ? allExamTypesResult.data || [] : [];

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
                <Link href="/admin/exam-types">Exam Types</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-foreground font-medium">
                Edit Exam Type
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Exam Type: {examType.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Modify exam type details
            </p>
          </div>
          <div className="flex gap-2">
            <MigrationDialog
              entityType="Exam Type"
              currentEntity={{
                id: examType.id,
                name: examType.name,
                questionCount: allExamTypes.find(e => e.id === examType.id)?.questionCount || 0,
              }}
              availableEntities={allExamTypes}
              migrateAction={migrateExamTypeQuestions}
              disabled={allExamTypes.length <= 1}
              disabledReason={allExamTypes.length <= 1 ? "No other exam types available" : undefined}
            />
          </div>
        </div>
      </div>

      <ExamTypeForm initialData={examType} isEditing examTypeId={examTypeId} />
    </div>
  );
}
