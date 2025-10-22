import QuestionForm from '@/components/questions/question-form';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/main-layout';
import questionsRoutes from '@/routes/questions';
import type { QuestionDetailResource, QuestionFormOptions, SharedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionEditProps extends SharedData {
    question: QuestionDetailResource;
    formOptions: QuestionFormOptions;
}

export default function QuestionEdit({ question, formOptions }: QuestionEditProps) {
    const { data, setData, post, errors, processing } = useForm({
        department_id: question.department.id.toString(),
        course_id: question.course.id.toString(),
        semester_id: question.semester.id.toString(),
        exam_type_id: question.exam_type.id.toString(),
        section: question.section ?? '',
        pdf: null as File | null,
        duplicate_reason: '',
        confirmed_duplicate: false,
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
        router.visit(questionsRoutes.show.url(question.id));
    }

    return (
        <MainLayout>
            <Head title="Edit Question" />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <div className="mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <a href={questionsRoutes.show.url(question.id)}>
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
                            departments={formOptions.departments}
                            semesters={formOptions.semesters}
                            courses={formOptions.courses}
                            examTypes={formOptions.examTypes}
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
