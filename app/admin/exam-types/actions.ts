"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { examTypes, questions } from "@/db/schema";
import {
  examTypeFormSchema,
  type ExamTypeFormValues,
} from "./schemas/exam-type";
import { eq, and, ne, count, asc, sql } from "drizzle-orm";
import { hasPermission } from "@/lib/authorization";

// Create a new exam type
export async function createExamType(values: ExamTypeFormValues) {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = examTypeFormSchema.parse(values);

    // Check if exam type with same name already exists (case insensitive)
    const existingExamType = await db
      .select()
      .from(examTypes)
      .where(sql`LOWER(${examTypes.name}) = LOWER(${validatedFields.name})`)
      .limit(1);

    if (existingExamType.length > 0) {
      return {
        success: false,
        error: "An exam type with this name already exists.",
      };
    }

    const [insertResult] = await db.insert(examTypes).values({
      name: validatedFields.name,
    });

    // Fetch the created exam type
    const [examType] = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, insertResult.insertId))
      .limit(1);

    revalidatePath("/admin/exam-types");
    return { success: true, data: examType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating exam type:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Update an existing exam type
export async function updateExamType(id: string, values: ExamTypeFormValues) {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedFields = examTypeFormSchema.parse(values);
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid exam type ID.",
      };
    }

    // Check if exam type exists
    const existingExamType = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, numericId))
      .limit(1);

    if (existingExamType.length === 0) {
      return {
        success: false,
        error: "Exam type not found.",
      };
    }

    // Check if another exam type with the same name exists (except this one)
    const duplicateName = await db
      .select()
      .from(examTypes)
      .where(
        and(
          sql`LOWER(${examTypes.name}) = LOWER(${validatedFields.name})`,
          ne(examTypes.id, numericId)
        )
      )
      .limit(1);

    if (duplicateName.length > 0) {
      return {
        success: false,
        error: "Another exam type with this name already exists.",
      };
    }

    await db
      .update(examTypes)
      .set({ name: validatedFields.name })
      .where(eq(examTypes.id, numericId));

    // Fetch the updated exam type
    const [examType] = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, numericId))
      .limit(1);

    revalidatePath("/admin/exam-types");
    revalidatePath(`/admin/exam-types/${id}/edit`);
    return { success: true, data: examType };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating exam type:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete an exam type
export async function deleteExamType(id: string) {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid exam type ID.",
      };
    }

    // Check if exam type exists
    const existingExamType = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, numericId))
      .limit(1);

    if (existingExamType.length === 0) {
      return {
        success: false,
        error: "Exam type not found.",
      };
    }

    // Check if exam type is associated with any questions
    const associatedQuestions = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.examTypeId, numericId));

    if (associatedQuestions[0].count > 0) {
      return {
        success: false,
        error: "Cannot delete exam type that is associated with questions.",
      };
    }

    await db.delete(examTypes).where(eq(examTypes.id, numericId));

    revalidatePath("/admin/exam-types");
    return { success: true };
  } catch (error) {
    console.error("Error deleting exam type:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single exam type by ID
export async function getExamType(id: string) {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return {
        success: false,
        error: "Invalid exam type ID.",
      };
    }

    const examType = await db
      .select()
      .from(examTypes)
      .where(eq(examTypes.id, numericId))
      .limit(1);

    if (examType.length === 0) {
      return { success: false, error: "Exam type not found" };
    }

    return { success: true, data: examType[0] };
  } catch (error) {
    console.error("Error fetching exam type:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get paginated exam types with optional search
export async function getPaginatedExamTypes(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const skip = (page - 1) * pageSize;

    // Build where conditions
    const whereCondition = search
      ? sql`LOWER(${examTypes.name}) LIKE LOWER(${"%" + search + "%"})`
      : undefined;

    // Execute the queries
    const [examTypesResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: examTypes.id,
          name: examTypes.name,
          questionCount: count(questions.id),
        })
        .from(examTypes)
        .leftJoin(questions, eq(examTypes.id, questions.examTypeId))
        .where(whereCondition)
        .groupBy(examTypes.id, examTypes.name)
        .orderBy(asc(examTypes.name))
        .limit(pageSize)
        .offset(skip),

      db.select({ count: count() }).from(examTypes).where(whereCondition),
    ]);

    // Calculate pagination info
    const totalCount = totalCountResult[0].count;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      success: true,
      data: {
        examTypes: examTypesResult,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching exam types:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Migrate questions from one exam type to another
export async function migrateExamTypeQuestions(fromId: string, toId: string) {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const fromIdNumeric = parseInt(fromId);
    const toIdNumeric = parseInt(toId);

    if (isNaN(fromIdNumeric) || isNaN(toIdNumeric)) {
      return {
        success: false,
        error: "Invalid exam type IDs.",
      };
    }

    // Check if both exam types exist
    const [fromExamType, toExamType] = await Promise.all([
      db
        .select()
        .from(examTypes)
        .where(eq(examTypes.id, fromIdNumeric))
        .limit(1),
      db
        .select()
        .from(examTypes)
        .where(eq(examTypes.id, toIdNumeric))
        .limit(1),
    ]);

    if (fromExamType.length === 0 || toExamType.length === 0) {
      return {
        success: false,
        error: "One or both exam types not found.",
      };
    }

    // Count questions to be migrated
    const [questionCount] = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.examTypeId, fromIdNumeric));

    if (questionCount.count === 0) {
      return {
        success: true,
        migratedCount: 0,
      };
    }

    // Migrate questions
    await db
      .update(questions)
      .set({ examTypeId: toIdNumeric })
      .where(eq(questions.examTypeId, fromIdNumeric));

    revalidatePath("/admin/exam-types");
    return {
      success: true,
      migratedCount: questionCount.count,
    };
  } catch (error) {
    console.error("Error migrating exam type questions:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get all exam types for migration dropdown
export async function getAllExamTypes() {
  try {
    // Check if the user has permission to manage exam types
    if (!(await hasPermission("EXAMTYPES:MANAGE"))) {
      return { success: false, error: "Unauthorized" };
    }

    const allExamTypes = await db
      .select({
        id: examTypes.id,
        name: examTypes.name,
        questionCount: count(questions.id),
      })
      .from(examTypes)
      .leftJoin(questions, eq(examTypes.id, questions.examTypeId))
      .groupBy(examTypes.id, examTypes.name)
      .orderBy(asc(examTypes.name));

    return {
      success: true,
      data: allExamTypes,
    };
  } catch (error) {
    console.error("Error fetching all exam types:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
