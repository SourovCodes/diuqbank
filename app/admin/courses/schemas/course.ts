import { z } from "zod";

// Schema for course form validation
export const courseFormSchema = z.object({
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

// Type for the course form values
export type CourseFormValues = z.infer<typeof courseFormSchema>; 