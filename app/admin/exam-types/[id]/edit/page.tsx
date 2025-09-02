import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    getExamType,
    getAllExamTypes,
    migrateExamTypeQuestions,
} from "../../actions";
import { PageHeader } from "../../../components/page-header";
import { MigrationDialog } from "../../../components/migration-dialog";

import { ExamTypeForm } from "../../components/examtype-form";

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

    if (!examTypeResult.success || !examTypeResult.data) {
        notFound();
    }
    const examType = examTypeResult.data;

    const allExamTypes = allExamTypesResult.success
        ? allExamTypesResult.data || []
        : [];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`Edit Exam Type: ${examType.name}`}
                description="Modify exam type details"
                crumbs={[
                    { href: "/admin", label: "Dashboard" },
                    { href: "/admin/exam-types", label: "Exam Types" },
                    { label: "Edit Exam Type" },
                ]}
                actions={
                    <MigrationDialog
                        entityType="Exam Type"
                        currentEntity={{
                            id: examType.id,
                            name: examType.name,
                            questionCount:
                                allExamTypes.find((e) => e.id === examType.id)
                                    ?.questionCount || 0,
                        }}
                        availableEntities={allExamTypes}
                        migrateAction={migrateExamTypeQuestions}
                        disabled={allExamTypes.length <= 1}
                        disabledReason={
                            allExamTypes.length <= 1
                                ? "No other exam types available"
                                : undefined
                        }
                    />
                }
            />

            <ExamTypeForm
                initialData={examType}
                isEditing
                examTypeId={examTypeId}
            />
        </div>
    );
}
