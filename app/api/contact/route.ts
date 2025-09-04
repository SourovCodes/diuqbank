import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createContactSubmission } from "@/app/admin/contact-submissions/actions";

// Contact form validation schema
const contactFormSchema = z.object({
    name: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    email: z.string()
        .min(1, "Email is required")
        .email("Please enter a valid email address")
        .max(255, "Email must be less than 255 characters")
        .toLowerCase()
        .trim(),
    subject: z.string()
        .min(1, "Subject is required")
        .max(255, "Subject must be less than 255 characters")
        .trim(),
    message: z.string()
        .min(1, "Message is required")
        .min(10, "Message must be at least 10 characters long")
        .max(5000, "Message must be less than 5000 characters")
        .trim(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate the request body
        const validationResult = contactFormSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const { name, email, subject, message } = validationResult.data;

        // Create the contact submission
        const result = await createContactSubmission({
            name,
            email,
            subject,
            message,
        });

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || "Failed to submit contact form",
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Contact form submitted successfully",
                data: {
                    id: result.data?.id,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error processing contact form:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}

export async function PUT() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
    );
}
