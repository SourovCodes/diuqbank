"use server";

import { revalidatePath } from "next/cache";
import {
  examTypeFormSchema,
  type ExamTypeFormValues,
} from "./schemas/exam-type";
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { examTypeRepository } from "@/lib/repositories";

// Create a new exam type
export async function createExamType(values: ExamTypeFormValues) {
  try {
    // Check if the user has permission to manage exam types
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = examTypeFormSchema.parse(values);

    // Check if exam type with same name already exists globally
    const isNameTaken = await examTypeRepository.isNameTaken(validatedFields.name);

    if (isNameTaken) {
      return fail("An exam type with this name already exists.");
    }

    const examType = await examTypeRepository.create({
      name: validatedFields.name,
    });

    revalidatePath("/admin/exam-types");
    return ok(examType);
  } catch (error) {
    console.error("Error creating exam type:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Update an existing exam type
export async function updateExamType(id: string, values: ExamTypeFormValues) {
  try {
    // Check if the user has permission to manage exam types
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = examTypeFormSchema.parse(values);
    const parsed = parseNumericId(id, "exam type ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if exam type exists
    const existingExamType = await examTypeRepository.findById(numericId);
    if (!existingExamType) {
      return fail("Exam type not found.");
    }

    // Check if another exam type with the same name exists (except this one)
    const isNameTaken = await examTypeRepository.isNameTaken(
      validatedFields.name,
      numericId
    );

    if (isNameTaken) {
      return fail("Another exam type with this name already exists.");
    }

    const examType = await examTypeRepository.update(numericId, {
      name: validatedFields.name,
    });

    if (!examType) {
      return fail("Failed to update exam type.");
    }

    revalidatePath("/admin/exam-types");
    revalidatePath(`/admin/exam-types/${id}/edit`);
    return ok(examType);
  } catch (error) {
    console.error("Error updating exam type:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Delete an exam type
export async function deleteExamType(id: string) {
  try {
    // Check if the user has permission to manage exam types
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "exam type ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if exam type exists
    const existingExamType = await examTypeRepository.findById(numericId);
    if (!existingExamType) {
      return fail("Exam type not found.");
    }

    // Check if exam type is associated with any questions
    const questionCount = await examTypeRepository.getQuestionCount(numericId);

    if (questionCount > 0) {
      return fail("Cannot delete exam type that is associated with questions.");
    }

    const deleted = await examTypeRepository.delete(numericId);
    if (!deleted) {
      return fail("Failed to delete exam type.");
    }

    revalidatePath("/admin/exam-types");
    return ok();
  } catch (error) {
    console.error("Error deleting exam type:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single exam type by ID
export async function getExamType(id: string) {
  try {
    // Check if the user has permission to manage exam types
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "exam type ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    const examType = await examTypeRepository.findById(numericId);

    if (!examType) {
      return fail("Exam type not found");
    }

    return ok(examType);
  } catch (error) {
    console.error("Error fetching exam type:", error);
    return fail("Something went wrong. Please try again.");
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
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const result = await examTypeRepository.findManyWithQuestionCounts({
      page,
      pageSize,
      search,
    });

    return ok({
      examTypes: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching exam types:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Migrate questions from one exam type to another
export async function migrateExamTypeQuestions(fromId: string, toId: string) {
  try {
    // Check if the user has permission to manage exam types
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const fromParsed = parseNumericId(fromId, "from exam type ID");
    if (!fromParsed.success) return fail(fromParsed.error);
    const toParsed = parseNumericId(toId, "to exam type ID");
    if (!toParsed.success) return fail(toParsed.error);
    const fromIdNumeric = fromParsed.data!;
    const toIdNumeric = toParsed.data!;

    // Check if both exam types exist
    const [fromExamType, toExamType] = await Promise.all([
      examTypeRepository.findById(fromIdNumeric),
      examTypeRepository.findById(toIdNumeric),
    ]);

    if (!fromExamType || !toExamType) {
      return fail("One or both exam types not found.");
    }

    // Migrate questions
    const migratedCount = await examTypeRepository.migrateQuestions(
      fromIdNumeric,
      toIdNumeric
    );

    revalidatePath("/admin/exam-types");
    return ok<{ migratedCount: number }>({ migratedCount });
  } catch (error) {
    console.error("Error migrating exam type questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get all exam types for migration dropdown
export async function getAllExamTypes() {
  try {
    // Check if the user has permission to manage exam types
    const perm = await ensurePermission("EXAMTYPES:MANAGE");
    if (!perm.success) return perm;

    const allExamTypes = await examTypeRepository.findAllWithQuestionCounts();

    return ok(allExamTypes);
  } catch (error) {
    console.error("Error fetching all exam types:", error);
    return fail("Something went wrong. Please try again.");
  }
}
