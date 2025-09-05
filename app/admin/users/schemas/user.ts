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
    emailVerified: z
        .boolean()
        .default(false),
});

// Type for the user form values
export type UserFormValues = z.infer<typeof userFormSchema>;
