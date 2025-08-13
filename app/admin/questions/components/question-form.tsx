"use client";

import { useState, useCallback } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  questionFormSchema,
  type QuestionFormValues,
  type QuestionStatus,
  MAX_PDF_FILE_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "../schemas/question";

import {
  generatePresignedUrl,
  createQuestionAdmin,
  updateQuestion,
} from "../actions";
import { createCourse } from "../../courses/actions";
import { createSemester } from "../../semesters/actions";

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
import { questionStatusEnum } from "@/db/schema";
import { DropdownWithAdd } from "@/components/admin/dropdown-with-add";

// Schema and types are imported from ../schemas/question to avoid duplication

type DepartmentOption = {
  id: number;
  name: string;
  shortName: string;
  questionCount?: number;
};
type BasicOption = { id: number; name: string; questionCount?: number };

interface QuestionData {
  id: number;
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  status: QuestionStatus;
  pdfKey: string;
  pdfFileSizeInBytes: number;
}

interface QuestionFormProps {
  initialData?: QuestionData;
  isEditing?: boolean;
  questionId?: string;
  dropdowns: {
    departments: DepartmentOption[];
    courses: BasicOption[];
    semesters: BasicOption[];
    examTypes: BasicOption[];
  };
}

export function QuestionForm({
  initialData,
  isEditing = false,
  questionId,
  dropdowns,
}: QuestionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(
      questionFormSchema
    ) as unknown as Resolver<QuestionFormValues>,
    defaultValues: {
      departmentId: initialData?.departmentId,
      courseId: initialData?.courseId,
      semesterId: initialData?.semesterId,
      examTypeId: initialData?.examTypeId,
      status:
        (initialData?.status as QuestionFormValues["status"]) || "published",
    },
  });

  const uploadFileToS3 = useCallback(
    async (file: File, presignedUrl: string) => {
      const response = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    },
    []
  );

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
          contentType: values.pdfFile.type as typeof PDF_MIME_TYPE,
        });

        if (!presignedResult.success || !presignedResult.data) {
          const err = !presignedResult.success
            ? presignedResult.error
            : undefined;
          toast.error(
            typeof err === "string" ? err : "Failed to prepare file upload"
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
        const err = response.error as unknown;
        let message = `Failed to ${isEditing ? "update" : "create"} question`;
        if (typeof err === "string") {
          message = err;
        } else if (err && typeof err === "object") {
          const parts = Object.entries(err as Record<string, string[]>).map(
            ([field, msgs]) => `${field}: ${msgs?.[0] ?? "Invalid"}`
          );
          if (parts.length > 0) message = parts.join("; ");
        }
        toast.error(message);
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

  const handleDrop = useCallback(
    (e: React.DragEvent, onChange: (file: File | undefined) => void) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];

        // Validate file type and size
        if (file.type !== PDF_MIME_TYPE) {
          toast.error("Only PDF files are allowed");
          return;
        }

        if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
          toast.error("File size must not exceed 10MB");
          return;
        }

        onChange(file);
      }
    },
    []
  );

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
                        {dropdowns.departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name} ({dept.shortName})
                            {dept.questionCount !== undefined
                              ? ` - ${dept.questionCount} question${
                                  dept.questionCount !== 1 ? "s" : ""
                                }`
                              : ""}
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
                    <FormControl>
                      <DropdownWithAdd
                        label="Course"
                        placeholder="Select course"
                        options={dropdowns.courses}
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          field.onChange(parseInt(value));
                        }}
                        onAddNew={async (name) => {
                          try {
                            const result = await createCourse({ name });
                            if (result.success && result.data) {
                              return {
                                success: true,
                                data: {
                                  id: result.data.id,
                                  name: result.data.name,
                                  questionCount: 0,
                                },
                              };
                            }
                            let errorMessage = "Failed to create course";
                            if (!result.success) {
                              if (typeof result.error === "string") {
                                errorMessage = result.error;
                              } else if (
                                result.error &&
                                typeof result.error === "object"
                              ) {
                                const firstError = Object.values(
                                  result.error
                                )[0];
                                errorMessage = Array.isArray(firstError)
                                  ? firstError[0]
                                  : "Failed to create course";
                              }
                            }
                            return {
                              success: false,
                              error: errorMessage,
                            };
                          } catch (err) {
                            console.error("Error creating course:", err);
                            return {
                              success: false,
                              error: "Something went wrong. Please try again.",
                            };
                          }
                        }}
                        addDialogTitle="Create New Course"
                        addDialogDescription="Add a new course to the system."
                        disabled={isLoading}
                      />
                    </FormControl>
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
                    <FormControl>
                      <DropdownWithAdd
                        label="Semester"
                        placeholder="Select semester"
                        options={dropdowns.semesters}
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        onAddNew={async (name) => {
                          try {
                            const result = await createSemester({ name });
                            if (result.success && result.data) {
                              return {
                                success: true,
                                data: {
                                  id: result.data.id,
                                  name: result.data.name,
                                  questionCount: 0,
                                },
                              };
                            }
                            let errorMessage = "Failed to create semester";
                            if (!result.success) {
                              if (typeof result.error === "string") {
                                errorMessage = result.error;
                              } else if (
                                result.error &&
                                typeof result.error === "object"
                              ) {
                                const firstError = Object.values(
                                  result.error
                                )[0];
                                errorMessage = Array.isArray(firstError)
                                  ? firstError[0]
                                  : "Failed to create semester";
                              }
                            }
                            return {
                              success: false,
                              error: errorMessage,
                            };
                          } catch (err) {
                            console.error("Error creating semester:", err);
                            return {
                              success: false,
                              error: "Something went wrong. Please try again.",
                            };
                          }
                        }}
                        addDialogTitle="Create New Semester"
                        addDialogDescription="Add a new semester to the system."
                        disabled={isLoading}
                      />
                    </FormControl>
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
                        {dropdowns.examTypes.map((examType) => (
                          <SelectItem
                            key={examType.id}
                            value={examType.id.toString()}
                          >
                            {examType.name}
                            {examType.questionCount !== undefined
                              ? ` (${examType.questionCount} question${
                                  examType.questionCount !== 1 ? "s" : ""
                                })`
                              : ""}
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
                      {questionStatusEnum.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value === "pending review"
                            ? "Pending Review"
                            : value.charAt(0).toUpperCase() + value.slice(1)}
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
                              Current PDF: {initialData.pdfKey.split("/").pop()}
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
                          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isDragOver
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload
                              className={`w-8 h-8 mb-2 ${
                                isDragOver ? "text-blue-500" : "text-gray-500"
                              }`}
                            />
                            <p
                              className={`mb-2 text-sm ${
                                isDragOver ? "text-blue-600" : "text-gray-500"
                              }`}
                            >
                              <span className="font-semibold">
                                {isDragOver
                                  ? "Drop PDF file here"
                                  : isEditing
                                  ? "Click to replace PDF"
                                  : "Click to upload"}
                              </span>
                              {!isDragOver && " or drag and drop"}
                            </p>
                            <p
                              className={`text-xs ${
                                isDragOver ? "text-blue-500" : "text-gray-500"
                              }`}
                            >
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
                                if (file.type !== PDF_MIME_TYPE) {
                                  toast.error("Only PDF files are allowed");
                                  e.target.value = ""; // Clear the input
                                  return;
                                }

                                if (file.size > MAX_PDF_FILE_SIZE_BYTES) {
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
                      : "Upload a PDF file containing the question paper. Maximum file size is 10MB."}
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
