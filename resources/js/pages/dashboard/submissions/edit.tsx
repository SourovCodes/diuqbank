import { Head, useForm } from '@inertiajs/react';
import { FileEdit } from 'lucide-react';
import type { FormEvent } from 'react';

import type { FormOptions, SubmissionFormData } from '@/components/submissions/submission-form';
import { SubmissionForm } from '@/components/submissions/submission-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { index, update } from '@/routes/dashboard/submissions';
import type { SubmissionEditData } from '@/types';

interface Props {
    submission: SubmissionEditData;
    formOptions: FormOptions;
}

interface EditFormData extends SubmissionFormData {
    _method: string;
}

export default function Edit({ submission, formOptions }: Props) {
    const { data, setData, post, processing, errors, progress, clearErrors } = useForm<EditFormData>({
        department_id: String(submission.department_id),
        course_id: String(submission.course_id),
        semester_id: String(submission.semester_id),
        exam_type_id: String(submission.exam_type_id),
        section: submission.section ?? '',
        pdf: null,
        _method: 'put',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(update.url(submission.id));
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: 'My Submissions', href: index.url() }, { label: 'Edit' }]}>
            <Head title="Edit Submission" />

            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Submission</h1>
                    <p className="text-muted-foreground">Update the details of your question paper submission.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileEdit className="h-5 w-5" />
                            Question Paper Details
                        </CardTitle>
                        <CardDescription>
                            Update the information about your submission. You can change the classification or upload a new PDF file.
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
