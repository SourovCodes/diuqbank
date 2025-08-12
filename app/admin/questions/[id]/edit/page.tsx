import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { QuestionForm } from "../../components/question-form";
import { getQuestion } from "../../actions";

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
    const { data } = await getQuestion(awaitedParams.id);

    if (!data) {
        notFound();
    }

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
                                <Link href="/admin/questions">Questions</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground font-medium">
                                Edit
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Question</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Update question details and status
                    </p>
                </div>
            </div>

            <QuestionForm
                initialData={data}
                isEditing={true}
                questionId={awaitedParams.id}
            />
        </div>
    );
} 