import QuestionForm from '@/components/questions/question-form';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import questionsRoutes from '@/routes/questions';
import type { SharedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type Department = {
    id: number;
    name: string;
};

type Semester = {
    id: number;
    name: string;
};

type Course = {
    id: number;
    name: string;
    department_id: number;
};

type ExamType = {
    id: number;
    name: string;
    requires_section: boolean;
};

type Question = {
    id: number;
    department_id: number;
    course_id: number;
    semester_id: number;
    exam_type_id: number;
    section: string | null;
    pdf_url: string;
};

interface QuestionEditProps extends SharedData {
    question: Question;
    departments: Department[];
    semesters: Semester[];
    courses: Course[];
    examTypes: ExamType[];
}

export default function QuestionEdit({ question, departments, semesters, courses, examTypes }: QuestionEditProps) {
    const { data, setData, post, errors, processing } = useForm({
        department_id: question.department_id.toString(),
        course_id: question.course_id.toString(),
        semester_id: question.semester_id.toString(),
        exam_type_id: question.exam_type_id.toString(),
        section: question.section ?? '',
        pdf: null as File | null,
        _method: 'PUT',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(questionsRoutes.update.url({ question: question.id }), {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                if (Object.keys(errors).length > 0) {
                    toast.error('Please review the form', {
                        description: 'Some fields need your attention before we can proceed.',
                        duration: 5000,
                    });
                }
            },
        });
    }

    function handleCancel() {
        router.visit(questionsRoutes.show.url({ question: question.id }));
    }

    return (
        <MainLayout>
            <Head title="Edit Question" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <div className="mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={questionsRoutes.show.url({ question: question.id })}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Question
                            </a>
                        </Button>
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">Edit Question</h1>
                    <p className="text-slate-600 dark:text-slate-400">Update the question paper details</p>
                </div>

                <div className="mx-auto max-w-7xl">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700 dark:bg-slate-900">
                        <QuestionForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            departments={departments}
                            semesters={semesters}
                            courses={courses}
                            examTypes={examTypes}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            submitLabel="Update Question"
                            existingPdfUrl={question.pdf_url}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
