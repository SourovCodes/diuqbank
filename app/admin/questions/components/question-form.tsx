"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
    generatePresignedUrl,
    createQuestionAdmin,
    updateQuestion,
    getDepartmentsForDropdown,
    getCoursesForDropdown,
    getSemestersForDropdown,
    getExamTypesForDropdown,
} from "../actions";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";

const questionFormSchema = z.object({
    departmentId: z.number({
        required_error: "Department is required",
    }),
    courseId: z.number({
        required_error: "Course is required",
    }),
    semesterId: z.number({
        required_error: "Semester is required",
    }),
    examTypeId: z.number({
        required_error: "Exam type is required",
    }),
    status: z.enum(["published", "duplicate", "pending review", "rejected"], {
        required_error: "Status is required",
    }),
    pdfFile: z
        .instanceof(File, { message: "PDF file is required" })
        .refine((file) => file.size > 0, "PDF file cannot be empty")
        .refine(
            (file) => file.size <= 10 * 1024 * 1024,
            "PDF file size must not exceed 10MB"
        )
        .refine((file) => file.type === "application/pdf", "File must be a PDF")
        .optional(), // Make optional for editing
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionData {
    id: number;
    departmentId: number;
    courseId: number;
    semesterId: number;
    examTypeId: number;
    status: "published" | "duplicate" | "pending review" | "rejected";
    pdfKey: string;
    pdfFileSizeInBytes: number;
}

interface QuestionFormProps {
    initialData?: QuestionData;
    isEditing?: boolean;
    questionId?: string;
}

export function QuestionForm({ initialData, isEditing = false, questionId }: QuestionFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dropdownData, setDropdownData] = useState({
        departments: [] as Array<{ id: number; name: string; shortName: string }>,
        courses: [] as Array<{ id: number; name: string }>,
        semesters: [] as Array<{ id: number; name: string }>,
        examTypes: [] as Array<{ id: number; name: string }>,
    });

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionFormSchema),
        defaultValues: {
            departmentId: initialData?.departmentId,
            courseId: initialData?.courseId,
            semesterId: initialData?.semesterId,
            examTypeId: initialData?.examTypeId,
            status: (initialData?.status as QuestionFormValues["status"]) || "published",
        },
    });

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [deptResult, courseResult, semesterResult, examTypeResult] =
                    await Promise.all([
                        getDepartmentsForDropdown(),
                        getCoursesForDropdown(),
                        getSemestersForDropdown(),
                        getExamTypesForDropdown(),
                    ]);

                setDropdownData({
                    departments: deptResult.success ? (deptResult.data || []) : [],
                    courses: courseResult.success ? (courseResult.data || []) : [],
                    semesters: semesterResult.success ? (semesterResult.data || []) : [],
                    examTypes: examTypeResult.success ? (examTypeResult.data || []) : [],
                });
            } catch (error) {
                console.error("Error loading dropdown data:", error);
                toast.error("Failed to load form data");
            }
        };

        loadDropdownData();
    }, []);

    const uploadFileToS3 = useCallback(async (file: File, presignedUrl: string) => {
        const response = await fetch(presignedUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
    }, []);

    const onSubmit = async (values: QuestionFormValues) => {
        setIsLoading(true);

        try {
            let pdfKey = initialData?.pdfKey;
            let pdfFileSizeInBytes = initialData?.pdfFileSizeInBytes;

            // If a new file is uploaded, handle the upload
            if (values.pdfFile) {
                setIsUploading(true);

                const presignedResult = await generatePresignedUrl({
                    fileName: values.pdfFile.name,
                    fileSize: values.pdfFile.size,
                    contentType: values.pdfFile.type as "application/pdf",
                });

                if (!presignedResult.success || !presignedResult.data) {
                    toast.error(
                        typeof presignedResult.error === "string"
                            ? presignedResult.error
                            : "Failed to prepare file upload"
                    );
                    return;
                }

                await uploadFileToS3(values.pdfFile, presignedResult.data.presignedUrl);
                pdfKey = presignedResult.data.pdfKey;
                pdfFileSizeInBytes = values.pdfFile.size;
                setIsUploading(false);
            }

            let response;
            if (isEditing && questionId) {
                response = await updateQuestion(questionId, {
                    departmentId: values.departmentId,
                    courseId: values.courseId,
                    semesterId: values.semesterId,
                    examTypeId: values.examTypeId,
                    status: values.status,
                    ...(values.pdfFile && { pdfKey, pdfFileSizeInBytes }),
                });
            } else {
                if (!pdfKey || !pdfFileSizeInBytes) {
                    toast.error("PDF file is required for new questions");
                    return;
                }
                response = await createQuestionAdmin({
                    departmentId: values.departmentId,
                    courseId: values.courseId,
                    semesterId: values.semesterId,
                    examTypeId: values.examTypeId,
                    status: values.status,
                    pdfKey,
                    pdfFileSizeInBytes,
                });
            }

            if (response.success) {
                toast.success(
                    isEditing
                        ? "Question updated successfully!"
                        : "Question created successfully!"
                );
                router.push("/admin/questions");
            } else {
                toast.error(response.error || `Failed to ${isEditing ? 'update' : 'create'} question`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, onChange: (file: File | undefined) => void) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Validate file type and size
            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are allowed");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must not exceed 10MB");
                return;
            }

            onChange(file);
        }
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEditing ? "Edit Question" : "Create New Question"}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dropdownData.departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.id.toString()}
                                                    >
                                                        {dept.name} ({dept.shortName})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="courseId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Course</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select course" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dropdownData.courses.map((course) => (
                                                    <SelectItem
                                                        key={course.id}
                                                        value={course.id.toString()}
                                                    >
                                                        {course.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="semesterId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Semester</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select semester" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dropdownData.semesters.map((semester) => (
                                                    <SelectItem
                                                        key={semester.id}
                                                        value={semester.id.toString()}
                                                    >
                                                        {semester.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="examTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Exam Type</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select exam type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {dropdownData.examTypes.map((examType) => (
                                                    <SelectItem
                                                        key={examType.id}
                                                        value={examType.id.toString()}
                                                    >
                                                        {examType.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full md:w-[200px]">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="pending review">Pending Review</SelectItem>
                                            <SelectItem value="duplicate">Duplicate</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="pdfFile"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>PDF File</FormLabel>
                                    <FormControl>
                                        <div className="space-y-4">
                                            {isEditing && initialData?.pdfKey && !value && (
                                                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border">
                                                    <FileText className="w-5 h-5 text-green-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-green-900">
                                                            Current PDF: {initialData.pdfKey.split('/').pop()}
                                                        </p>
                                                        <p className="text-xs text-green-600">
                                                            {formatFileSize(initialData.pdfFileSizeInBytes)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`${process.env.NEXT_PUBLIC_S3_DOMAIN}/${initialData.pdfKey}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                            <div
                                                className="flex items-center justify-center w-full"
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={(e) => handleDrop(e, onChange)}
                                            >
                                                <label
                                                    htmlFor="pdf-upload"
                                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className={`w-8 h-8 mb-2 ${isDragOver ? "text-blue-500" : "text-gray-500"}`} />
                                                        <p className={`mb-2 text-sm ${isDragOver ? "text-blue-600" : "text-gray-500"}`}>
                                                            <span className="font-semibold">
                                                                {isDragOver
                                                                    ? "Drop PDF file here"
                                                                    : isEditing
                                                                        ? "Click to replace PDF"
                                                                        : "Click to upload"
                                                                }
                                                            </span>
                                                            {!isDragOver && " or drag and drop"}
                                                        </p>
                                                        <p className={`text-xs ${isDragOver ? "text-blue-500" : "text-gray-500"}`}>
                                                            PDF files only (Max 10MB)
                                                        </p>
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        id="pdf-upload"
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Validate file type and size (same validation as drag & drop)
                                                                if (file.type !== "application/pdf") {
                                                                    toast.error("Only PDF files are allowed");
                                                                    e.target.value = ""; // Clear the input
                                                                    return;
                                                                }

                                                                if (file.size > 10 * 1024 * 1024) {
                                                                    toast.error("File size must not exceed 10MB");
                                                                    e.target.value = ""; // Clear the input
                                                                    return;
                                                                }

                                                                onChange(file);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            {value && (
                                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                                                    <FileText className="w-5 h-5 text-blue-600" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-blue-900">
                                                            {value.name}
                                                        </p>
                                                        <p className="text-xs text-blue-600">
                                                            {formatFileSize(value.size)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onChange(undefined)}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        {isEditing
                                            ? "Upload a new PDF file to replace the current one. Leave empty to keep the existing file."
                                            : "Upload a PDF file containing the question paper. Maximum file size is 10MB."
                                        }
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/admin/questions")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading
                                    ? isUploading
                                        ? "Uploading..."
                                        : "Saving..."
                                    : isEditing
                                        ? "Update Question"
                                        : "Create Question"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

