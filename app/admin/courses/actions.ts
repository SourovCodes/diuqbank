"use server";

import { revalidatePath } from "next/cache";
import { courseFormSchema, type CourseFormValues } from "./schemas/course";
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
import { courseRepository, departmentRepository } from "@/lib/repositories";

// Create a new course
export async function createCourse(values: CourseFormValues) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = courseFormSchema.parse(values);

    // Check if course with same name already exists in the same department
    const isNameTaken = await courseRepository.isNameTakenInDepartment(
      validatedFields.name,
      validatedFields.departmentId
    );

    if (isNameTaken) {
      return fail("A course with this name already exists in this department.");
    }

    const course = await courseRepository.create({
      name: validatedFields.name,
      departmentId: validatedFields.departmentId,
    });

    revalidatePath("/admin/courses");
    return ok(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Update an existing course
export async function updateCourse(id: string, values: CourseFormValues) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const validatedFields = courseFormSchema.parse(values);
    const parsed = parseNumericId(id, "course ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if course exists
    const existingCourse = await courseRepository.findById(numericId);
    if (!existingCourse) {
      return fail("Course not found.");
    }

    // Check if another course with the same name exists in the same department (except this one)
    const isNameTaken = await courseRepository.isNameTakenInDepartment(
      validatedFields.name,
      validatedFields.departmentId,
      numericId
    );

    if (isNameTaken) {
      return fail(
        "Another course with this name already exists in this department."
      );
    }

    const course = await courseRepository.update(numericId, {
      name: validatedFields.name,
      departmentId: validatedFields.departmentId,
    });

    if (!course) {
      return fail("Failed to update course.");
    }

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${id}/edit`);
    return ok(course);
  } catch (error) {
    console.error("Error updating course:", error);
    return fromZodError(error, "Something went wrong. Please try again.");
  }
}

// Delete a course
export async function deleteCourse(id: string) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "course ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if course exists
    const existingCourse = await courseRepository.findById(numericId);
    if (!existingCourse) {
      return fail("Course not found.");
    }

    // Check if course is associated with any questions
    const questionCount = await courseRepository.getQuestionCount(numericId);

    if (questionCount > 0) {
      return fail("Cannot delete course that is associated with questions.");
    }

    const deleted = await courseRepository.delete(numericId);
    if (!deleted) {
      return fail("Failed to delete course.");
    }

    revalidatePath("/admin/courses");
    return ok();
  } catch (error) {
    console.error("Error deleting course:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get a single course by ID
export async function getCourse(id: string) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const parsed = parseNumericId(id, "course ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    const course = await courseRepository.findById(numericId);

    if (!course) {
      return fail("Course not found");
    }

    return ok(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get paginated courses with optional search
export async function getPaginatedCourses(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const result = await courseRepository.findManyWithDetails({
      page,
      pageSize,
      search,
    });

    return ok({
      courses: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Migrate questions from one course to another
export async function migrateCourseQuestions(fromId: string, toId: string) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const fromParsed = parseNumericId(fromId, "from course ID");
    if (!fromParsed.success) return fail(fromParsed.error);
    const toParsed = parseNumericId(toId, "to course ID");
    if (!toParsed.success) return fail(toParsed.error);
    const fromIdNumeric = fromParsed.data!;
    const toIdNumeric = toParsed.data!;

    // Check if both courses exist
    const [fromCourse, toCourse] = await Promise.all([
      courseRepository.findById(fromIdNumeric),
      courseRepository.findById(toIdNumeric),
    ]);

    if (!fromCourse || !toCourse) {
      return fail("One or both courses not found.");
    }

    // Migrate questions
    const migratedCount = await courseRepository.migrateQuestions(
      fromIdNumeric,
      toIdNumeric
    );

    revalidatePath("/admin/courses");
    return ok<{ migratedCount: number }>({ migratedCount });
  } catch (error) {
    console.error("Error migrating course questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get all courses for migration dropdown
export async function getAllUserCourses() {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const allCourses = await courseRepository.findAllWithDetails();

    return ok(allCourses);
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get departments for dropdown
export async function getDepartmentsForDropdown() {
  try {
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;

    const allDepartments = await departmentRepository.findAllWithQuestionCounts();

    return ok(allDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return fail("Something went wrong. Please try again.");
  }
}
