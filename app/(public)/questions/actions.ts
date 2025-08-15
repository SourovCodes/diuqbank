"use server";

import { revalidatePath } from "next/cache";
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
import { sql, desc, eq, and, count, asc } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { ok, fail, getPaginationMeta, parseNumericId, fromZodError } from "@/lib/action-utils";
import { auth } from "@/lib/auth";
import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { 
  presignedUrlSchema, 
  type PresignedUrlRequest
} from "./schemas/question";

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
  userId: string | null;
  userUsername: string | null;
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
    const whereConditions: SQL<unknown>[] = [
      eq(questions.status, QuestionStatus.PUBLISHED) as unknown as SQL<unknown>,
    ];

    if (departmentId) {
      whereConditions.push(
        eq(questions.departmentId, departmentId) as unknown as SQL<unknown>
      );
    }

    if (courseId) {
      whereConditions.push(
        eq(questions.courseId, courseId) as unknown as SQL<unknown>
      );
    }

    if (semesterId) {
      whereConditions.push(
        eq(questions.semesterId, semesterId) as unknown as SQL<unknown>
      );
    }

    if (examTypeId) {
      whereConditions.push(
        eq(questions.examTypeId, examTypeId) as unknown as SQL<unknown>
      );
    }

    // Reduce where clauses into a single SQL condition, avoiding undefined types
    const whereCondition: SQL<unknown> = whereConditions.reduce<SQL<unknown>>(
      (acc, cond) => and(acc, cond) as unknown as SQL<unknown>,
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
          userId: users.id,
          userUsername: users.username,
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

      db.select({ count: count() }).from(questions).where(whereCondition),
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
        userId: users.id,
        userUsername: users.username,
      })
      .from(questions)
      .leftJoin(departments, eq(questions.departmentId, departments.id))
      .leftJoin(courses, eq(questions.courseId, courses.id))
      .leftJoin(semesters, eq(questions.semesterId, semesters.id))
      .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
      .leftJoin(users, eq(questions.userId, users.id))
      .where(
        and(
          eq(questions.id, questionId),
          eq(questions.status, QuestionStatus.PUBLISHED)
        )
      )
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

// Public user question management functions

interface CreateQuestionPublicParams {
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  pdfKey: string;
  pdfFileSizeInBytes: number;
}

interface UpdateQuestionPublicParams {
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  pdfKey?: string;
  pdfFileSizeInBytes?: number;
}

// Generate presigned URL for S3 upload (public version)
export async function generatePresignedUrlPublic(request: PresignedUrlRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return fail("You must be logged in to upload files");
    }

    const validatedFields = presignedUrlSchema.parse(request);

    const randomId = crypto.randomBytes(16).toString("hex");
    const pdfKey = `questions/${randomId}.pdf`;

    const contentType: string = validatedFields.contentType as unknown as string;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: pdfKey,
      ContentType: contentType,
      ContentLength: validatedFields.fileSize,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return ok({ presignedUrl, pdfKey });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Create a new question (public user)
export async function createQuestionPublic(values: CreateQuestionPublicParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return fail("You must be logged in to create questions");
    }

    // Check for duplicate question
    const existingQuestion = await db
      .select({ id: questions.id })
      .from(questions)
      .where(
        and(
          eq(questions.departmentId, values.departmentId),
          eq(questions.semesterId, values.semesterId),
          eq(questions.courseId, values.courseId),
          eq(questions.examTypeId, values.examTypeId)
        )
      )
      .limit(1);

    if (existingQuestion.length > 0) {
      return fail("A question with this combination already exists.");
    }

    const [insertResult] = await db.insert(questions).values({
      userId: session.user.id,
      departmentId: values.departmentId,
      courseId: values.courseId,
      semesterId: values.semesterId,
      examTypeId: values.examTypeId,
      status: QuestionStatus.PENDING_REVIEW, // Public users submit for review
      pdfKey: values.pdfKey,
      pdfFileSizeInBytes: values.pdfFileSizeInBytes,
    });

    revalidatePath("/questions");
    return ok({ id: insertResult.insertId });
  } catch (error) {
    console.error("Error creating question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get dropdown data for public users
export async function getDepartmentsForDropdownPublic() {
  try {
    const allDepartments = await db
      .select({ id: departments.id, name: departments.shortName })
      .from(departments)
      .orderBy(asc(departments.shortName));

    return ok(allDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getCoursesForDropdownPublic(departmentId: number) {
  try {
    const allCourses = await db
      .select({ id: courses.id, name: courses.name })
      .from(courses)
      .where(eq(courses.departmentId, departmentId))
      .orderBy(asc(courses.name));

    return ok(allCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getSemestersForDropdownPublic() {
  try {
    const allSemesters = await db
      .select({ id: semesters.id, name: semesters.name })
      .from(semesters)
      .orderBy(asc(semesters.name));

    return ok(allSemesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getExamTypesForDropdownPublic() {
  try {
    const allExamTypes = await db
      .select({ id: examTypes.id, name: examTypes.name })
      .from(examTypes)
      .orderBy(asc(examTypes.name));

    return ok(allExamTypes);
  } catch (error) {
    console.error("Error fetching exam types:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single question by ID for editing (only if user owns it)
export async function getQuestionForEdit(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return fail("You must be logged in to edit questions");
    }

    const parsed = parseNumericId(id, "Question");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    const questionData = await db
      .select({
        id: questions.id,
        userId: questions.userId,
        departmentId: questions.departmentId,
        courseId: questions.courseId,
        semesterId: questions.semesterId,
        examTypeId: questions.examTypeId,
        status: questions.status,
        pdfKey: questions.pdfKey,
        pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
        viewCount: questions.viewCount,
        isReviewed: questions.isReviewed,
        createdAt: questions.createdAt,
        updatedAt: questions.updatedAt,
        departmentName: departments.name,
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
      .where(eq(questions.id, numericId))
      .limit(1);

    if (questionData.length === 0) {
      return fail("Question not found");
    }

    // Check if user owns this question
    if (questionData[0].userId !== session.user.id) {
      return fail("You can only edit your own questions");
    }

    return ok(questionData[0]);
  } catch (error) {
    console.error("Error fetching question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Update an existing question (public user)
export async function updateQuestionPublic(id: string, values: UpdateQuestionPublicParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return fail("You must be logged in to update questions");
    }

    const parsed = parseNumericId(id, "Question");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if question exists and user owns it
    const existingQuestion = await db
      .select({ id: questions.id, userId: questions.userId })
      .from(questions)
      .where(eq(questions.id, numericId))
      .limit(1);

    if (existingQuestion.length === 0) {
      return fail("Question not found.");
    }

    if (existingQuestion[0].userId !== session.user.id) {
      return fail("You can only edit your own questions");
    }

    // Check for duplicate question (except this one)
    const duplicateQuestion = await db
      .select({ id: questions.id })
      .from(questions)
      .where(
        and(
          eq(questions.departmentId, values.departmentId),
          eq(questions.semesterId, values.semesterId),
          eq(questions.courseId, values.courseId),
          eq(questions.examTypeId, values.examTypeId),
          sql`${questions.id} != ${numericId}`
        )
      )
      .limit(1);

    if (duplicateQuestion.length > 0) {
      return fail("Another question with this combination already exists.");
    }

    // Build update data
    const updateData: Partial<typeof questions.$inferInsert> = {
      departmentId: values.departmentId,
      courseId: values.courseId,
      semesterId: values.semesterId,
      examTypeId: values.examTypeId,
      status: QuestionStatus.PENDING_REVIEW, // Reset to pending review on edit
    };

    // If new PDF is provided, update file info
    if (values.pdfKey && values.pdfFileSizeInBytes) {
      updateData.pdfKey = values.pdfKey;
      updateData.pdfFileSizeInBytes = values.pdfFileSizeInBytes;
    }

    await db
      .update(questions)
      .set(updateData)
      .where(eq(questions.id, numericId));

    revalidatePath("/questions");
    revalidatePath(`/questions/${id}/edit`);
    return ok();
  } catch (error) {
    console.error("Error updating question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Public course creation
export async function createCoursePublic(values: { name: string; departmentId: number }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return fail("You must be logged in to create courses");
    }

    // Check if course with same name already exists in the same department (case insensitive)
    const existingCourse = await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.departmentId, values.departmentId),
          sql`LOWER(${courses.name}) = LOWER(${values.name})`
        )
      )
      .limit(1);

    if (existingCourse.length > 0) {
      return fail("A course with this name already exists in this department.");
    }

    const [insertResult] = await db.insert(courses).values({
      name: values.name,
      departmentId: values.departmentId,
    });

    // Fetch the created course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, insertResult.insertId))
      .limit(1);

    revalidatePath("/questions");
    return ok(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Public semester creation
export async function createSemesterPublic(values: { name: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return fail("You must be logged in to create semesters");
    }

    // Check if semester with same name already exists globally (case insensitive)
    const existingSemester = await db
      .select()
      .from(semesters)
      .where(sql`LOWER(${semesters.name}) = LOWER(${values.name})`)
      .limit(1);

    if (existingSemester.length > 0) {
      return fail("A semester with this name already exists.");
    }

    const [insertResult] = await db
      .insert(semesters)
      .values({ name: values.name });

    // Fetch the created semester
    const [semester] = await db
      .select()
      .from(semesters)
      .where(eq(semesters.id, insertResult.insertId))
      .limit(1);

    revalidatePath("/questions");
    return ok(semester);
  } catch (error) {
    console.error("Error creating semester:", error);
    return fail("Something went wrong. Please try again.");
  }
}
