"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import {
  questions,
  departments,
  courses,
  semesters,
  examTypes,
  users,
} from "@/db/schema";
import {
  presignedUrlSchema,
  type PresignedUrlRequest,
  type QuestionStatus,
} from "./schemas/question";
import { eq, and, count, asc, desc, sql } from "drizzle-orm";
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { s3 } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
// session will be obtained via ensurePermission when needed

// Types for better type safety come from schema

interface CreateQuestionAdminParams {
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  status: string;
  pdfKey: string;
  pdfFileSizeInBytes: number;
}

interface UpdateQuestionParams {
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  status: string;
  pdfKey?: string;
  pdfFileSizeInBytes?: number;
}

// Generate presigned URL for S3 upload
export async function generatePresignedUrl(request: PresignedUrlRequest) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = presignedUrlSchema.parse(request);

    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString("hex");
    const sanitizedFileName = validatedFields.fileName.replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    );
    const pdfKey = `questions/admin-${timestamp}-${randomBytes}-${sanitizedFileName}`;

    // Ensure ContentType matches the AWS SDK typing (string | undefined)
    const contentType: string =
      validatedFields.contentType as unknown as string;
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

// Create a new question (Admin creates via presigned URL)
export async function createQuestionAdmin(values: CreateQuestionAdminParams) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;
    const session = perm.session;

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
      status: values.status as QuestionStatus,
      pdfKey: values.pdfKey,
      pdfFileSizeInBytes: values.pdfFileSizeInBytes,
    });

    revalidatePath("/admin/questions");
    return ok({ id: insertResult.insertId });
  } catch (error) {
    console.error("Error creating question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Update a question's status
export async function updateQuestionStatus(id: string, status: string) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "Question");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    await db
      .update(questions)
      .set({ status: status as QuestionStatus })
      .where(eq(questions.id, numericId));

    revalidatePath("/admin/questions");
    return ok();
  } catch (error) {
    console.error("Error updating question status:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get paginated questions with optional search
export async function getPaginatedQuestions(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  departmentId?: number,
  status?: string
) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    const skip = (page - 1) * pageSize;
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`(LOWER(${departments.name}) LIKE LOWER(${"%" + search + "%"}) OR 
                     LOWER(${courses.name}) LIKE LOWER(${
          "%" + search + "%"
        }) OR 
                     LOWER(${semesters.name}) LIKE LOWER(${
          "%" + search + "%"
        }) OR 
                     LOWER(${examTypes.name}) LIKE LOWER(${
          "%" + search + "%"
        }))`
      );
    }

    if (departmentId) {
      whereConditions.push(eq(questions.departmentId, departmentId));
    }

    if (status) {
      whereConditions.push(eq(questions.status, status as QuestionStatus));
    }

    const whereCondition =
      whereConditions.length > 0
        ? whereConditions.reduce(
            (acc, condition) => sql`${acc} AND ${condition}`
          )
        : undefined;

    const [questionsResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: questions.id,
          status: questions.status,
          pdfKey: questions.pdfKey,
          pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
          viewCount: questions.viewCount,
          isReviewed: questions.isReviewed,
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

      // If no search text is used, we can count directly from questions with simple filters
      search
        ? db
            .select({ count: count() })
            .from(questions)
            .leftJoin(departments, eq(questions.departmentId, departments.id))
            .leftJoin(courses, eq(questions.courseId, courses.id))
            .leftJoin(semesters, eq(questions.semesterId, semesters.id))
            .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
            .where(whereCondition)
        : db.select({ count: count() }).from(questions).where(whereCondition),
    ]);

    const totalCount = totalCountResult[0].count;
    return ok({
      questions: questionsResult,
      pagination: getPaginationMeta(totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Delete a question
export async function deleteQuestion(id: string) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "Question");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    const existingQuestion = await db
      .select({ pdfKey: questions.pdfKey })
      .from(questions)
      .where(eq(questions.id, numericId))
      .limit(1);

    if (existingQuestion.length === 0) {
      return fail("Question not found.");
    }

    if (existingQuestion[0].pdfKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: existingQuestion[0].pdfKey,
          })
        );
      } catch (deleteError) {
        console.error("Error deleting PDF from S3:", deleteError);
      }
    }

    await db.delete(questions).where(eq(questions.id, numericId));

    revalidatePath("/admin/questions");
    return ok();
  } catch (error) {
    console.error("Error deleting question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get dropdown data
export async function getDepartmentsForDropdown() {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    // Return just id and a single display name (prefer shortName for brevity)
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

export async function getCoursesForDropdown(departmentId: number) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    // Minimal payload: id and name for the selected department only
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

export async function getSemestersForDropdown() {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

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

export async function getExamTypesForDropdown() {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

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

// Get a single question by ID for editing
export async function getQuestion(id: string) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

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

    return ok(questionData[0]);
  } catch (error) {
    console.error("Error fetching question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Update an existing question
export async function updateQuestion(id: string, values: UpdateQuestionParams) {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "Question");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if question exists
    const existingQuestion = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.id, numericId))
      .limit(1);

    if (existingQuestion.length === 0) {
      return fail("Question not found.");
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
      return {
        success: false,
        error: "Another question with this combination already exists.",
      };
    }

    // Build update data
    const updateData: Partial<typeof questions.$inferInsert> = {
      departmentId: values.departmentId,
      courseId: values.courseId,
      semesterId: values.semesterId,
      examTypeId: values.examTypeId,
      status: values.status as QuestionStatus,
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

    revalidatePath("/admin/questions");
    revalidatePath(`/admin/questions/${id}/edit`);
    return ok();
  } catch (error) {
    console.error("Error updating question:", error);
    return fail("Something went wrong. Please try again.");
  }
}
