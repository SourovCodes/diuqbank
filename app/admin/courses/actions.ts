"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { courses, questions, users } from "@/db/schema";
import { courseFormSchema, type CourseFormValues } from "./schemas/course";
import { eq, and, ne, count, asc, sql } from "drizzle-orm";
// permission handled by ensurePermission helper
import {
  ensurePermission,
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
  fromZodError,
} from "@/lib/action-utils";
// auth is provided via ensurePermission result

// Create a new course
export async function createCourse(values: CourseFormValues) {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const validatedFields = courseFormSchema.parse(values);

    // Check if course with same name already exists globally (case insensitive)
    const existingCourse = await db
      .select()
      .from(courses)
      .where(sql`LOWER(${courses.name}) = LOWER(${validatedFields.name})`)
      .limit(1);

    if (existingCourse.length > 0) {
      return fail("A course with this name already exists.");
    }

    const [insertResult] = await db.insert(courses).values({
      name: validatedFields.name,
      userId: session.user.id,
    });

    // Fetch the created course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, insertResult.insertId))
      .limit(1);

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
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const validatedFields = courseFormSchema.parse(values);
    const parsed = parseNumericId(id, "course ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if course exists and belongs to the user
    const existingCourse = await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.id, numericId), eq(courses.userId, session.user.id))
      )
      .limit(1);

    if (existingCourse.length === 0) {
      return fail("Course not found.");
    }

    // Check if another course with the same name exists globally (except this one)
    const duplicateName = await db
      .select()
      .from(courses)
      .where(
        and(
          sql`LOWER(${courses.name}) = LOWER(${validatedFields.name})`,
          ne(courses.id, numericId)
        )
      )
      .limit(1);

    if (duplicateName.length > 0) {
      return fail("Another course with this name already exists.");
    }

    await db
      .update(courses)
      .set({ name: validatedFields.name })
      .where(
        and(eq(courses.id, numericId), eq(courses.userId, session.user.id))
      );

    // Fetch the updated course
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, numericId))
      .limit(1);

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
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const parsed = parseNumericId(id, "course ID");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    // Check if course exists and belongs to the user
    const existingCourse = await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.id, numericId), eq(courses.userId, session.user.id))
      )
      .limit(1);

    if (existingCourse.length === 0) {
      return fail("Course not found.");
    }

    // Check if course is associated with any questions
    const associatedQuestions = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.courseId, numericId));

    if (associatedQuestions[0].count > 0) {
      return fail("Cannot delete course that is associated with questions.");
    }

    await db
      .delete(courses)
      .where(
        and(eq(courses.id, numericId), eq(courses.userId, session.user.id))
      );

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
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return fail("Invalid course ID.");
    }

    const course = await db
      .select()
      .from(courses)
      .where(
        and(eq(courses.id, numericId), eq(courses.userId, session.user.id))
      )
      .limit(1);

    if (course.length === 0) {
      return fail("Course not found");
    }

    return ok(course[0]);
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
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const skip = (page - 1) * pageSize;

    // Build where conditions - only show user's own courses
    const baseCondition = eq(courses.userId, session.user.id);
    const whereCondition = search
      ? and(
          baseCondition,
          sql`LOWER(${courses.name}) LIKE LOWER(${"%" + search + "%"})`
        )
      : baseCondition;

    // Execute the queries
    const [coursesResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: courses.id,
          name: courses.name,
          questionCount: count(questions.id),
          createdBy: users.name,
        })
        .from(courses)
        .leftJoin(questions, eq(courses.id, questions.courseId))
        .leftJoin(users, eq(courses.userId, users.id))
        .where(whereCondition)
        .groupBy(courses.id, courses.name, users.name)
        .orderBy(asc(courses.name))
        .limit(pageSize)
        .offset(skip),

      db.select({ count: count() }).from(courses).where(whereCondition),
    ]);

    // Calculate pagination info
    const totalCount = totalCountResult[0].count;
    return ok({
      courses: coursesResult,
      pagination: getPaginationMeta(totalCount, page, pageSize),
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
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const fromIdNumeric = parseInt(fromId);
    const toIdNumeric = parseInt(toId);

    if (isNaN(fromIdNumeric) || isNaN(toIdNumeric)) {
      return fail("Invalid course IDs.");
    }

    // Check if both courses exist and belong to the user
    const [fromCourse, toCourse] = await Promise.all([
      db
        .select()
        .from(courses)
        .where(
          and(
            eq(courses.id, fromIdNumeric),
            eq(courses.userId, session.user.id)
          )
        )
        .limit(1),
      db
        .select()
        .from(courses)
        .where(
          and(eq(courses.id, toIdNumeric), eq(courses.userId, session.user.id))
        )
        .limit(1),
    ]);

    if (fromCourse.length === 0 || toCourse.length === 0) {
      return fail("One or both courses not found.");
    }

    // Count questions to be migrated
    const [questionCount] = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.courseId, fromIdNumeric));

    if (questionCount.count === 0) {
      return ok<{ migratedCount: number }>({ migratedCount: 0 });
    }

    // Migrate questions
    await db
      .update(questions)
      .set({ courseId: toIdNumeric })
      .where(eq(questions.courseId, fromIdNumeric));

    revalidatePath("/admin/courses");
    return ok<{ migratedCount: number }>({
      migratedCount: questionCount.count,
    });
  } catch (error) {
    console.error("Error migrating course questions:", error);
    return fail("Something went wrong. Please try again.");
  }
}

// Get all user's courses for migration dropdown
export async function getAllUserCourses() {
  try {
    // Check if the user has permission to manage courses
    const perm = await ensurePermission("COURSES:MANAGE");
    if (!perm.success) return perm;
    const session = perm.session;
    // Authentication check is redundant, relying on ensurePermission

    const allCourses = await db
      .select({
        id: courses.id,
        name: courses.name,
        questionCount: count(questions.id),
      })
      .from(courses)
      .leftJoin(questions, eq(courses.id, questions.courseId))
      .where(eq(courses.userId, session.user.id))
      .groupBy(courses.id, courses.name)
      .orderBy(asc(courses.name));

    return ok(allCourses);
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return fail("Something went wrong. Please try again.");
  }
}
