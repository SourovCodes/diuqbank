import { Head, useForm } from '@inertiajs/react';
import { FileUp } from 'lucide-react';
import type { FormEvent } from 'react';

import type { FormOptions, SubmissionFormData } from '@/components/submissions/submission-form';
import { SubmissionForm } from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { index, store } from '@/routes/dashboard/submissions';

interface Props {
    formOptions: FormOptions;
}

export default function Create({ formOptions }: Props) {
    const { data, setData, post, processing, errors, progress, clearErrors } = useForm<SubmissionFormData>({
        department_id: '',
        course_id: '',
        semester_id: '',
        exam_type_id: '',
        pdf: null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(store.url());
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'My Submissions', href: index.url() }, { label: 'Create' }]}>
            <Head title="Submit Question Paper" />

            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Submit Question Paper</h1>
                    <p className="text-muted-foreground">Share a question paper with the community to help other students.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileUp className="h-5 w-5" />
                            Question Paper Details
                        </CardTitle>
                        <CardDescription>
                            Fill in the details about the question paper you want to submit. Make sure to select the correct department, course, semester, and exam type.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubmissionForm
                            formOptions={formOptions}
                            data={data}
                            setData={setData}
                            errors={errors}
                            clearErrors={clearErrors}
                            processing={processing}
                            progress={progress}
                            onSubmit={handleSubmit}
                            submitLabel="Submit Question Paper"
                            submittingLabel="Submitting..."
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

Create.layout = null;
