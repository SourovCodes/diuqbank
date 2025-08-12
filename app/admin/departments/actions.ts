"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { departments, questions } from "@/db/schema";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "./schemas/department";
import { eq, and, ne, count, asc, sql } from "drizzle-orm";
// permission checks handled by ensurePermission helper
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
} from "@/lib/action-utils";

// Create a new department
export async function createDepartment(values: DepartmentFormValues) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = departmentFormSchema.parse(values);

    // Check if department with same name already exists (case insensitive)
    const existingDepartment = await db
      .select()
      .from(departments)
      .where(
        sql`LOWER(${departments.name}) = LOWER(${validatedFields.name}) OR LOWER(${departments.shortName}) = LOWER(${validatedFields.shortName})`
      )
      .limit(1);

    if (existingDepartment.length > 0) {
      return {
        success: false,
        error: "A department with this name or short name already exists.",
      };
    }

    const [insertResult] = await db.insert(departments).values({
      name: validatedFields.name,
      shortName: validatedFields.shortName,
    });

    // Fetch the created department
    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, insertResult.insertId))
      .limit(1);

    revalidatePath("/admin/departments");
    return { success: true, data: department };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error creating department:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
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
    if (!parsed.success) return { success: false, error: String(parsed.error) };
    const numericId = parsed.data!;

    // Check if department exists
    const existingDepartment = await db
      .select()
      .from(departments)
      .where(eq(departments.id, numericId))
      .limit(1);

    if (existingDepartment.length === 0) {
      return {
        success: false,
        error: "Department not found.",
      };
    }

    // Check if another department with the same name or short name exists (except this one)
    const duplicateName = await db
      .select()
      .from(departments)
      .where(
        and(
          sql`(LOWER(${departments.name}) = LOWER(${validatedFields.name}) OR LOWER(${departments.shortName}) = LOWER(${validatedFields.shortName}))`,
          ne(departments.id, numericId)
        )
      )
      .limit(1);

    if (duplicateName.length > 0) {
      return {
        success: false,
        error:
          "Another department with this name or short name already exists.",
      };
    }

    await db
      .update(departments)
      .set({
        name: validatedFields.name,
        shortName: validatedFields.shortName,
      })
      .where(eq(departments.id, numericId));

    // Fetch the updated department
    const [department] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, numericId))
      .limit(1);

    revalidatePath("/admin/departments");
    revalidatePath(`/admin/departments/${id}/edit`);
    return { success: true, data: department };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }

    console.error("Error updating department:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Delete a department
export async function deleteDepartment(id: string) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "department ID");
    if (!parsed.success) return parsed;
    const numericId = parsed.data!;

    // Check if department exists
    const existingDepartment = await db
      .select()
      .from(departments)
      .where(eq(departments.id, numericId))
      .limit(1);

    if (existingDepartment.length === 0) {
      return {
        success: false,
        error: "Department not found.",
      };
    }

    // Check if department is associated with any questions
    const associatedQuestions = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.departmentId, numericId));

    if (associatedQuestions[0].count > 0) {
      return {
        success: false,
        error: "Cannot delete department that is associated with questions.",
      };
    }

    await db.delete(departments).where(eq(departments.id, numericId));

    revalidatePath("/admin/departments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting department:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get a single department by ID
export async function getDepartment(id: string) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "department ID");
    if (!parsed.success) return parsed;
    const numericId = parsed.data!;

    const department = await db
      .select()
      .from(departments)
      .where(eq(departments.id, numericId))
      .limit(1);

    if (department.length === 0) {
      return { success: false, error: "Department not found" };
    }

    return { success: true, data: department[0] };
  } catch (error) {
    console.error("Error fetching department:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
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

    const skip = (page - 1) * pageSize;

    // Build where conditions
    const whereCondition = search
      ? sql`(LOWER(${departments.name}) LIKE LOWER(${
          "%" + search + "%"
        }) OR LOWER(${departments.shortName}) LIKE LOWER(${
          "%" + search + "%"
        }))`
      : undefined;

    // Execute the queries
    const [departmentsResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: departments.id,
          name: departments.name,
          shortName: departments.shortName,
          questionCount: count(questions.id),
        })
        .from(departments)
        .leftJoin(questions, eq(departments.id, questions.departmentId))
        .where(whereCondition)
        .groupBy(departments.id, departments.name, departments.shortName)
        .orderBy(asc(departments.name))
        .limit(pageSize)
        .offset(skip),

      db.select({ count: count() }).from(departments).where(whereCondition),
    ]);

    // Calculate pagination info
    const totalCount = totalCountResult[0].count;
    return {
      success: true,
      data: {
        departments: departmentsResult,
        pagination: getPaginationMeta(totalCount, page, pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Migrate questions from one department to another
export async function migrateDepartmentQuestions(fromId: string, toId: string) {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const fromParsed = parseNumericId(fromId, "from department ID");
    if (!fromParsed.success) return fromParsed;
    const toParsed = parseNumericId(toId, "to department ID");
    if (!toParsed.success) return toParsed;
    const fromIdNumeric = fromParsed.data!;
    const toIdNumeric = toParsed.data!;

    // Check if both departments exist
    const [fromDepartment, toDepartment] = await Promise.all([
      db
        .select()
        .from(departments)
        .where(eq(departments.id, fromIdNumeric))
        .limit(1),
      db
        .select()
        .from(departments)
        .where(eq(departments.id, toIdNumeric))
        .limit(1),
    ]);

    if (fromDepartment.length === 0 || toDepartment.length === 0) {
      return {
        success: false,
        error: "One or both departments not found.",
      };
    }

    // Count questions to be migrated
    const [questionCount] = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.departmentId, fromIdNumeric));

    if (questionCount.count === 0) {
      return {
        success: true,
        migratedCount: 0,
      };
    }

    // Migrate questions
    await db
      .update(questions)
      .set({ departmentId: toIdNumeric })
      .where(eq(questions.departmentId, fromIdNumeric));

    revalidatePath("/admin/departments");
    return {
      success: true,
      migratedCount: questionCount.count,
    };
  } catch (error) {
    console.error("Error migrating department questions:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// Get all departments for migration dropdown
export async function getAllDepartments() {
  try {
    // Check if the user has permission to manage departments
    const perm = await ensurePermission("DEPARTMENTS:MANAGE");
    if (!perm.success) return perm;

    const allDepartments = await db
      .select({
        id: departments.id,
        name: departments.name,
        questionCount: count(questions.id),
      })
      .from(departments)
      .leftJoin(questions, eq(departments.id, questions.departmentId))
      .groupBy(departments.id, departments.name)
      .orderBy(asc(departments.name));

    return {
      success: true,
      data: allDepartments,
    };
  } catch (error) {
    console.error("Error fetching all departments:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
