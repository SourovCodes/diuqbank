"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { courses, questions, departments } from "@/db/schema";
import {
    courseFormSchema,
    type CourseFormValues,
} from "./schemas/course";
import { eq, and, ne, count, asc, desc, sql } from "drizzle-orm";
// permission checks handled by ensurePermission helper
import {
    ensurePermission,
    getPaginationMeta,
    parseNumericId,
    ok,
    fail,
    fromZodError,
} from "@/lib/action-utils";

// Create a new course
export async function createCourse(values: CourseFormValues) {
    try {
        // Check if the user has permission to manage courses
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = courseFormSchema.parse(values);

        // Check if course with same name already exists in the same department
        const existingCourse = await db
            .select()
            .from(courses)
            .where(
                and(
                    sql`LOWER(${courses.name}) = LOWER(${validatedFields.name})`,
                    eq(courses.departmentId, validatedFields.departmentId)
                )
            )
            .limit(1);

        if (existingCourse.length > 0) {
            return fail("A course with this name already exists in this department.");
        }

        const [course] = await db.insert(courses).values({
            name: validatedFields.name,
            departmentId: validatedFields.departmentId,
        }).returning();

        revalidatePath("/admin/courses");
        return ok(course);
    } catch (error) {
        console.error("Error creating course:", error);
        return fromZodError(error, "Something went wrong. Please try again.");
    }
}

// Update an existing course
export async function updateCourse(
    id: string,
    values: CourseFormValues
) {
    try {
        // Check if the user has permission to manage courses
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = courseFormSchema.parse(values);
        const parsed = parseNumericId(id, "course ID");
        if (!parsed.success) return fail(String(parsed.error));
        const numericId = parsed.data!;

        // Check if course exists
        const existingCourse = await db
            .select()
            .from(courses)
            .where(eq(courses.id, numericId))
            .limit(1);

        if (existingCourse.length === 0) {
            return fail("Course not found.");
        }

        // Check if another course with the same name exists in the same department (except this one)
        const duplicateName = await db
            .select()
            .from(courses)
            .where(
                and(
                    sql`LOWER(${courses.name}) = LOWER(${validatedFields.name})`,
                    eq(courses.departmentId, validatedFields.departmentId),
                    ne(courses.id, numericId)
                )
            )
            .limit(1);

        if (duplicateName.length > 0) {
            return fail(
                "Another course with this name already exists in this department."
            );
        }

        await db
            .update(courses)
            .set({
                name: validatedFields.name,
                departmentId: validatedFields.departmentId,
            })
            .where(eq(courses.id, numericId));

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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "course ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        // Check if course exists
        const existingCourse = await db
            .select()
            .from(courses)
            .where(eq(courses.id, numericId))
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
            return fail(
                "Cannot delete course that is associated with questions."
            );
        }

        await db.delete(courses).where(eq(courses.id, numericId));

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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "course ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        const course = await db
            .select({
                id: courses.id,
                name: courses.name,
                departmentId: courses.departmentId,
                createdAt: courses.createdAt,
                updatedAt: courses.updatedAt,
            })
            .from(courses)
            .where(eq(courses.id, numericId))
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

// Get paginated courses with optional search and sorting
export async function getPaginatedCourses(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
) {
    try {
        // Check if the user has permission to manage courses
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const skip = (page - 1) * pageSize;

        // Build where conditions
        const whereCondition = search
            ? sql`(LOWER(${courses.name}) LIKE LOWER(${"%" + search + "%"
                }) OR LOWER(${departments.name}) LIKE LOWER(${"%" + search + "%"
                }))`
            : undefined;

        // Build order by conditions
        const getOrderByClause = () => {
            const direction = sortOrder === 'desc' ? desc : asc;

            switch (sortBy) {
                case 'name':
                    return direction(courses.name);
                case 'departmentName':
                    return direction(departments.name);
                case 'questionCount':
                    return direction(count(questions.id));
                default:
                    return asc(courses.name); // Default sort by name ascending
            }
        };

        // Execute the queries
        const [coursesResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: courses.id,
                    name: courses.name,
                    departmentId: courses.departmentId,
                    departmentName: departments.name,
                    departmentShortName: departments.shortName,
                    questionCount: count(questions.id),
                })
                .from(courses)
                .leftJoin(departments, eq(courses.departmentId, departments.id))
                .leftJoin(questions, eq(courses.id, questions.courseId))
                .where(whereCondition)
                .groupBy(courses.id, courses.name, courses.departmentId, departments.name, departments.shortName)
                .orderBy(getOrderByClause())
                .limit(pageSize)
                .offset(skip),

            db.select({ count: count() }).from(courses)
                .leftJoin(departments, eq(courses.departmentId, departments.id))
                .where(whereCondition),
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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const fromParsed = parseNumericId(fromId, "from course ID");
        if (!fromParsed.success) return fail(fromParsed.error);
        const toParsed = parseNumericId(toId, "to course ID");
        if (!toParsed.success) return fail(toParsed.error);
        const fromIdNumeric = fromParsed.data!;
        const toIdNumeric = toParsed.data!;

        // Check if both courses exist
        const [fromCourse, toCourse] = await Promise.all([
            db
                .select()
                .from(courses)
                .where(eq(courses.id, fromIdNumeric))
                .limit(1),
            db
                .select()
                .from(courses)
                .where(eq(courses.id, toIdNumeric))
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

// Get all courses for migration dropdown
export async function getAllCourses() {
    try {
        // Check if the user has permission to manage courses
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const allCourses = await db
            .select({
                id: courses.id,
                name: courses.name,
                departmentName: departments.name,
                questionCount: count(questions.id),
            })
            .from(courses)
            .leftJoin(departments, eq(courses.departmentId, departments.id))
            .leftJoin(questions, eq(courses.id, questions.courseId))
            .groupBy(courses.id, courses.name, departments.name)
            .orderBy(asc(departments.name), asc(courses.name));

        return ok(allCourses);
    } catch (error) {
        console.error("Error fetching all courses:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get all departments for course form dropdown
export async function getAllDepartmentsForCourses() {
    try {
        // Check if the user has permission to manage courses
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const allDepartments = await db
            .select({
                id: departments.id,
                name: departments.name,
                shortName: departments.shortName,
            })
            .from(departments)
            .orderBy(asc(departments.name));

        return ok(allDepartments);
    } catch (error) {
        console.error("Error fetching departments for courses:", error);
        return fail("Something went wrong. Please try again.");
    }
}
