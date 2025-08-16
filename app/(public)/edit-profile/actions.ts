"use server";

import { type User } from "@/db/schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { userRepository } from "@/lib/repositories";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";
import { v4 as uuid } from "uuid";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Enhanced error handling type
type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Schema for profile update
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  // Only fields that exist in the current users table
  studentId: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

export async function getCurrentUser(): Promise<ActionResult<User>> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const user = await userRepository.findByEmail(session.user.email);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { success: false, error: "Failed to fetch user data" };
  }
}

export async function updateProfile(
  values: ProfileUpdateValues
): Promise<ActionResult> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    const validatedFields = profileUpdateSchema.parse(values);

    // Get current user
    const currentUser = await userRepository.findByEmail(session.user.email);

    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    // Check if username is taken by another user
    if (validatedFields.username !== currentUser.username) {
      const isUsernameTaken = await userRepository.isUsernameTaken(
        validatedFields.username,
        currentUser.id
      );

      if (isUsernameTaken) {
        return {
          success: false,
          error: "Username is already taken",
        };
      }
    }

    // Update user profile
    await userRepository.update(currentUser.id, {
      name: validatedFields.name,
      username: validatedFields.username,
      studentId: validatedFields.studentId ?? null,
      image: validatedFields.image ?? null,
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Please check the form for errors.",
      };
    }

    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Generate pre-signed URL for profile image upload
export async function generatePresignedUrl(
  fileType: string,
  fileSize: number
): Promise<ActionResult<{ presignedUrl: string; fileUrl: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate mime type
    if (!fileType.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" };
    }

    // Validate file size on the server
    if (fileSize > MAX_FILE_SIZE) {
      return { success: false, error: "File size exceeds the 5MB limit" };
    }

    const fileExtension = fileType.split("/")[1];
    const uniqueId = uuid();
    const key = `profile-images/${uniqueId}.${fileExtension}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ContentLength: fileSize,
    });

    const presignedUrl = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 300, // 5 minutes
    });

    const fileUrl = `${process.env.NEXT_PUBLIC_S3_DOMAIN}/${key}`;

    return {
      success: true,
      data: { presignedUrl, fileUrl },
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}
