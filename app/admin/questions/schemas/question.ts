import { z } from "zod";

// Schema for question form validation
export const questionFormSchema = z.object({
    departmentId: z
        .number({
            required_error: "Department is required",
            invalid_type_error: "Department must be selected",
        })
        .min(1, "Department is required"),
    courseId: z
        .number({
            required_error: "Course is required",
            invalid_type_error: "Course must be selected",
        })
        .min(1, "Course is required"),
    semesterId: z
        .number({
            required_error: "Semester is required",
            invalid_type_error: "Semester must be selected",
        })
        .min(1, "Semester is required"),
    examTypeId: z
        .number({
            required_error: "Exam type is required",
            invalid_type_error: "Exam type must be selected",
        })
        .min(1, "Exam type is required"),
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
        .optional(), // Optional for edit forms
});

// Schema for editing without file requirement
export const questionEditFormSchema = questionFormSchema.omit({ pdfFile: true }).extend({
    pdfFile: z
        .instanceof(File)
        .refine((file) => file.size > 0, "PDF file cannot be empty")
        .refine(
            (file) => file.size <= 10 * 1024 * 1024,
            "PDF file size must not exceed 10MB"
        )
        .refine((file) => file.type === "application/pdf", "File must be a PDF")
        .optional(),
});

// Schema for presigned URL request
export const presignedUrlSchema = z.object({
    fileName: z.string().min(1, "File name is required"),
    fileSize: z.number().min(1, "File size must be greater than 0"),
    contentType: z.literal("application/pdf", {
        errorMap: () => ({ message: "Only PDF files are allowed" }),
    }),
});

// Type for the question form values
export type QuestionFormValues = z.infer<typeof questionFormSchema>;
export type QuestionEditFormValues = z.infer<typeof questionEditFormSchema>;
export type PresignedUrlRequest = z.infer<typeof presignedUrlSchema>; 