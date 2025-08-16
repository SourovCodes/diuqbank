"use server";

import { revalidatePath } from "next/cache";
import { QuestionStatus } from "@/db/schema";
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
import {
  questionRepository,
  courseRepository,
  semesterRepository
} from "@/lib/repositories";

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
    return await questionRepository.getFilterOptions();
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
    const result = await questionRepository.findPublishedQuestions({
      page,
      pageSize,
      departmentId,
      courseId,
      semesterId,
      examTypeId,
    });

    return ok({
      questions: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching public questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single published question by ID
export async function getPublicQuestion(questionId: number) {
  try {
    const questionResult = await questionRepository.findPublishedById(questionId);

    if (!questionResult) {
      return fail("Question not found or not published");
    }

    return ok(questionResult);
  } catch (error) {
    console.error("Error fetching question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Increment view count when a question is viewed
export async function incrementViewCount(questionId: number) {
  try {
    const updated = await questionRepository.incrementViewCount(questionId);

    if (!updated) {
      return fail("Failed to update view count");
    }

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
    return ok({ id: question.id });
  } catch (error) {
    console.error("Error creating question:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get dropdown data for public users
export async function getDepartmentsForDropdownPublic() {
  try {
    const allDepartments = await questionRepository.getDepartmentOptions();
    return ok(allDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getCoursesForDropdownPublic(departmentId: number) {
  try {
    const allCourses = await questionRepository.getCourseOptions(departmentId);
    return ok(allCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getSemestersForDropdownPublic() {
  try {
    const allSemesters = await questionRepository.getSemesterOptions();
    return ok(allSemesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return fail("Something went wrong. Please try again.");
  }
}

export async function getExamTypesForDropdownPublic() {
  try {
    const allExamTypes = await questionRepository.getExamTypeOptions();
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

    const questionData = await questionRepository.findByIdWithDetails(numericId);

    if (!questionData) {
      return fail("Question not found");
    }

    // Check if user owns this question
    if (questionData.userId !== session.user.id) {
      return fail("You can only edit your own questions");
    }

    return ok(questionData);
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
    const isOwned = await questionRepository.isQuestionOwnedByUser(numericId, session.user.id);
    if (!isOwned) {
      return fail("You can only edit your own questions");
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
    const updateData = {
      departmentId: values.departmentId,
      courseId: values.courseId,
      semesterId: values.semesterId,
      examTypeId: values.examTypeId,
      status: QuestionStatus.PENDING_REVIEW, // Reset to pending review on edit
    };

    // If new PDF is provided, update file info
    if (values.pdfKey && values.pdfFileSizeInBytes) {
      Object.assign(updateData, {
        pdfKey: values.pdfKey,
        pdfFileSizeInBytes: values.pdfFileSizeInBytes,
      });
    }

    const updatedQuestion = await questionRepository.update(numericId, updateData);

    if (!updatedQuestion) {
      return fail("Failed to update question.");
    }

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
    const isNameTaken = await courseRepository.isNameTakenInDepartment(
      values.name,
      values.departmentId
    );

    if (isNameTaken) {
      return fail("A course with this name already exists in this department.");
    }

    const course = await courseRepository.create({
      name: values.name,
      departmentId: values.departmentId,
    });

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
    const isNameTaken = await semesterRepository.isNameTaken(values.name);

    if (isNameTaken) {
      return fail("A semester with this name already exists.");
    }

    const semester = await semesterRepository.create({
      name: values.name,
    });

    revalidatePath("/questions");
    return ok(semester);
  } catch (error) {
    console.error("Error creating semester:", error);
    return fail("Something went wrong. Please try again.");
  }
}
