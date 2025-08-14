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
import { sql, desc, eq, and, count } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { ok, fail, getPaginationMeta } from "@/lib/action-utils";

export interface PublicQuestion {
  id: number;
  pdfKey: string;
  pdfFileSizeInBytes: number;
  viewCount: number;
  createdAt: Date;
  departmentName: string | null;
  departmentShortName: string | null;
  courseName: string | null;
  semesterName: string | null;
  examTypeName: string | null;
  userName: string | null;
}

export interface FilterOptions {
  departments: Array<{ id: number; name: string; shortName: string }>;
  courses: Array<{ id: number; name: string; departmentId: number }>;
  semesters: Array<{ id: number; name: string }>;
  examTypes: Array<{ id: number; name: string }>;
}

// Get filter options for the dropdowns
export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    const [departmentsResult, coursesResult, semestersResult, examTypesResult] = 
      await Promise.all([
        db
          .select({
            id: departments.id,
            name: departments.name,
            shortName: departments.shortName,
          })
          .from(departments)
          .orderBy(departments.name),

        db
          .select({
            id: courses.id,
            name: courses.name,
            departmentId: courses.departmentId,
          })
          .from(courses)
          .orderBy(courses.name),

        db
          .select({
            id: semesters.id,
            name: semesters.name,
          })
          .from(semesters)
          .orderBy(semesters.name),

        db
          .select({
            id: examTypes.id,
            name: examTypes.name,
          })
          .from(examTypes)
          .orderBy(examTypes.name),
      ]);

    return {
      departments: departmentsResult,
      courses: coursesResult,
      semesters: semestersResult,
      examTypes: examTypesResult,
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      departments: [],
      courses: [],
      semesters: [],
      examTypes: [],
    };
  }
}

// Get paginated published questions with filtering
export async function getPublicQuestions(
  page: number = 1,
  pageSize: number = 12,
  departmentId?: number,
  courseId?: number,
  semesterId?: number,
  examTypeId?: number
) {
  try {
    const skip = (page - 1) * pageSize;
    const whereConditions: SQL<unknown>[] = [eq(questions.status, QuestionStatus.PUBLISHED) as unknown as SQL<unknown>];

    if (departmentId) {
      whereConditions.push(eq(questions.departmentId, departmentId) as unknown as SQL<unknown>);
    }

    if (courseId) {
      whereConditions.push(eq(questions.courseId, courseId) as unknown as SQL<unknown>);
    }

    if (semesterId) {
      whereConditions.push(eq(questions.semesterId, semesterId) as unknown as SQL<unknown>);
    }

    if (examTypeId) {
      whereConditions.push(eq(questions.examTypeId, examTypeId) as unknown as SQL<unknown>);
    }

    // Reduce where clauses into a single SQL condition, avoiding undefined types
    const whereCondition: SQL<unknown> = whereConditions.reduce<SQL<unknown>>(
      (acc, cond) => (and(acc, cond) as unknown as SQL<unknown>),
      sql`1=1` as unknown as SQL<unknown>
    );

    

    const [questionsResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: questions.id,
          pdfKey: questions.pdfKey,
          pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
          viewCount: questions.viewCount,
          createdAt: questions.createdAt,
          departmentName: departments.name,
          departmentShortName: departments.shortName,
          courseName: courses.name,
          semesterName: semesters.name,
          examTypeName: examTypes.name,
          userName: users.name,
        })
        .from(questions)
        .leftJoin(departments, eq(questions.departmentId, departments.id))
        .leftJoin(courses, eq(questions.courseId, courses.id))
        .leftJoin(semesters, eq(questions.semesterId, semesters.id))
        .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
        .leftJoin(users, eq(questions.userId, users.id))
        .where(whereCondition)
        .orderBy(desc(questions.createdAt))
        .limit(pageSize)
        .offset(skip),

      db
        .select({ count: count() })
        .from(questions)
        .where(whereCondition),
    ]);

    const totalCount = totalCountResult[0].count;
    return ok({
      questions: questionsResult,
      pagination: getPaginationMeta(totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching public questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single published question by ID
export async function getPublicQuestion(questionId: number) {
  try {
    const questionResult = await db
      .select({
        id: questions.id,
        pdfKey: questions.pdfKey,
        pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
        viewCount: questions.viewCount,
        createdAt: questions.createdAt,
        status: questions.status,
        departmentName: departments.name,
        departmentShortName: departments.shortName,
        courseName: courses.name,
        semesterName: semesters.name,
        examTypeName: examTypes.name,
        userName: users.name,
      })
      .from(questions)
      .leftJoin(departments, eq(questions.departmentId, departments.id))
      .leftJoin(courses, eq(questions.courseId, courses.id))
      .leftJoin(semesters, eq(questions.semesterId, semesters.id))
      .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
      .leftJoin(users, eq(questions.userId, users.id))
      .where(and(
        eq(questions.id, questionId),
        eq(questions.status, QuestionStatus.PUBLISHED)
      ))
      .limit(1);

    if (questionResult.length === 0) {
      return fail("Question not found or not published");
    }

    return ok(questionResult[0]);
  } catch (error) {
    console.error("Error fetching question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Increment view count when a question is viewed
export async function incrementViewCount(questionId: number) {
  try {
    await db
      .update(questions)
      .set({
        viewCount: sql`${questions.viewCount} + 1`,
      })
      .where(eq(questions.id, questionId));

    return ok("View count updated");
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return fail("Failed to update view count");
  }
}
