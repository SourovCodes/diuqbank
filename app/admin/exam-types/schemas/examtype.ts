import { z } from "zod";

// Schema for exam type form validation
export const examTypeFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Exam type name must be at least 2 characters")
        .max(10, "Exam type name must be less than 10 characters")
        .regex(
            /^[a-zA-Z0-9\s]+$/,
            "Exam type name can only contain letters, numbers, and spaces"
        ),
    requiresSection: z
        .boolean()
        .default(false),
    order: z
        .number()
        .int()
        .min(0, "Order must be 0 or greater")
        .max(999, "Order must be less than 1000"),
});

// Type for the exam type form values
export type ExamTypeFormValues = z.infer<typeof examTypeFormSchema>;
