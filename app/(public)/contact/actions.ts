"use server";

import { z } from "zod";
import { type ActionResult, ok, fail, fromZodError } from "@/lib/action-utils";
import { contactFormSubmissionRepository } from "@/lib/repositories";

// Contact form validation schema
const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof ContactFormSchema>;

export async function submitContactForm(
  formData: ContactFormValues
): Promise<ActionResult> {
  try {
    // Validate the form data
    const validatedData = ContactFormSchema.parse(formData);

    // Save to database using repository
    await contactFormSubmissionRepository.submit({
      name: validatedData.name,
      email: validatedData.email,
      message: validatedData.message,
    });

    return ok();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fromZodError(error);
    }

    console.error("Contact form submission error:", error);
    return fail("Failed to send message. Please try again later.");
  }
}
