import { z } from "zod";
import { QuestionStatus } from "@/db/schema";

// Shared constants for question PDF validation
export const MAX_PDF_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const PDF_MIME_TYPE = "application/pdf" as const;

// Base schema for question form validation
const baseQuestionFormSchema = z.object({
  departmentId: z.coerce
    .number({ message: "Department is required" })
    .min(1, "Department is required"),
  courseId: z.coerce
    .number({ message: "Course is required" })
    .min(1, "Course is required"),
  semesterId: z.coerce
    .number({ message: "Semester is required" })
    .min(1, "Semester is required"),
  examTypeId: z.coerce
    .number({ message: "Exam type is required" })
    .min(1, "Exam type is required"),
  section: z
    .string()
    .max(5, "Section must be at most 5 characters")
    .regex(/^[0-9]+_[A-Z]$/, "Section must be in format like '65_N' or '54_F' (number_letter)")
    .or(z.literal(""))
    .optional(),
  userId: z.string({ message: "User is required" }).min(1, "User is required"),
  status: z.enum(QuestionStatus),
  statusReason: z
    .string()
    .max(1000, "Reason must be at most 1000 characters")
    .optional(),
  pdfFile: z
    .instanceof(File, { message: "PDF file is required" })
    .refine((file) => file.size > 0, "PDF file cannot be empty")
    .refine(
      (file) => file.size <= MAX_PDF_FILE_SIZE_BYTES,
      "PDF file size must not exceed 10MB"
    )
    .refine((file) => file.type === PDF_MIME_TYPE, "File must be a PDF")
    .optional(), // Optional for edit forms
});

// Function to create schema with conditional section validation
export const createQuestionFormSchema = (examTypes: Array<{ id: number, requiresSection: boolean }>) => {
  return baseQuestionFormSchema.superRefine((data, ctx) => {
    const selectedExamType = examTypes.find(et => et.id === data.examTypeId);
    if (selectedExamType?.requiresSection) {
      if (!data.section || data.section.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Section is required for this exam type",
          path: ["section"],
        });
      }
    }
  });
};

// Default schema for backward compatibility
export const questionFormSchema = baseQuestionFormSchema;

// Schema for editing without file requirement
export const questionEditFormSchema = questionFormSchema
  .omit({ pdfFile: true })
  .extend({
    pdfFile: z
      .instanceof(File)
      .refine((file) => file.size > 0, "PDF file cannot be empty")
      .refine(
        (file) => file.size <= MAX_PDF_FILE_SIZE_BYTES,
        "PDF file size must not exceed 10MB"
      )
      .refine((file) => file.type === PDF_MIME_TYPE, "File must be a PDF")
      .optional(),
  });

// Schema for presigned URL request
export const presignedUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size must be greater than 0"),
  contentType: z.literal(PDF_MIME_TYPE),
});

// Type for the question form values
export type QuestionFormValues = z.infer<typeof questionFormSchema>;
export type QuestionEditFormValues = z.infer<typeof questionEditFormSchema>;
export type PresignedUrlRequest = z.infer<typeof presignedUrlSchema>;
export type { QuestionStatus } from "@/db/schema";
