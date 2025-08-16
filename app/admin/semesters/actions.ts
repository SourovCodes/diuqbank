"use server";

import { revalidatePath } from "next/cache";
import {
  semesterFormSchema,
  type SemesterFormValues,
} from "./schemas/semester";
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { semesterRepository } from "@/lib/repositories";

// Create a new semester
export async function createSemester(values: SemesterFormValues) {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = semesterFormSchema.parse(values);

    // Check if semester with same name already exists globally
    const isNameTaken = await semesterRepository.isNameTaken(validatedFields.name);

    if (isNameTaken) {
      return fail("A semester with this name already exists.");
    }

    const semester = await semesterRepository.create({
      name: validatedFields.name,
    });

    revalidatePath("/admin/semesters");
    return ok(semester);
  } catch (error) {
    console.error("Error creating semester:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Update an existing semester
export async function updateSemester(id: string, values: SemesterFormValues) {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = semesterFormSchema.parse(values);
    const parsed = parseNumericId(id, "semester ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if semester exists
    const existingSemester = await semesterRepository.findById(numericId);
    if (!existingSemester) {
      return fail("Semester not found.");
    }

    // Check if another semester with the same name exists globally (except this one)
    const isNameTaken = await semesterRepository.isNameTaken(
      validatedFields.name,
      numericId
    );

    if (isNameTaken) {
      return fail("Another semester with this name already exists.");
    }

    const semester = await semesterRepository.update(numericId, {
      name: validatedFields.name,
    });

    if (!semester) {
      return fail("Failed to update semester.");
    }

    revalidatePath("/admin/semesters");
    revalidatePath(`/admin/semesters/${id}/edit`);
    return ok(semester);
  } catch (error) {
    console.error("Error updating semester:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Delete a semester
export async function deleteSemester(id: string) {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "semester ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if semester exists
    const existingSemester = await semesterRepository.findById(numericId);
    if (!existingSemester) {
      return fail("Semester not found.");
    }

    // Check if semester is associated with any questions
    const questionCount = await semesterRepository.getQuestionCount(numericId);

    if (questionCount > 0) {
      return fail("Cannot delete semester that is associated with questions.");
    }

    const deleted = await semesterRepository.delete(numericId);
    if (!deleted) {
      return fail("Failed to delete semester.");
    }

    revalidatePath("/admin/semesters");
    return ok();
  } catch (error) {
    console.error("Error deleting semester:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single semester by ID
export async function getSemester(id: string) {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "semester ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    const semester = await semesterRepository.findById(numericId);

    if (!semester) {
      return fail("Semester not found");
    }

    return ok(semester);
  } catch (error) {
    console.error("Error fetching semester:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get paginated semesters with optional search
export async function getPaginatedSemesters(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const result = await semesterRepository.findManyWithQuestionCounts({
      page,
      pageSize,
      search,
    });

    return ok({
      semesters: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching semesters:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Migrate questions from one semester to another
export async function migrateSemesterQuestions(fromId: string, toId: string) {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const fromParsed = parseNumericId(fromId, "from semester ID");
    if (!fromParsed.success) return fail(fromParsed.error);
    const toParsed = parseNumericId(toId, "to semester ID");
    if (!toParsed.success) return fail(toParsed.error);
    const fromIdNumeric = fromParsed.data!;
    const toIdNumeric = toParsed.data!;

    // Check if both semesters exist
    const [fromSemester, toSemester] = await Promise.all([
      semesterRepository.findById(fromIdNumeric),
      semesterRepository.findById(toIdNumeric),
    ]);

    if (!fromSemester || !toSemester) {
      return fail("One or both semesters not found.");
    }

    // Migrate questions
    const migratedCount = await semesterRepository.migrateQuestions(
      fromIdNumeric,
      toIdNumeric
    );

    revalidatePath("/admin/semesters");
    return ok<{ migratedCount: number }>({ migratedCount });
  } catch (error) {
    console.error("Error migrating semester questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get all user's semesters for migration dropdown
export async function getAllUserSemesters() {
  try {
    // Check if the user has permission to manage semesters
    const perm = await ensurePermission("SEMESTERS:MANAGE");
    if (!perm.success) return perm;

    const allSemesters = await semesterRepository.findAllWithQuestionCounts();

    return ok(allSemesters);
  } catch (error) {
    console.error("Error fetching all semesters:", error);
    return fail("Something went wrong. Please try again.");
  }
}
