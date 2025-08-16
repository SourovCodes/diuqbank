"use server";

import { revalidatePath } from "next/cache";
import {
  presignedUrlSchema,
  type PresignedUrlRequest,
  type QuestionStatus,
} from "./schemas/question";
import { QuestionStatus as DBQuestionStatus } from "@/db/schema";
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { questionRepository } from "@/lib/repositories";
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
  userId: string;
  status: string;
  pdfKey: string;
  pdfFileSizeInBytes: number;
}

interface UpdateQuestionParams {
  departmentId: number;
  courseId: number;
  semesterId: number;
  examTypeId: number;
  userId: string;
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

    const randomId = crypto.randomBytes(16).toString("hex");
    const pdfKey = `questions/${randomId}.pdf`;

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

    // Check for duplicate question
    const isDuplicate = await questionRepository.isDuplicateQuestion(
      values.departmentId,
      values.courseId,
      values.semesterId,
      values.examTypeId
    );

    if (isDuplicate) {
      return fail("A question with this combination already exists.");
    }

    const question = await questionRepository.create({
      userId: values.userId,
      departmentId: values.departmentId,
      courseId: values.courseId,
      semesterId: values.semesterId,
      examTypeId: values.examTypeId,
      status: values.status as QuestionStatus,
      pdfKey: values.pdfKey,
      pdfFileSizeInBytes: values.pdfFileSizeInBytes,
    });

    revalidatePath("/admin/questions");
    return ok({ id: question.id });
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

    // Find the status key from the status value
    const statusKey = Object.keys(DBQuestionStatus).find(
      key => DBQuestionStatus[key as keyof typeof DBQuestionStatus] === status
    ) as keyof typeof DBQuestionStatus;

    if (!statusKey) {
      return fail("Invalid question status.");
    }

    const updated = await questionRepository.updateStatus(numericId, statusKey);

    if (!updated) {
      return fail("Failed to update question status.");
    }

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

    // Convert status value to status key if provided
    let statusKey: keyof typeof DBQuestionStatus | undefined;
    if (status) {
      statusKey = Object.keys(DBQuestionStatus).find(
        key => DBQuestionStatus[key as keyof typeof DBQuestionStatus] === status
      ) as keyof typeof DBQuestionStatus;
    }

    const result = await questionRepository.findManyWithDetails({
      page,
      pageSize,
      search,
      departmentId,
      status: statusKey,
    });

    return ok({
      questions: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
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

    const deleteResult = await questionRepository.deleteWithPdfKey(numericId);

    if (!deleteResult.success) {
      return fail("Question not found.");
    }

    // Delete PDF from S3 if it exists
    if (deleteResult.pdfKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: deleteResult.pdfKey,
          })
        );
      } catch (deleteError) {
        console.error("Error deleting PDF from S3:", deleteError);
      }
    }

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

    const allDepartments = await questionRepository.getDepartmentOptions();
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

    const allCourses = await questionRepository.getCourseOptions(departmentId);
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

    const allSemesters = await questionRepository.getSemesterOptions();
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

    const allExamTypes = await questionRepository.getExamTypeOptions();
    return ok(allExamTypes);
  } catch (error) {
    console.error("Error fetching exam types:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getUsersForDropdown() {
  try {
    const perm = await ensurePermission("QUESTIONS:MANAGE");
    if (!perm.success) return perm;

    const allUsers = await questionRepository.getUserOptions();
    return ok(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
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

    const questionData = await questionRepository.findByIdWithDetails(numericId);

    if (!questionData) {
      return fail("Question not found");
    }

    return ok(questionData);
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
    const existingQuestion = await questionRepository.findById(numericId);
    if (!existingQuestion) {
      return fail("Question not found.");
    }

    // Check for duplicate question (except this one)
    const isDuplicate = await questionRepository.isDuplicateQuestion(
      values.departmentId,
      values.courseId,
      values.semesterId,
      values.examTypeId,
      numericId
    );

    if (isDuplicate) {
      return fail("Another question with this combination already exists.");
    }

    // Build update data
    const updateData: Partial<typeof existingQuestion> = {
      userId: values.userId,
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

    const updatedQuestion = await questionRepository.update(numericId, updateData);

    if (!updatedQuestion) {
      return fail("Failed to update question.");
    }

    revalidatePath("/admin/questions");
    revalidatePath(`/admin/questions/${id}/edit`);
    return ok();
  } catch (error) {
    console.error("Error updating question:", error);
    return fail("Something went wrong. Please try again.");
  }
}
