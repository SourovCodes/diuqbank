import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/layouts/main-layout';
import questionsRoutes from '@/routes/questions';
import type { SharedData } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

    const [pdfFileName, setPdfFileName] = useState<string>('');

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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(questionsRoutes.store.url());
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setData('pdf', file);
            setPdfFileName(file.name);
        }
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
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        placeholder="Enter section (e.g., A, B, C)"
                                        aria-invalid={!!errors.section}
                                        className="max-w-xs"
                                    />
                                    {errors.section && <p className="text-sm text-red-600 dark:text-red-400">{errors.section}</p>}
                                </div>
                            )}

                            {/* PDF Upload */}
                            <div className="space-y-3">
                                <Label htmlFor="pdf">
                                    Question Paper (PDF) <span className="text-red-500">*</span>
                                </Label>
                                <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition-colors hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                                        <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                                            <Upload className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="pdf" className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                                {pdfFileName ? (
                                                    <span className="text-slate-900 dark:text-white">{pdfFileName}</span>
                                                ) : (
                                                    <>
                                                        Click to upload <span className="text-slate-600 dark:text-slate-400">or drag and drop</span>
                                                    </>
                                                )}
                                            </label>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">PDF files only, max 10MB</p>
                                        </div>
                                        <input id="pdf" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                                    </div>
                                </div>
                                {errors.pdf && <p className="text-sm text-red-600 dark:text-red-400">{errors.pdf}</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <a href={questionsRoutes.index.url()}>Cancel</a>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Question'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
