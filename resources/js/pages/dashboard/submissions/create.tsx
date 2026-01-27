import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import type { FormOptions, SubmissionFormData } from '@/components/submissions/submission-form';
import { SubmissionForm } from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';

interface Props {
    formOptions: FormOptions;
}

export default function Create({ formOptions }: Props) {
    const { data, setData, post, processing, errors, progress } = useForm<SubmissionFormData>({
        department_id: '',
        course_id: '',
        semester_id: '',
        exam_type_id: '',
        pdf: null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/dashboard/submissions');
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'My Submissions', href: '/dashboard/submissions' }, { label: 'Create' }]}>
            <Head title="Submit Question Paper" />

            <div className="mx-auto max-w-lg">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Submit Question Paper</CardTitle>
                        <CardDescription>Share a question paper with the community</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubmissionForm
                            formOptions={formOptions}
                            data={data}
                            setData={setData}
                            errors={errors}
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
