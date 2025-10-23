import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormCombobox } from '@/components/ui/form-combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuestionCard } from '@/components/ui/question-card';
import { Textarea } from '@/components/ui/textarea';
import coursesRoutes from '@/routes/courses';
import semestersRoutes from '@/routes/semesters';
import type { Course, Department, ExamType, QuestionResource, Semester } from '@/types';
import { AlertTriangle, FileText, Plus, Upload } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

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
    duplicate_question?: string;
}

interface QuestionFormProps {
    data: QuestionFormData;
    setData: (key: keyof QuestionFormData, value: string | File | boolean | null) => void;
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

interface NewCourseFormState {
    department_id: string;
    name: string;
}

interface NewCourseFormErrors {
    department_id?: string;
    name?: string;
}

interface NewSemesterFormState {
    name: string;
}

interface NewSemesterFormErrors {
    name?: string;
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

function getCsrfToken(): string {
    const token = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    return token ? decodeURIComponent(token) : '';
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
    const [duplicateQuestion, setDuplicateQuestion] = useState<QuestionResource | null>(null);
    const [localCourses, setLocalCourses] = useState<Course[]>(courses);
    const [localSemesters, setLocalSemesters] = useState<Semester[]>(semesters);
    const [courseDialogOpen, setCourseDialogOpen] = useState<boolean>(false);
    const [courseForm, setCourseForm] = useState<NewCourseFormState>({ department_id: '', name: '' });
    const [courseFormErrors, setCourseFormErrors] = useState<NewCourseFormErrors>({});
    const [courseSubmitting, setCourseSubmitting] = useState<boolean>(false);
    const [semesterDialogOpen, setSemesterDialogOpen] = useState<boolean>(false);
    const [semesterForm, setSemesterForm] = useState<NewSemesterFormState>({ name: '' });
    const [semesterFormErrors, setSemesterFormErrors] = useState<NewSemesterFormErrors>({});
    const [semesterSubmitting, setSemesterSubmitting] = useState<boolean>(false);
    const [pendingCourseSelection, setPendingCourseSelection] = useState<{ courseId: string; departmentId: string } | null>(null);
    const [pendingSemesterSelection, setPendingSemesterSelection] = useState<string | null>(null);

    // Parse duplicate question from errors
    useEffect(() => {
        if (errors.duplicate_question) {
            try {
                const parsed = JSON.parse(errors.duplicate_question) as QuestionResource;
                setDuplicateQuestion(parsed);
            } catch (error) {
                console.error('Failed to parse duplicate question:', error);
                setDuplicateQuestion(null);
            }
        } else {
            setDuplicateQuestion(null);
            setShowDuplicateReason(false);
        }
    }, [errors.duplicate_question]);

    useEffect(() => {
        setLocalCourses(courses);
    }, [courses]);

    useEffect(() => {
        setLocalSemesters(semesters);
    }, [semesters]);

    // Handle pending course selection after localCourses updates
    useEffect(() => {
        if (pendingCourseSelection) {
            const { courseId, departmentId } = pendingCourseSelection;

            // First ensure department is set
            if (data.department_id !== departmentId) {
                setData('department_id', departmentId);
            }

            // Then set the course
            setData('course_id', courseId);
            setPendingCourseSelection(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingCourseSelection]);

    // Handle pending semester selection after localSemesters updates
    useEffect(() => {
        if (pendingSemesterSelection) {
            setData('semester_id', pendingSemesterSelection);
            setPendingSemesterSelection(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingSemesterSelection]);

    // Check if there's a backend duplicate error
    const hasDuplicateError = errors.duplicate !== undefined;

    // Filter courses based on selected department
    const filteredCourses = useMemo(() => {
        if (!data.department_id) {
            return [];
        }

        const departmentId = parseInt(data.department_id, 10);

        return localCourses.filter((course) => course.department_id === departmentId);
    }, [data.department_id, localCourses]);

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
            const courseId = parseInt(data.course_id, 10);
            const departmentId = parseInt(data.department_id, 10);
            const course = localCourses.find((c) => c.id === courseId);

            if (!course || course.department_id !== departmentId) {
                setData('course_id', '');
            }
        }
    }, [data.department_id, data.course_id, localCourses, setData]);

    // Reset section when exam type changes
    useEffect(() => {
        if (!requiresSection && data.section) {
            setData('section', '');
        }
    }, [requiresSection, data.section, setData]);

    function openCourseDialog(): void {
        setCourseForm({
            department_id: data.department_id || '',
            name: '',
        });
        setCourseFormErrors({});
        setCourseSubmitting(false);
        setCourseDialogOpen(true);
    }

    function handleCourseDialogChange(open: boolean, defaultDepartmentId?: string): void {
        setCourseDialogOpen(open);

        if (!open) {
            setCourseForm({
                department_id: defaultDepartmentId ?? data.department_id ?? '',
                name: '',
            });
            setCourseFormErrors({});
            setCourseSubmitting(false);
        }
    }

    function openSemesterDialog(): void {
        setSemesterForm({ name: '' });
        setSemesterFormErrors({});
        setSemesterSubmitting(false);
        setSemesterDialogOpen(true);
    }

    function handleSemesterDialogChange(open: boolean): void {
        setSemesterDialogOpen(open);

        if (!open) {
            setSemesterForm({ name: '' });
            setSemesterFormErrors({});
            setSemesterSubmitting(false);
        }
    }

    async function handleCourseSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const trimmedName = courseForm.name.trim();
        const departmentId = courseForm.department_id;

        const validationErrors: NewCourseFormErrors = {};

        if (!departmentId) {
            validationErrors.department_id = 'Select a department.';
        }

        if (!trimmedName) {
            validationErrors.name = 'Course name is required.';
        }

        if (Object.keys(validationErrors).length > 0) {
            setCourseFormErrors(validationErrors);
            return;
        }

        setCourseSubmitting(true);

        try {
            const response = await fetch(coursesRoutes.store.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    department_id: parseInt(departmentId, 10),
                    name: trimmedName,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (response.ok && payload?.course) {
                const newCourse = payload.course as Course;

                // Add the new course to the list
                setLocalCourses((current) => sortByName([...current, newCourse]));

                // Set pending selection to be handled by useEffect
                setPendingCourseSelection({
                    courseId: newCourse.id.toString(),
                    departmentId: newCourse.department_id.toString(),
                });

                toast.success('Course added successfully.');
                handleCourseDialogChange(false, newCourse.department_id.toString());
            } else if (response.status === 422 && payload?.errors) {
                const formattedErrors: NewCourseFormErrors = {};
                Object.entries(payload.errors).forEach(([key, value]) => {
                    const message = Array.isArray(value) ? value[0] : value;
                    if (message) {
                        formattedErrors[key as keyof NewCourseFormErrors] = message as string;
                    }
                });
                setCourseFormErrors(formattedErrors);
            } else {
                toast.error('We could not add the course. Please try again.');
            }
        } catch (error) {
            toast.error('We could not add the course. Please try again.');
        } finally {
            setCourseSubmitting(false);
        }
    }

    async function handleSemesterSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        const trimmedName = semesterForm.name.trim();

        if (!trimmedName) {
            setSemesterFormErrors({ name: 'Semester name is required.' });
            return;
        }

        setSemesterSubmitting(true);

        try {
            const response = await fetch(semestersRoutes.store.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    name: trimmedName,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (response.ok && payload?.semester) {
                const newSemester = payload.semester as Semester;

                // Add the new semester to the list
                setLocalSemesters((current) => sortByName([...current, newSemester]));

                // Set pending selection to be handled by useEffect
                setPendingSemesterSelection(newSemester.id.toString());

                toast.success('Semester added successfully.');
                handleSemesterDialogChange(false);
            } else if (response.status === 422 && payload?.errors) {
                const formattedErrors: NewSemesterFormErrors = {};
                Object.entries(payload.errors).forEach(([key, value]) => {
                    const message = Array.isArray(value) ? value[0] : value;
                    if (message) {
                        formattedErrors[key as keyof NewSemesterFormErrors] = message as string;
                    }
                });
                setSemesterFormErrors(formattedErrors);
            } else {
                toast.error('We could not add the semester. Please try again.');
            }
        } catch (error) {
            toast.error('We could not add the semester. Please try again.');
        } finally {
            setSemesterSubmitting(false);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('pdf', file);
            setPdfFileName(file.name);
        }
    }

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-6">
                {/* Department and Course */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="department_id">
                            Department <span className="text-red-500">*</span>
                        </Label>
                        <FormCombobox
                            id="department_id"
                            value={data.department_id}
                            onValueChange={(value) => setData('department_id', value)}
                            options={departments}
                            placeholder="Select department"
                            searchPlaceholder="Search departments..."
                            emptyMessage="No department found."
                            error={!!errors.department_id}
                        />
                        {errors.department_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.department_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course_id">
                            Course <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <FormCombobox
                                id="course_id"
                                value={data.course_id}
                                onValueChange={(value) => setData('course_id', value)}
                                options={filteredCourses}
                                placeholder={data.department_id ? 'Select course' : 'Select department first'}
                                searchPlaceholder="Search courses..."
                                emptyMessage="No course found."
                                disabled={!data.department_id}
                                error={!!errors.course_id}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={openCourseDialog}
                                disabled={!data.department_id}
                                title={!data.department_id ? 'Select a department first' : 'Add course'}
                                className="shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.course_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.course_id}</p>}
                    </div>
                </div>

                {/* Semester and Exam Type */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="semester_id">
                            Semester <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                            <FormCombobox
                                id="semester_id"
                                value={data.semester_id}
                                onValueChange={(value) => setData('semester_id', value)}
                                options={localSemesters}
                                placeholder="Select semester"
                                searchPlaceholder="Search semesters..."
                                emptyMessage="No semester found."
                                error={!!errors.semester_id}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={openSemesterDialog}
                                title="Add semester"
                                className="shrink-0"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.semester_id && <p className="text-sm text-red-600 dark:text-red-400">{errors.semester_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="exam_type_id">
                            Exam Type <span className="text-red-500">*</span>
                        </Label>
                        <FormCombobox
                            id="exam_type_id"
                            value={data.exam_type_id}
                            onValueChange={(value) => setData('exam_type_id', value)}
                            options={examTypes}
                            placeholder="Select exam type"
                            searchPlaceholder="Search exam types..."
                            emptyMessage="No exam type found."
                            error={!!errors.exam_type_id}
                        />
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

                                {/* Display Original Question Card */}
                                {duplicateQuestion && (
                                    <div className="rounded-md bg-white p-3 dark:bg-slate-950">
                                        <h4 className="mb-3 text-sm font-semibold text-amber-900 dark:text-amber-100">Original Question:</h4>
                                        <QuestionCard question={duplicateQuestion} />
                                    </div>
                                )}

                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    If you believe this is a unique question and our detection missed it, please explain why below and submit for
                                    manual review.
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
                                        {errors.duplicate_reason && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{errors.duplicate_reason}</p>
                                        )}
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
                    <label
                        htmlFor="pdf"
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-950/20');
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-950/20');
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-950/20');
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type === 'application/pdf') {
                                setData('pdf', file);
                                setPdfFileName(file.name);
                            }
                        }}
                        className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-slate-500"
                    >
                        <div className="flex flex-col items-center justify-center gap-3 text-center">
                            <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                                <Upload className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                    {pdfFileName ? (
                                        <span className="text-slate-900 dark:text-white">{pdfFileName}</span>
                                    ) : (
                                        <>
                                            Click to upload {existingPdfUrl ? 'new file' : ''}{' '}
                                            <span className="text-slate-600 dark:text-slate-400">or drag and drop</span>
                                        </>
                                    )}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {existingPdfUrl && !pdfFileName
                                        ? 'Current file will be kept if no new file is uploaded'
                                        : 'PDF files only, max 10MB'}
                                </p>
                            </div>
                        </div>
                    </label>
                    <input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
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

            <Dialog open={courseDialogOpen} onOpenChange={(open) => handleCourseDialogChange(open)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a new course</DialogTitle>
                        <DialogDescription>Select the department and provide the course name to make it available in the list.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCourseSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-course-department">
                                Department <span className="text-red-500">*</span>
                            </Label>
                            <FormCombobox
                                id="new-course-department"
                                value={courseForm.department_id}
                                onValueChange={(value) => setCourseForm((prev) => ({ ...prev, department_id: value }))}
                                options={departments}
                                placeholder="Select department"
                                searchPlaceholder="Search departments..."
                                emptyMessage="No department found."
                                disabled={courseSubmitting}
                                error={!!courseFormErrors.department_id}
                            />
                            {courseFormErrors.department_id && (
                                <p className="text-sm text-red-600 dark:text-red-400">{courseFormErrors.department_id}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-course-name">
                                Course name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="new-course-name"
                                type="text"
                                value={courseForm.name}
                                onChange={(event) => setCourseForm((prev) => ({ ...prev, name: event.target.value }))}
                                placeholder="e.g., Data Structures"
                                aria-invalid={!!courseFormErrors.name}
                                disabled={courseSubmitting}
                            />
                            {courseFormErrors.name && <p className="text-sm text-red-600 dark:text-red-400">{courseFormErrors.name}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleCourseDialogChange(false)} disabled={courseSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={courseSubmitting}>
                                {courseSubmitting ? 'Saving...' : 'Save course'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={semesterDialogOpen} onOpenChange={handleSemesterDialogChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a new semester</DialogTitle>
                        <DialogDescription>Provide a semester name to make it selectable for future questions.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSemesterSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-semester-name">
                                Semester name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="new-semester-name"
                                type="text"
                                value={semesterForm.name}
                                onChange={(event) => setSemesterForm({ name: event.target.value })}
                                placeholder="e.g., Spring 2025"
                                aria-invalid={!!semesterFormErrors.name}
                                disabled={semesterSubmitting}
                            />
                            {semesterFormErrors.name && <p className="text-sm text-red-600 dark:text-red-400">{semesterFormErrors.name}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleSemesterDialogChange(false)} disabled={semesterSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={semesterSubmitting}>
                                {semesterSubmitting ? 'Saving...' : 'Save semester'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
