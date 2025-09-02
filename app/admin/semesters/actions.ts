"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { semesters, questions } from "@/db/schema";
import {
    semesterFormSchema,
    type SemesterFormValues,
} from "./schemas/semester";
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

// Create a new semester
export async function createSemester(values: SemesterFormValues) {
    try {
        // Check if the user has permission to manage semesters
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = semesterFormSchema.parse(values);

        // Check if semester with same name already exists (case insensitive)
        const existingSemester = await db
            .select()
            .from(semesters)
            .where(
                sql`LOWER(${semesters.name}) = LOWER(${validatedFields.name})`
            )
            .limit(1);

        if (existingSemester.length > 0) {
            return fail("A semester with this name already exists.");
        }

        const [semester] = await db.insert(semesters).values({
            name: validatedFields.name,
            order: validatedFields.order,
        }).returning();

        revalidatePath("/admin/semesters");
        return ok(semester);
    } catch (error) {
        console.error("Error creating semester:", error);
        return fromZodError(error, "Something went wrong. Please try again.");
    }
}

// Update an existing semester
export async function updateSemester(
    id: string,
    values: SemesterFormValues
) {
    try {
        // Check if the user has permission to manage semesters
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = semesterFormSchema.parse(values);
        const parsed = parseNumericId(id, "semester ID");
        if (!parsed.success) return fail(String(parsed.error));
        const numericId = parsed.data!;

        // Check if semester exists
        const existingSemester = await db
            .select()
            .from(semesters)
            .where(eq(semesters.id, numericId))
            .limit(1);

        if (existingSemester.length === 0) {
            return fail("Semester not found.");
        }

        // Check if another semester with the same name exists (except this one)
        const duplicateName = await db
            .select()
            .from(semesters)
            .where(
                and(
                    sql`LOWER(${semesters.name}) = LOWER(${validatedFields.name})`,
                    ne(semesters.id, numericId)
                )
            )
            .limit(1);

        if (duplicateName.length > 0) {
            return fail(
                "Another semester with this name already exists."
            );
        }

        await db
            .update(semesters)
            .set({
                name: validatedFields.name,
                order: validatedFields.order,
            })
            .where(eq(semesters.id, numericId));

        // Fetch the updated semester
        const [semester] = await db
            .select()
            .from(semesters)
            .where(eq(semesters.id, numericId))
            .limit(1);

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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "semester ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        // Check if semester exists
        const existingSemester = await db
            .select()
            .from(semesters)
            .where(eq(semesters.id, numericId))
            .limit(1);

        if (existingSemester.length === 0) {
            return fail("Semester not found.");
        }

        // Check if semester is associated with any questions
        const associatedQuestions = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.semesterId, numericId));

        if (associatedQuestions[0].count > 0) {
            return fail(
                "Cannot delete semester that is associated with questions."
            );
        }

        await db.delete(semesters).where(eq(semesters.id, numericId));

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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "semester ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        const semester = await db
            .select()
            .from(semesters)
            .where(eq(semesters.id, numericId))
            .limit(1);

        if (semester.length === 0) {
            return fail("Semester not found");
        }

        return ok(semester[0]);
    } catch (error) {
        console.error("Error fetching semester:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get paginated semesters with optional search and sorting
export async function getPaginatedSemesters(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
) {
    try {
        // Check if the user has permission to manage semesters
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const skip = (page - 1) * pageSize;

        // Build where conditions
        const whereCondition = search
            ? sql`LOWER(${semesters.name}) LIKE LOWER(${"%" + search + "%"})`
            : undefined;

        // Build order by conditions
        const getOrderByClause = () => {
            const direction = sortOrder === 'desc' ? desc : asc;

            switch (sortBy) {
                case 'name':
                    return direction(semesters.name);
                case 'order':
                    return direction(semesters.order);
                case 'questionCount':
                    return direction(count(questions.id));
                default:
                    return asc(semesters.order); // Default sort by order ascending
            }
        };

        // Execute the queries
        const [semestersResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: semesters.id,
                    name: semesters.name,
                    order: semesters.order,
                    questionCount: count(questions.id),
                })
                .from(semesters)
                .leftJoin(questions, eq(semesters.id, questions.semesterId))
                .where(whereCondition)
                .groupBy(semesters.id, semesters.name, semesters.order)
                .orderBy(getOrderByClause())
                .limit(pageSize)
                .offset(skip),

            db.select({ count: count() }).from(semesters).where(whereCondition),
        ]);

        // Calculate pagination info
        const totalCount = totalCountResult[0].count;
        return ok({
            semesters: semestersResult,
            pagination: getPaginationMeta(totalCount, page, pageSize),
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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const fromParsed = parseNumericId(fromId, "from semester ID");
        if (!fromParsed.success) return fail(fromParsed.error);
        const toParsed = parseNumericId(toId, "to semester ID");
        if (!toParsed.success) return fail(toParsed.error);
        const fromIdNumeric = fromParsed.data!;
        const toIdNumeric = toParsed.data!;

        // Check if both semesters exist
        const [fromSemester, toSemester] = await Promise.all([
            db
                .select()
                .from(semesters)
                .where(eq(semesters.id, fromIdNumeric))
                .limit(1),
            db
                .select()
                .from(semesters)
                .where(eq(semesters.id, toIdNumeric))
                .limit(1),
        ]);

        if (fromSemester.length === 0 || toSemester.length === 0) {
            return fail("One or both semesters not found.");
        }

        // Count questions to be migrated
        const [questionCount] = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.semesterId, fromIdNumeric));

        if (questionCount.count === 0) {
            return ok<{ migratedCount: number }>({ migratedCount: 0 });
        }

        // Migrate questions
        await db
            .update(questions)
            .set({ semesterId: toIdNumeric })
            .where(eq(questions.semesterId, fromIdNumeric));

        revalidatePath("/admin/semesters");
        return ok<{ migratedCount: number }>({
            migratedCount: questionCount.count,
        });
    } catch (error) {
        console.error("Error migrating semester questions:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get all semesters for migration dropdown
export async function getAllSemesters() {
    try {
        // Check if the user has permission to manage semesters
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const allSemesters = await db
            .select({
                id: semesters.id,
                name: semesters.name,
                questionCount: count(questions.id),
            })
            .from(semesters)
            .leftJoin(questions, eq(semesters.id, questions.semesterId))
            .groupBy(semesters.id, semesters.name)
            .orderBy(asc(semesters.order));

        return ok(allSemesters);
    } catch (error) {
        console.error("Error fetching all semesters:", error);
        return fail("Something went wrong. Please try again.");
    }
}
