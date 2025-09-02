import { z } from "zod";

// Schema for semester form validation
export const semesterFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Semester name must be at least 2 characters")
        .max(10, "Semester name must be less than 10 characters")
        .regex(
            /^[a-zA-Z0-9\s]+$/,
            "Semester name can only contain letters, numbers, and spaces"
        ),
    order: z
        .number()
        .int()
        .min(0, "Order must be 0 or greater")
        .max(999, "Order must be less than 1000"),
});

// Type for the semester form values
export type SemesterFormValues = z.infer<typeof semesterFormSchema>;
