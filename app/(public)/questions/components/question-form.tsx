"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  questionFormSchema,
  type QuestionFormValues,
  MAX_PDF_FILE_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "../schemas/question";

import {
  generatePresignedUrlPublic,
  createQuestionPublic,
  updateQuestionPublic,
  getDepartmentsForDropdownPublic,
  getCoursesForDropdownPublic,
  getSemestersForDropdownPublic,
  getExamTypesForDropdownPublic,
  createCoursePublic,
  createSemesterPublic,
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
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { DropdownWithAdd } from "@/components/admin/dropdown-with-add";

type DepartmentOption = {
  id: number;
  name: string;
};
type BasicOption = { id: number; name: string };

interface QuestionData {
  id: number;
  userId: string;
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  status: string;
  pdfKey: string;
  pdfFileSizeInBytes: number;
}

interface QuestionFormProps {
  initialData?: QuestionData;
  isEditing?: boolean;
  questionId?: string;
}

export function QuestionForm({
  initialData,
  isEditing = false,
  questionId,
}: QuestionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dropdown data state
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [courses, setCourses] = useState<BasicOption[]>([]);
  const [semesters, setSemesters] = useState<BasicOption[]>([]);
  const [examTypes, setExamTypes] = useState<BasicOption[]>([]);
  const [, setLoadingDropdowns] = useState(true);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(
      questionFormSchema
    ) as unknown as Resolver<QuestionFormValues>,
    defaultValues: {
      departmentId: initialData?.departmentId,
      courseId: initialData?.courseId,
      semesterId: initialData?.semesterId,
      examTypeId: initialData?.examTypeId,
    },
  });

  // Watch for department changes to filter courses
  const selectedDepartmentId = form.watch("departmentId");
  const isFirstDeptWatch = useRef(true);
  // Remember the last selected course for each department to restore when switching back
  const lastCourseByDeptRef = useRef<Map<number, number>>(new Map());

  // Load initial dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingDropdowns(true);
      try {
        const [deptResult, semesterResult, examTypeResult] = await Promise.all([
          getDepartmentsForDropdownPublic(),
          getSemestersForDropdownPublic(),
          getExamTypesForDropdownPublic(),
        ]);

        if (deptResult.success) {
          setDepartments(deptResult.data || []);
        }
        if (semesterResult.success) {
          setSemesters(semesterResult.data || []);
        }
        if (examTypeResult.success) {
          setExamTypes(examTypeResult.data || []);
        }
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load dropdown data");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, []);

  // Initialize last selected course for the initial department (edit mode)
  useEffect(() => {
    if (initialData?.departmentId && initialData?.courseId) {
      lastCourseByDeptRef.current.set(
        initialData.departmentId,
        initialData.courseId
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load courses when department changes and keep course selection in sync
  useEffect(() => {
    const loadCourses = async () => {
      // On first render we don't want to forcibly clear the course value
      const isInitial = isFirstDeptWatch.current;
      if (isInitial) {
        isFirstDeptWatch.current = false;
      }

      if (selectedDepartmentId) {
        try {
          const courseResult = await getCoursesForDropdownPublic(
            selectedDepartmentId
          );
          if (courseResult.success) {
            const newCourses = courseResult.data || [];
            setCourses(newCourses);

            // Try to restore last selected course for this department
            const remembered =
              lastCourseByDeptRef.current.get(selectedDepartmentId);
            const currentFormValue = form.getValues("courseId");

            // If the current form value is not valid for this department, adjust it
            const isCurrentValid = newCourses.some(
              (c) => c.id === currentFormValue
            );

            if (!isCurrentValid) {
              if (remembered && newCourses.some((c) => c.id === remembered)) {
                // Restore remembered selection for this department
                form.setValue("courseId", remembered, {
                  shouldValidate: false,
                  shouldDirty: !isInitial, // don't dirty on initial load
                  shouldTouch: !isInitial,
                });
              } else {
                // Clear selection if nothing valid to select
                form.setValue("courseId", undefined as unknown as number, {
                  shouldValidate: false,
                  shouldDirty: !isInitial,
                  shouldTouch: !isInitial,
                });
              }
            }
          }
        } catch (error) {
          console.error("Error loading courses:", error);
          toast.error("Failed to load courses");
          setCourses([]);
        }
      } else {
        setCourses([]);
        // Clear course when no department selected
        form.setValue("courseId", undefined as unknown as number, {
          shouldValidate: false,
          shouldDirty: !isInitial,
          shouldTouch: !isInitial,
        });
      }
    };

    loadCourses();
  }, [selectedDepartmentId, form]);

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

        const presignedResult = await generatePresignedUrlPublic({
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
        response = await updateQuestionPublic(questionId, {
          departmentId: values.departmentId,
          courseId: values.courseId,
          semesterId: values.semesterId,
          examTypeId: values.examTypeId,
          ...(values.pdfFile && { pdfKey, pdfFileSizeInBytes }),
        });
      } else {
        if (!pdfKey || !pdfFileSizeInBytes) {
          toast.error("PDF file is required for new questions");
          return;
        }
        response = await createQuestionPublic({
          departmentId: values.departmentId,
          courseId: values.courseId,
          semesterId: values.semesterId,
          examTypeId: values.examTypeId,
          pdfKey,
          pdfFileSizeInBytes,
        });
      }

      if (response.success) {
        toast.success(
          isEditing
            ? "Question updated successfully! It will be reviewed before publishing."
            : "Question submitted successfully! It will be reviewed before publishing."
        );
        router.push("/questions");
      } else {
        const err = response.error as unknown;
        let message = `Failed to ${isEditing ? "update" : "submit"} question`;
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
    <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md">
      <CardContent className="p-4 sm:p-6 lg:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
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
                        placeholder={
                          !selectedDepartmentId
                            ? "Select department first"
                            : "Select course"
                        }
                        options={courses}
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          const parsed = parseInt(value);
                          field.onChange(parsed);
                          // Remember the last picked course for this department
                          const deptId = form.getValues("departmentId");
                          if (deptId) {
                            lastCourseByDeptRef.current.set(deptId, parsed);
                          }
                        }}
                        disabled={!selectedDepartmentId || isLoading}
                        onAddNew={async (name) => {
                          try {
                            const departmentId = form.getValues("departmentId");
                            if (!departmentId) {
                              return {
                                success: false,
                                error: "Please select a department first",
                              };
                            }
                            const result = await createCoursePublic({
                              name,
                              departmentId,
                            });
                            if (result.success && result.data) {
                              return {
                                success: true,
                                data: {
                                  id: result.data.id,
                                  name: result.data.name,
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
                        options={semesters}
                        value={field.value?.toString()}
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        onAddNew={async (name) => {
                          try {
                            const result = await createSemesterPublic({ name });
                            if (result.success && result.data) {
                              return {
                                success: true,
                                data: {
                                  id: result.data.id,
                                  name: result.data.name,
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
                        {examTypes.map((examType) => (
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
              name="pdfFile"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>PDF File</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      {isEditing && initialData?.pdfKey && !value && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                              Current PDF: {initialData.pdfKey.split("/").pop()}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-300">
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
                          className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isDragOver
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload
                              className={`w-8 h-8 mb-2 ${
                                isDragOver ? "text-blue-500" : "text-slate-500"
                              }`}
                            />
                            <p
                              className={`mb-2 text-sm ${
                                isDragOver ? "text-blue-600" : "text-slate-500 dark:text-slate-400"
                              } text-center`}
                            >
                              <span className="font-semibold">
                                {isDragOver
                                  ? "Drop PDF file here"
                                  : isEditing
                                  ? "Click to replace PDF"
                                  : "Click to upload"}
                              </span>
                              {!isDragOver && (
                                <span className="hidden sm:inline"> or drag and drop</span>
                              )}
                            </p>
                            <p
                              className={`text-xs ${
                                isDragOver ? "text-blue-500" : "text-slate-500 dark:text-slate-400"
                              } text-center`}
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
                        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {value.name}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-300">
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

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/questions")}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading
                  ? isUploading
                    ? "Uploading..."
                    : "Saving..."
                  : isEditing
                  ? "Update Question"
                  : "Submit Question"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
