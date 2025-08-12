import { z } from "zod";

// Schema for semester form validation
export const semesterFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(255, "Name must be less than 255 characters")
        .regex(
            /^[a-zA-Z0-9\s&()-]+$/,
            "Name can only contain letters, numbers, spaces, and &()-"
        ),
});

// Type for the semester form values
export type SemesterFormValues = z.infer<typeof semesterFormSchema>; 