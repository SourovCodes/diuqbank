import axios from "axios";
import { PlusIcon } from "lucide-react";
import type { FormEvent} from "react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfDropzone } from "@/components/ui/pdf-dropzone";
import type {
    ComboboxOption} from "@/components/ui/searchable-combobox";
import {
    SearchableCombobox,
} from "@/components/ui/searchable-combobox";
import type {
    Course,
    FormOptions,
    Semester,
    SubmissionFormData,
    SubmissionFormErrors,
} from "@/types";

export type { FormOptions, SubmissionFormData, SubmissionFormErrors };

interface SubmissionFormProps {
    formOptions: FormOptions;
    data: SubmissionFormData;
    setData: <K extends keyof SubmissionFormData>(
        key: K,
        value: SubmissionFormData[K]
    ) => void;
    errors: SubmissionFormErrors;
    clearErrors: (...fields: (keyof SubmissionFormData)[]) => void;
    processing: boolean;
    progress?: { percentage?: number } | null;
    onSubmit: (e: FormEvent) => void;
    submitLabel: string;
    submittingLabel: string;
    existingPdfUrl?: string | null;
    existingPdfName?: string | null;
}

export function SubmissionForm({
    formOptions,
    data,
    setData,
    errors,
    clearErrors,
    processing,
    progress,
    onSubmit,
    submitLabel,
    submittingLabel,
    existingPdfUrl,
    existingPdfName,
}: SubmissionFormProps) {
    const [localCourses, setLocalCourses] = useState<Course[]>(
        formOptions.courses
    );
    const [localSemesters, setLocalSemesters] = useState<Semester[]>(
        formOptions.semesters
    );

    // Modal states
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showSemesterModal, setShowSemesterModal] = useState(false);
    const [newCourseName, setNewCourseName] = useState("");
    const [newSemesterName, setNewSemesterName] = useState("");
    const [courseModalError, setCourseModalError] = useState("");
    const [semesterModalError, setSemesterModalError] = useState("");
    const [creatingCourse, setCreatingCourse] = useState(false);
    const [creatingSemester, setCreatingSemester] = useState(false);

    const departmentOptions: ComboboxOption[] = formOptions.departments.map(
        (dept) => ({
            value: String(dept.id),
            label: `${dept.name} (${dept.short_name})`,
        })
    );

    const courseOptions: ComboboxOption[] = useMemo(() => {
        const filtered = data.department_id
            ? localCourses.filter(
                  (c) => c.department_id === Number(data.department_id)
              )
            : localCourses;

        return filtered.map((course) => ({
            value: String(course.id),
            label: course.name,
        }));
    }, [localCourses, data.department_id]);

    const semesterOptions: ComboboxOption[] = localSemesters.map((sem) => ({
        value: String(sem.id),
        label: sem.name,
    }));

    const examTypeOptions: ComboboxOption[] = formOptions.examTypes.map(
        (type) => ({
            value: String(type.id),
            label: type.name,
        })
    );

    const selectedExamTypeRequiresSection = useMemo(() => {
        if (!data.exam_type_id) return false;
        const examType = formOptions.examTypes.find(
            (t) => String(t.id) === data.exam_type_id
        );
        return examType?.requires_section ?? false;
    }, [data.exam_type_id, formOptions.examTypes]);

    const handleDepartmentChange = (value: string) => {
        setData("department_id", value);
        setData("course_id", "");
        clearErrors("department_id", "course_id");
    };

    const handleCreateCourse = async () => {
        if (!newCourseName.trim()) return;

        setCreatingCourse(true);
        setCourseModalError("");

        try {
            const response = await axios.post("/courses", {
                name: newCourseName.trim(),
                department_id: data.department_id,
            });

            const newCourse: Course = response.data.course;
            // Only add to list if it doesn't already exist
            setLocalCourses((prev) => {
                const exists = prev.some((c) => c.id === newCourse.id);
                return exists ? prev : [...prev, newCourse];
            });
            setData("course_id", String(newCourse.id));
            setNewCourseName("");
            setShowCourseModal(false);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                setCourseModalError(
                    errors.name?.[0] || "Failed to create course"
                );
            } else {
                setCourseModalError("Failed to create course");
            }
        } finally {
            setCreatingCourse(false);
        }
    };

    const handleCreateSemester = async () => {
        if (!newSemesterName.trim()) return;

        setCreatingSemester(true);
        setSemesterModalError("");

        try {
            const response = await axios.post("/semesters", {
                name: newSemesterName.trim(),
            });

            const newSemester: Semester = response.data.semester;
            // Only add to list if it doesn't already exist
            setLocalSemesters((prev) => {
                const exists = prev.some((s) => s.id === newSemester.id);
                return exists ? prev : [...prev, newSemester];
            });
            setData("semester_id", String(newSemester.id));
            setNewSemesterName("");
            setShowSemesterModal(false);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.errors) {
                const errors = error.response.data.errors;
                setSemesterModalError(
                    errors.name?.[0] || "Failed to create semester"
                );
            } else {
                setSemesterModalError("Failed to create semester");
            }
        } finally {
            setCreatingSemester(false);
        }
    };

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <SearchableCombobox
                            options={departmentOptions}
                            value={data.department_id}
                            onChange={handleDepartmentChange}
                            placeholder="Select department..."
                            searchPlaceholder="Search departments..."
                            emptyMessage="No department found."
                            disabled={processing}
                        />
                        {errors.department_id && (
                            <p className="text-sm text-destructive">
                                {errors.department_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course">Course</Label>
                        <div className="flex gap-2">
                            <SearchableCombobox
                                options={courseOptions}
                                value={data.course_id}
                                onChange={(value) => {
                                    setData("course_id", value);
                                    clearErrors("course_id");
                                }}
                                placeholder="Select course..."
                                searchPlaceholder="Search courses..."
                                emptyMessage="No course found."
                                disabled={processing || !data.department_id}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowCourseModal(true)}
                                disabled={processing || !data.department_id}
                                title="Add new course"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.course_id && (
                            <p className="text-sm text-destructive">
                                {errors.course_id}
                            </p>
                        )}
                        {!data.department_id && (
                            <p className="text-xs text-muted-foreground">
                                Select a department first
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <div className="flex gap-2">
                            <SearchableCombobox
                                options={semesterOptions}
                                value={data.semester_id}
                                onChange={(value) => {
                                    setData("semester_id", value);
                                    clearErrors("semester_id");
                                }}
                                placeholder="Select semester..."
                                searchPlaceholder="Search semesters..."
                                emptyMessage="No semester found."
                                disabled={processing}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setShowSemesterModal(true)}
                                disabled={processing}
                                title="Add new semester"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </Button>
                        </div>
                        {errors.semester_id && (
                            <p className="text-sm text-destructive">
                                {errors.semester_id}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="exam_type">Exam Type</Label>
                        <SearchableCombobox
                            options={examTypeOptions}
                            value={data.exam_type_id}
                            onChange={(value) => {
                                setData("exam_type_id", value);
                                clearErrors("exam_type_id");
                                // Clear section if new exam type doesn't require it
                                const newExamType = formOptions.examTypes.find(
                                    (t) => String(t.id) === value
                                );
                                if (!newExamType?.requires_section) {
                                    setData("section", "");
                                    clearErrors("section");
                                }
                            }}
                            placeholder="Select exam type..."
                            searchPlaceholder="Search exam types..."
                            emptyMessage="No exam type found."
                            disabled={processing}
                        />
                        {errors.exam_type_id && (
                            <p className="text-sm text-destructive">
                                {errors.exam_type_id}
                            </p>
                        )}
                    </div>
                </div>

                {selectedExamTypeRequiresSection && (
                    <div className="space-y-2">
                        <Label htmlFor="section">
                            Section <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="section"
                            value={data.section}
                            onChange={(e) => {
                                setData("section", e.target.value);
                                clearErrors("section");
                            }}
                            placeholder="e.g., A, B, C"
                            disabled={processing}
                        />
                        {errors.section && (
                            <p className="text-sm text-destructive">
                                {errors.section}
                            </p>
                        )}
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Question Paper (PDF)</Label>
                    <PdfDropzone
                        value={data.pdf}
                        onChange={(file) => {
                            setData("pdf", file);
                            clearErrors("pdf");
                        }}
                        existingPdfUrl={existingPdfUrl}
                        existingPdfName={existingPdfName}
                        disabled={processing}
                        error={errors.pdf}
                    />
                    {errors.pdf && (
                        <p className="text-sm text-destructive">{errors.pdf}</p>
                    )}
                    {progress && progress.percentage !== undefined && (
                        <div className="space-y-1">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{
                                        width: `${progress.percentage}%`,
                                    }}
                                />
                            </div>
                            <p className="text-center text-xs text-muted-foreground">
                                Uploading... {progress.percentage}%
                            </p>
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? submittingLabel : submitLabel}
                </Button>
            </form>

            {/* Create Course Modal */}
            <Dialog
                open={showCourseModal}
                onOpenChange={(open) => {
                    setShowCourseModal(open);
                    if (!open) {
                        setNewCourseName("");
                        setCourseModalError("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Course</DialogTitle>
                        <DialogDescription>
                            Create a new course for the selected department.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-course-name">Course Name</Label>
                            <Input
                                id="new-course-name"
                                placeholder="e.g., Introduction to Programming"
                                value={newCourseName}
                                onChange={(e) => {
                                    setNewCourseName(e.target.value);
                                    setCourseModalError("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleCreateCourse();
                                    }
                                }}
                                disabled={creatingCourse}
                                autoFocus
                            />
                            {courseModalError && (
                                <p className="text-sm text-destructive">
                                    {courseModalError}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowCourseModal(false);
                                setNewCourseName("");
                                setCourseModalError("");
                            }}
                            disabled={creatingCourse}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateCourse}
                            disabled={!newCourseName.trim() || creatingCourse}
                        >
                            {creatingCourse ? "Creating..." : "Create Course"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Semester Modal */}
            <Dialog
                open={showSemesterModal}
                onOpenChange={(open) => {
                    setShowSemesterModal(open);
                    if (!open) {
                        setNewSemesterName("");
                        setSemesterModalError("");
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Semester</DialogTitle>
                        <DialogDescription>
                            Create a new semester option.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-semester-name">
                                Semester Name
                            </Label>
                            <Input
                                id="new-semester-name"
                                placeholder="e.g., Fall 26"
                                value={newSemesterName}
                                onChange={(e) => {
                                    setNewSemesterName(e.target.value);
                                    setSemesterModalError("");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleCreateSemester();
                                    }
                                }}
                                disabled={creatingSemester}
                                autoFocus
                            />
                            {semesterModalError && (
                                <p className="text-sm text-destructive">
                                    {semesterModalError}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowSemesterModal(false);
                                setNewSemesterName("");
                                setSemesterModalError("");
                            }}
                            disabled={creatingSemester}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateSemester}
                            disabled={
                                !newSemesterName.trim() || creatingSemester
                            }
                        >
                            {creatingSemester
                                ? "Creating..."
                                : "Create Semester"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
