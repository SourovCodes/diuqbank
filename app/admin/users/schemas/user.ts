import { z } from "zod";

// Schema for user form validation
export const userFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters")
        .regex(
            /^[a-zA-Z\s'-]+$/,
            "Name can only contain letters, spaces, apostrophes, and hyphens"
        ),
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .max(255, "Email must be less than 255 characters"),
    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be less than 50 characters")
        .regex(
            /^[a-zA-Z0-9_-]+$/,
            "Username can only contain letters, numbers, underscores, and hyphens"
        ),
    studentId: z
        .string()
        .trim()
        .transform(val => val === "" ? undefined : val)
        .refine(
            (val) => !val || /^[a-zA-Z0-9-]+$/.test(val),
            "Student ID can only contain letters, numbers, and hyphens"
        )
        .optional(),
    emailVerified: z.boolean(),
});

// Type for the user form values
export type UserFormValues = z.infer<typeof userFormSchema>;
