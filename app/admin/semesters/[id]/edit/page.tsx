import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getSemester, getAllUserSemesters, migrateSemesterQuestions } from "../../actions";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

    const allSemesters = allSemestersResult.success ? allSemestersResult.data || [] : [];

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
                                <Link href="/admin/semesters">Semesters</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit Semester
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Semester: {semester.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Modify semester details
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <MigrationDialog
                            entityType="Semester"
                            currentEntity={{
                                id: semester.id,
                                name: semester.name,
                                questionCount: allSemesters.find(s => s.id === semester.id)?.questionCount || 0,
                            }}
                            availableEntities={allSemesters}
                            migrateAction={migrateSemesterQuestions}
                            disabled={allSemesters.length <= 1}
                            disabledReason={allSemesters.length <= 1 ? "No other semesters available" : undefined}
                        />
                    </div>
                </div>
            </div>

            <SemesterForm initialData={semester} isEditing semesterId={semesterId} />
        </div>
    );
} 