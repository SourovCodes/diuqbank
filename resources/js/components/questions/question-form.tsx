import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Course, Department, ExamType, Semester } from '@/types';
import { AlertTriangle, FileText, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface QuestionFormData {
    department_id: string;
    course_id: string;
    semester_id: string;
    exam_type_id: string;
    section: string;
    pdf: File | null;
    duplicate_reason?: string;
    confirmed_duplicate?: boolean;
}

interface QuestionFormErrors {
    department_id?: string;
    course_id?: string;
    semester_id?: string;
    exam_type_id?: string;
    section?: string;
    pdf?: string;
    duplicate_reason?: string;
    duplicate?: string;
}

interface QuestionFormProps {
    data: QuestionFormData;
    setData: (key: keyof QuestionFormData, value: any) => void;
    errors: QuestionFormErrors;
    processing: boolean;
    departments: Department[];
    semesters: Semester[];
    courses: Course[];
    examTypes: ExamType[];
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel?: string;
    existingPdfUrl?: string;
}

export default function QuestionForm({
    data,
    setData,
    errors,
    processing,
    departments,
    semesters,
    courses,
    examTypes,
    onSubmit,
    onCancel,
    submitLabel = 'Create Question',
    existingPdfUrl,
}: QuestionFormProps) {
    const [pdfFileName, setPdfFileName] = useState<string>('');
    const [showDuplicateReason, setShowDuplicateReason] = useState<boolean>(false);

    // Check if there's a backend duplicate error
    const hasDuplicateError = errors.duplicate !== undefined;

    // Filter courses based on selected department
    const filteredCourses = useMemo(() => {
        if (!data.department_id) {
            return [];
        }

        return courses.filter((course) => course.department_id === parseInt(data.department_id));
    }, [data.department_id, courses]);

    // Check if section is required based on selected exam type
    const requiresSection = useMemo(() => {
        if (!data.exam_type_id) {
            return false;
        }

        const examType = examTypes.find((et) => et.id === parseInt(data.exam_type_id));

        return examType?.requires_section ?? false;
    }, [data.exam_type_id, examTypes]);

    // Reset course when department changes
    useEffect(() => {
        if (data.department_id && data.course_id) {
            const course = courses.find((c) => c.id === parseInt(data.course_id));
            if (!course || course.department_id !== parseInt(data.department_id)) {
                setData('course_id', '');
            }
        }
    }, [data.department_id]);

    // Reset section when exam type changes
    useEffect(() => {
        if (!requiresSection && data.section) {
            setData('section', '');
        }
    }, [requiresSection]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('pdf', file);
            setPdfFileName(file.name);
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Department and Course */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="department_id">
                        Department <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.department_id} onValueChange={(value) => setData('department_id', value)}>
                        <SelectTrigger id="department_id" className="w-full" aria-invalid={!!errors.department_id}>
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.department_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.department_id}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="course_id">
                        Course <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.course_id} onValueChange={(value) => setData('course_id', value)} disabled={!data.department_id}>
                        <SelectTrigger id="course_id" className="w-full" aria-invalid={!!errors.course_id}>
                            <SelectValue placeholder={data.department_id ? 'Select course' : 'Select department first'} />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id.toString()}>
                                    {course.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.course_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.course_id}</p>}
                </div>
            </div>

            {/* Semester and Exam Type */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="semester_id">
                        Semester <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.semester_id} onValueChange={(value) => setData('semester_id', value)}>
                        <SelectTrigger id="semester_id" className="w-full" aria-invalid={!!errors.semester_id}>
                            <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {semesters.map((semester) => (
                                <SelectItem key={semester.id} value={semester.id.toString()}>
                                    {semester.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.semester_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.semester_id}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="exam_type_id">
                        Exam Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.exam_type_id} onValueChange={(value) => setData('exam_type_id', value)}>
                        <SelectTrigger id="exam_type_id" className="w-full" aria-invalid={!!errors.exam_type_id}>
                            <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                            {examTypes.map((examType) => (
                                <SelectItem key={examType.id} value={examType.id.toString()}>
                                    {examType.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.exam_type_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.exam_type_id}</p>}
                </div>
            </div>

            {/* Section (conditional) */}
            {requiresSection && (
                <div className="space-y-2">
                    <Label htmlFor="section">
                        Section <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="section"
                        type="text"
                        value={data.section}
                        onChange={(e) => setData('section', e.target.value)}
                        placeholder="e.g., 65_N, 64_A"
                        aria-invalid={!!errors.section}
                        className="max-w-xs"
                    />
                    {errors.section && <p className="text-sm text-red-600 dark:text-red-400">{errors.section}</p>}
                </div>
            )}

            {/* Duplicate Warning and Reason */}
            {hasDuplicateError && (
                <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                        <div className="flex-1 space-y-3">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Duplicate Detected</h3>
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                A question with these exact details already exists on the website.
                            </p>

                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                If you believe this is a unique question and our detection missed it, please explain why below and submit for manual
                                review.
                            </p>

                            {!showDuplicateReason ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDuplicateReason(true)}
                                    className="border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/50"
                                >
                                    This is not a duplicate - Let me explain
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="duplicate_reason" className="text-amber-900 dark:text-amber-100">
                                        Why is this not a duplicate? <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                        id="duplicate_reason"
                                        value={data.duplicate_reason || ''}
                                        onChange={(e) => {
                                            setData('duplicate_reason', e.target.value);
                                            setData('confirmed_duplicate', true);
                                        }}
                                        placeholder="Please explain why you believe this question is unique and different from the existing question..."
                                        rows={4}
                                        className="border-amber-300 bg-white focus:border-amber-500 focus:ring-amber-500 dark:border-amber-700 dark:bg-slate-900"
                                    />
                                    {errors.duplicate_reason && <p className="text-sm text-red-600 dark:text-red-400">{errors.duplicate_reason}</p>}
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Your submission will be reviewed by our team before being published.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Existing PDF Display (Edit Mode) */}
            {existingPdfUrl && (
                <div className="space-y-2">
                    <Label>Current PDF</Label>
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Question paper uploaded</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">A PDF file is currently associated with this question</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" asChild>
                            <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer">
                                View PDF
                            </a>
                        </Button>
                    </div>
                </div>
            )}

            {/* PDF Upload */}
            <div className="space-y-3">
                <Label htmlFor="pdf">Question Paper (PDF) {!existingPdfUrl && <span className="text-red-500">*</span>}</Label>
                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                            <Upload className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="space-y-1">
                            <label
                                htmlFor="pdf"
                                className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                {pdfFileName ? (
                                    <span className="text-slate-900 dark:text-white">{pdfFileName}</span>
                                ) : (
                                    <>
                                        Click to upload {existingPdfUrl ? 'new file' : ''}{' '}
                                        <span className="text-slate-600 dark:text-slate-400">or drag and drop</span>
                                    </>
                                )}
                            </label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {existingPdfUrl && !pdfFileName ? 'Current file will be kept if no new file is uploaded' : 'PDF files only, max 10MB'}
                            </p>
                        </div>
                        <input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    </div>
                </div>
                {errors.pdf && <p className="text-sm text-red-600 dark:text-red-400">{errors.pdf}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="min-w-[140px] rounded-full border border-slate-200 bg-white px-6 font-medium shadow-md transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-[140px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl disabled:opacity-50 dark:from-blue-500 dark:to-cyan-500 dark:hover:from-blue-600 dark:hover:to-cyan-600"
                >
                    {processing ? 'Submitting...' : submitLabel}
                </Button>
            </div>
        </form>
    );
}
