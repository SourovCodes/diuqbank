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

interface QuestionCreateProps extends SharedData {
    departments: Department[];
    semesters: Semester[];
    courses: Course[];
    examTypes: ExamType[];
}

export default function QuestionCreate({ departments, semesters, courses, examTypes }: QuestionCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        department_id: '',
        course_id: '',
        semester_id: '',
        exam_type_id: '',
        section: '',
        pdf: null as File | null,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(questionsRoutes.store.url(), {
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
        router.visit(questionsRoutes.index.url());
    }

    return (
        <MainLayout>
            <Head title="Create Question" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <div className="mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={questionsRoutes.index.url()}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Questions
                            </a>
                        </Button>
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-white">Create Question</h1>
                    <p className="text-slate-600 dark:text-slate-400">Upload a new question paper to share with the community</p>
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
                            submitLabel="Create Question"
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
