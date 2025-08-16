"use server";

import { revalidatePath } from "next/cache";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "./schemas/department";
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { departmentRepository } from "@/lib/repositories";

// Create a new department
export async function createDepartment(values: DepartmentFormValues) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = departmentFormSchema.parse(values);

    // Check if department with same name or short name already exists
    const isNameTaken = await departmentRepository.isNameOrShortNameTaken(
      validatedFields.name,
      validatedFields.shortName
    );

    if (isNameTaken) {
      return fail("A department with this name or short name already exists.");
    }

    const department = await departmentRepository.create({
      name: validatedFields.name,
      shortName: validatedFields.shortName,
    });

    revalidatePath("/admin/departments");
    return ok(department);
  } catch (error) {
    console.error("Error creating department:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Update an existing department
export async function updateDepartment(
  id: string,
  values: DepartmentFormValues
) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = departmentFormSchema.parse(values);
    const parsed = parseNumericId(id, "department ID");
    if (!parsed.success) return fail(String(parsed.error));
    const numericId = parsed.data!;

    // Check if department exists
    const existingDepartment = await departmentRepository.findById(numericId);
    if (!existingDepartment) {
      return fail("Department not found.");
    }

    // Check if another department with the same name or short name exists (except this one)
    const isNameTaken = await departmentRepository.isNameOrShortNameTaken(
      validatedFields.name,
      validatedFields.shortName,
      numericId
    );

    if (isNameTaken) {
      return fail(
        "Another department with this name or short name already exists."
      );
    }

    const department = await departmentRepository.update(numericId, {
      name: validatedFields.name,
      shortName: validatedFields.shortName,
    });

    if (!department) {
      return fail("Failed to update department.");
    }

    revalidatePath("/admin/departments");
    revalidatePath(`/admin/departments/${id}/edit`);
    return ok(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Delete a department
export async function deleteDepartment(id: string) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "department ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if department exists
    const existingDepartment = await departmentRepository.findById(numericId);
    if (!existingDepartment) {
      return fail("Department not found.");
    }

    // Check if department is associated with any questions
    const questionCount = await departmentRepository.getQuestionCount(numericId);

    if (questionCount > 0) {
      return fail(
        "Cannot delete department that is associated with questions."
      );
    }

    const deleted = await departmentRepository.delete(numericId);
    if (!deleted) {
      return fail("Failed to delete department.");
    }

    revalidatePath("/admin/departments");
    return ok();
  } catch (error) {
    console.error("Error deleting department:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single department by ID
export async function getDepartment(id: string) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "department ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    const department = await departmentRepository.findById(numericId);

    if (!department) {
      return fail("Department not found");
    }

    return ok(department);
  } catch (error) {
    console.error("Error fetching department:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get paginated departments with optional search
export async function getPaginatedDepartments(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const result = await departmentRepository.findManyWithQuestionCounts({
      page,
      pageSize,
      search,
    });

    return ok({
      departments: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Migrate questions from one department to another
export async function migrateDepartmentQuestions(fromId: string, toId: string) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const fromParsed = parseNumericId(fromId, "from department ID");
    if (!fromParsed.success) return fail(fromParsed.error);
    const toParsed = parseNumericId(toId, "to department ID");
    if (!toParsed.success) return fail(toParsed.error);
    const fromIdNumeric = fromParsed.data!;
    const toIdNumeric = toParsed.data!;

    // Check if both departments exist
    const [fromDepartment, toDepartment] = await Promise.all([
      departmentRepository.findById(fromIdNumeric),
      departmentRepository.findById(toIdNumeric),
    ]);

    if (!fromDepartment || !toDepartment) {
      return fail("One or both departments not found.");
    }

    // Migrate questions
    const migratedCount = await departmentRepository.migrateQuestions(
      fromIdNumeric,
      toIdNumeric
    );

    revalidatePath("/admin/departments");
    return ok<{ migratedCount: number }>({ migratedCount });
  } catch (error) {
    console.error("Error migrating department questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get all departments for migration dropdown
export async function getAllDepartments() {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const allDepartments = await departmentRepository.findAllWithQuestionCounts();

    return ok(allDepartments);
  } catch (error) {
    console.error("Error fetching all departments:", error);
    return fail("Something went wrong. Please try again.");
  }
}
