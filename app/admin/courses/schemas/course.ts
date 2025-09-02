import { z } from "zod";

// Schema for course form validation
export const courseFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Course name must be at least 2 characters")
        .max(255, "Course name must be less than 255 characters")
        .regex(
            /^[a-zA-Z0-9\s&(),-]+$/,
            "Course name can only contain letters, numbers, spaces, and &(),-"
        ),
    departmentId: z
        .number()
        .int()
        .positive("Please select a department"),
});

// Type for the course form values
export type CourseFormValues = z.infer<typeof courseFormSchema>;
