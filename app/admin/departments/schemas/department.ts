import { z } from "zod";

// Schema for department form validation
export const departmentFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(255, "Name must be less than 255 characters")
        .regex(
            /^[a-zA-Z0-9\s&()-]+$/,
            "Name can only contain letters, numbers, spaces, and &()-"
        ),
    shortName: z
        .string()
        .trim()
        .min(2, "Short name must be at least 2 characters")
        .max(50, "Short name must be less than 50 characters")
        .regex(
            /^[A-Z0-9]+$/,
            "Short name can only contain uppercase letters and numbers"
        ),
});

// Type for the department form values
export type DepartmentFormValues = z.infer<typeof departmentFormSchema>; 