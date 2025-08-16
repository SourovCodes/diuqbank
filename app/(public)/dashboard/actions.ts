"use server";

import { db } from "@/db/drizzle";
import {
  departments,
  courses,
  semesters,
  examTypes,
  questions,
  users,
  QuestionStatus,
} from "@/db/schema";
import { desc, eq, and, count, sum } from "drizzle-orm";
import { ok, fail, getPaginationMeta } from "@/lib/action-utils";
import { auth } from "@/lib/auth";

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
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userResult.length === 0) {
      return fail("User not found");
    }

    const userId = userResult[0].id;
    const skip = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [eq(questions.userId, userId)];
    
    if (statusFilter && statusFilter !== "all") {
      whereConditions.push(eq(questions.status, statusFilter as typeof QuestionStatus[keyof typeof QuestionStatus]));
    }

    const [questionsResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: questions.id,
          pdfKey: questions.pdfKey,
          pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
          viewCount: questions.viewCount,
          status: questions.status,
          createdAt: questions.createdAt,
          updatedAt: questions.updatedAt,
          departmentName: departments.name,
          departmentShortName: departments.shortName,
          courseName: courses.name,
          semesterName: semesters.name,
          examTypeName: examTypes.name,
        })
        .from(questions)
        .leftJoin(departments, eq(questions.departmentId, departments.id))
        .leftJoin(courses, eq(questions.courseId, courses.id))
        .leftJoin(semesters, eq(questions.semesterId, semesters.id))
        .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
        .where(and(...whereConditions))
        .orderBy(desc(questions.createdAt))
        .limit(pageSize)
        .offset(skip),

      db
        .select({ count: count() })
        .from(questions)
        .where(and(...whereConditions)),
    ]);

    const totalCount = totalCountResult[0].count;

    return ok({
      questions: questionsResult,
      pagination: getPaginationMeta(totalCount, page, pageSize),
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

    // Get user ID
    const userResult = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    if (userResult.length === 0) {
      return fail("User not found");
    }

    const userId = userResult[0].id;

    const stats = await Promise.all([
      // Total questions
      db
        .select({ count: count() })
        .from(questions)
        .where(eq(questions.userId, userId)),
      
      // Published questions
      db
        .select({ count: count() })
        .from(questions)
        .where(and(
          eq(questions.userId, userId),
          eq(questions.status, QuestionStatus.PUBLISHED)
        )),
      
      // Pending questions
      db
        .select({ count: count() })
        .from(questions)
        .where(and(
          eq(questions.userId, userId),
          eq(questions.status, QuestionStatus.PENDING_REVIEW)
        )),
      
      // Total views
      db
        .select({ 
          totalViews: sum(questions.viewCount)
        })
        .from(questions)
        .where(and(
          eq(questions.userId, userId),
          eq(questions.status, QuestionStatus.PUBLISHED)
        )),
    ]);

    return ok({
      totalQuestions: stats[0][0].count,
      publishedQuestions: stats[1][0].count,
      pendingQuestions: stats[2][0].count,
      totalViews: Number(stats[3][0].totalViews) || 0,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return fail("Something went wrong. Please try again.");
  }
}
