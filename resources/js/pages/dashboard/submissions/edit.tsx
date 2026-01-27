import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

import type { FormOptions, SubmissionFormData } from '@/components/submissions/submission-form';
import { SubmissionForm } from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';

interface SubmissionData {
    id: number;
    department_id: number;
    course_id: number;
    semester_id: number;
    exam_type_id: number;
    pdf_url: string | null;
    pdf_name: string | null;
}

interface Props {
    submission: SubmissionData;
    formOptions: FormOptions;
}

interface EditFormData extends SubmissionFormData {
    _method: string;
}

export default function Edit({ submission, formOptions }: Props) {
    const { data, setData, post, processing, errors, progress } = useForm<EditFormData>({
        department_id: String(submission.department_id),
        course_id: String(submission.course_id),
        semester_id: String(submission.semester_id),
        exam_type_id: String(submission.exam_type_id),
        pdf: null,
        _method: 'put',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/dashboard/submissions/${submission.id}`);
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'My Submissions', href: '/dashboard/submissions' }, { label: 'Edit' }]}>
            <Head title="Edit Submission" />

            <div className="mx-auto max-w-lg">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Edit Submission</CardTitle>
                        <CardDescription>Update your question paper submission</CardDescription>
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
                            submitLabel="Update Submission"
                            submittingLabel="Updating..."
                            existingPdfUrl={submission.pdf_url}
                            existingPdfName={submission.pdf_name}
                        />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

Edit.layout = null;
