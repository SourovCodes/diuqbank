"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { questions, departments, courses, semesters, examTypes, users } from "@/db/schema";
import {
    presignedUrlSchema,
    type PresignedUrlRequest,
} from "./schemas/question";
import { eq, and, count, asc, desc, sql } from "drizzle-orm";
import { hasPermission } from "@/lib/authorization";
import { s3 } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { auth } from "@/lib/auth";

// Types for better type safety
type QuestionStatus = "published" | "duplicate" | "pending review" | "rejected";

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
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const validatedFields = presignedUrlSchema.parse(request);

        const timestamp = Date.now();
        const randomBytes = crypto.randomBytes(8).toString("hex");
        const sanitizedFileName = validatedFields.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const pdfKey = `questions/admin-${timestamp}-${randomBytes}-${sanitizedFileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: pdfKey,
            ContentType: validatedFields.contentType,
            ContentLength: validatedFields.fileSize,
        });

        const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        return {
            success: true,
            data: {
                presignedUrl,
                pdfKey,
            },
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.flatten().fieldErrors };
        }

        console.error("Error generating presigned URL:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Create a new question (Admin creates via presigned URL)
export async function createQuestionAdmin(values: CreateQuestionAdminParams) {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "User session not found" };
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
            return {
                success: false,
                error: "A question with this combination already exists.",
            };
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
        return { success: true, data: { id: insertResult.insertId } };
    } catch (error) {
        console.error("Error creating question:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Update a question's status
export async function updateQuestionStatus(id: string, status: string) {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            return { success: false, error: "Invalid question ID." };
        }

        await db
            .update(questions)
            .set({ status: status as QuestionStatus })
            .where(eq(questions.id, numericId));

        revalidatePath("/admin/questions");
        return { success: true };
    } catch (error) {
        console.error("Error updating question status:", error);
        return { success: false, error: "Something went wrong. Please try again." };
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
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const skip = (page - 1) * pageSize;
        const whereConditions = [];

        if (search) {
            whereConditions.push(
                sql`(LOWER(${departments.name}) LIKE LOWER(${"%" + search + "%"}) OR 
                     LOWER(${courses.name}) LIKE LOWER(${"%" + search + "%"}) OR 
                     LOWER(${semesters.name}) LIKE LOWER(${"%" + search + "%"}) OR 
                     LOWER(${examTypes.name}) LIKE LOWER(${"%" + search + "%"}))`
            );
        }

        if (departmentId) {
            whereConditions.push(eq(questions.departmentId, departmentId));
        }

        if (status) {
            whereConditions.push(eq(questions.status, status as QuestionStatus));
        }

        const whereCondition = whereConditions.length > 0
            ? whereConditions.reduce((acc, condition) => sql`${acc} AND ${condition}`)
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

            db.select({ count: count() }).from(questions)
                .leftJoin(departments, eq(questions.departmentId, departments.id))
                .leftJoin(courses, eq(questions.courseId, courses.id))
                .leftJoin(semesters, eq(questions.semesterId, semesters.id))
                .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
                .where(whereCondition),
        ]);

        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            success: true,
            data: {
                questions: questionsResult,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                },
            },
        };
    } catch (error) {
        console.error("Error fetching questions:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Delete a question
export async function deleteQuestion(id: string) {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            return { success: false, error: "Invalid question ID." };
        }

        const existingQuestion = await db
            .select()
            .from(questions)
            .where(eq(questions.id, numericId))
            .limit(1);

        if (existingQuestion.length === 0) {
            return { success: false, error: "Question not found." };
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
        return { success: true };
    } catch (error) {
        console.error("Error deleting question:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Get dropdown data
export async function getDepartmentsForDropdown() {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const allDepartments = await db
            .select({
                id: departments.id,
                name: departments.name,
                shortName: departments.shortName,
            })
            .from(departments)
            .orderBy(asc(departments.name));

        return { success: true, data: allDepartments };
    } catch (error) {
        console.error("Error fetching departments:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function getCoursesForDropdown() {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const allCourses = await db
            .select({
                id: courses.id,
                name: courses.name,
            })
            .from(courses)
            .orderBy(asc(courses.name));

        return { success: true, data: allCourses };
    } catch (error) {
        console.error("Error fetching courses:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function getSemestersForDropdown() {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const allSemesters = await db
            .select({
                id: semesters.id,
                name: semesters.name,
            })
            .from(semesters)
            .orderBy(asc(semesters.name));

        return { success: true, data: allSemesters };
    } catch (error) {
        console.error("Error fetching semesters:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function getExamTypesForDropdown() {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const allExamTypes = await db
            .select({
                id: examTypes.id,
                name: examTypes.name,
            })
            .from(examTypes)
            .orderBy(asc(examTypes.name));

        return { success: true, data: allExamTypes };
    } catch (error) {
        console.error("Error fetching exam types:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

// Get a single question by ID for editing
export async function getQuestion(id: string) {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            return { success: false, error: "Invalid question ID." };
        }

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
            return { success: false, error: "Question not found" };
        }

        return { success: true, data: questionData[0] };
    } catch (error) {
        console.error("Error fetching question:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Update an existing question
export async function updateQuestion(id: string, values: UpdateQuestionParams) {
    try {
        if (!(await hasPermission("QUESTIONS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const numericId = parseInt(id);
        if (isNaN(numericId)) {
            return { success: false, error: "Invalid question ID." };
        }

        // Check if question exists
        const existingQuestion = await db
            .select()
            .from(questions)
            .where(eq(questions.id, numericId))
            .limit(1);

        if (existingQuestion.length === 0) {
            return { success: false, error: "Question not found." };
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
        return { success: true };
    } catch (error) {
        console.error("Error updating question:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
} 