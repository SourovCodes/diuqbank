import { z } from "zod";

// Schema for exam type form validation
export const examTypeFormSchema = z.object({
  name: z
    .string()
    .trim() // Trim whitespace before validation
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s&()-]+$/,
      "Name can only contain letters, numbers, spaces, and &()-"
    ),
});

// Type for the exam type form values
export type ExamTypeFormValues = z.infer<typeof examTypeFormSchema>;
