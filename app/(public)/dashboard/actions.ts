"use server";

import { QuestionStatus } from "@/db/schema";
import { ok, fail, getPaginationMeta } from "@/lib/action-utils";
import { auth } from "@/lib/auth";
import { userRepository, questionRepository } from "@/lib/repositories";

export interface UserQuestion {
  id: number;
  pdfKey: string;
  pdfFileSizeInBytes: number;
  viewCount: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  departmentName: string | null;
  departmentShortName: string | null;
  courseName: string | null;
  semesterName: string | null;
  examTypeName: string | null;
}

// Get current user's questions with pagination
export async function getUserQuestions(
  page: number = 1,
  pageSize: number = 12,
  statusFilter?: string
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return fail("Not authenticated");
    }

    // Get user ID
    const user = await userRepository.findByEmail(session.user.email);
    if (!user) {
      return fail("User not found");
    }

    // Convert status filter to status key if provided
    let statusKey: keyof typeof QuestionStatus | undefined;
    if (statusFilter && statusFilter !== "all") {
      statusKey = Object.keys(QuestionStatus).find(
        key => QuestionStatus[key as keyof typeof QuestionStatus] === statusFilter
      ) as keyof typeof QuestionStatus;
    }

    const result = await questionRepository.findManyWithDetails({
      page,
      pageSize,
      userId: user.id,
      status: statusKey,
    });

    return ok({
      questions: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return fail("Not authenticated");
    }

    // Get user
    const user = await userRepository.findByEmail(session.user.email);
    if (!user) {
      return fail("User not found");
    }

    const stats = await userRepository.getUserStats(user.id);

    return ok(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return fail("Something went wrong. Please try again.");
  }
}
