"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { examTypes, questions } from "@/db/schema";
import {
    examTypeFormSchema,
    type ExamTypeFormValues,
} from "./schemas/examtype";
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

// Create a new exam type
export async function createExamType(values: ExamTypeFormValues) {
    try {
        // Check if the user has permission to manage exam types
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = examTypeFormSchema.parse(values);

        // Check if exam type with same name already exists (case insensitive)
        const existingExamType = await db
            .select()
            .from(examTypes)
            .where(
                sql`LOWER(${examTypes.name}) = LOWER(${validatedFields.name})`
            )
            .limit(1);

        if (existingExamType.length > 0) {
            return fail("An exam type with this name already exists.");
        }

        const [examType] = await db.insert(examTypes).values({
            name: validatedFields.name,
            requiresSection: validatedFields.requiresSection,
            order: validatedFields.order,
        }).returning();

        revalidatePath("/admin/exam-types");
        return ok(examType);
    } catch (error) {
        console.error("Error creating exam type:", error);
        return fromZodError(error, "Something went wrong. Please try again.");
    }
}

// Update an existing exam type
export async function updateExamType(
    id: string,
    values: ExamTypeFormValues
) {
    try {
        // Check if the user has permission to manage exam types
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = examTypeFormSchema.parse(values);
        const parsed = parseNumericId(id, "exam type ID");
        if (!parsed.success) return fail(String(parsed.error));
        const numericId = parsed.data!;

        // Check if exam type exists
        const existingExamType = await db
            .select()
            .from(examTypes)
            .where(eq(examTypes.id, numericId))
            .limit(1);

        if (existingExamType.length === 0) {
            return fail("Exam type not found.");
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
            return fail(
                "Another exam type with this name already exists."
            );
        }

        await db
            .update(examTypes)
            .set({
                name: validatedFields.name,
                requiresSection: validatedFields.requiresSection,
                order: validatedFields.order,
            })
            .where(eq(examTypes.id, numericId));

        // Fetch the updated exam type
        const [examType] = await db
            .select()
            .from(examTypes)
            .where(eq(examTypes.id, numericId))
            .limit(1);

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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "exam type ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        // Check if exam type exists
        const existingExamType = await db
            .select()
            .from(examTypes)
            .where(eq(examTypes.id, numericId))
            .limit(1);

        if (existingExamType.length === 0) {
            return fail("Exam type not found.");
        }

        // Check if exam type is associated with any questions
        const associatedQuestions = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.examTypeId, numericId));

        if (associatedQuestions[0].count > 0) {
            return fail(
                "Cannot delete exam type that is associated with questions."
            );
        }

        await db.delete(examTypes).where(eq(examTypes.id, numericId));

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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "exam type ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        const examType = await db
            .select()
            .from(examTypes)
            .where(eq(examTypes.id, numericId))
            .limit(1);

        if (examType.length === 0) {
            return fail("Exam type not found");
        }

        return ok(examType[0]);
    } catch (error) {
        console.error("Error fetching exam type:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get paginated exam types with optional search and sorting
export async function getPaginatedExamTypes(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
) {
    try {
        // Check if the user has permission to manage exam types
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const skip = (page - 1) * pageSize;

        // Build where conditions
        const whereCondition = search
            ? sql`LOWER(${examTypes.name}) LIKE LOWER(${"%" + search + "%"})`
            : undefined;

        // Build order by conditions
        const getOrderByClause = () => {
            const direction = sortOrder === 'desc' ? desc : asc;

            switch (sortBy) {
                case 'name':
                    return direction(examTypes.name);
                case 'requiresSection':
                    return direction(examTypes.requiresSection);
                case 'order':
                    return direction(examTypes.order);
                case 'questionCount':
                    return direction(count(questions.id));
                default:
                    return asc(examTypes.order); // Default sort by order ascending
            }
        };

        // Execute the queries
        const [examTypesResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: examTypes.id,
                    name: examTypes.name,
                    requiresSection: examTypes.requiresSection,
                    order: examTypes.order,
                    questionCount: count(questions.id),
                })
                .from(examTypes)
                .leftJoin(questions, eq(examTypes.id, questions.examTypeId))
                .where(whereCondition)
                .groupBy(examTypes.id, examTypes.name, examTypes.requiresSection, examTypes.order)
                .orderBy(getOrderByClause())
                .limit(pageSize)
                .offset(skip),

            db.select({ count: count() }).from(examTypes).where(whereCondition),
        ]);

        // Calculate pagination info
        const totalCount = totalCountResult[0].count;
        return ok({
            examTypes: examTypesResult,
            pagination: getPaginationMeta(totalCount, page, pageSize),
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
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const fromParsed = parseNumericId(fromId, "from exam type ID");
        if (!fromParsed.success) return fail(fromParsed.error);
        const toParsed = parseNumericId(toId, "to exam type ID");
        if (!toParsed.success) return fail(toParsed.error);
        const fromIdNumeric = fromParsed.data!;
        const toIdNumeric = toParsed.data!;

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
            return fail("One or both exam types not found.");
        }

        // Count questions to be migrated
        const [questionCount] = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.examTypeId, fromIdNumeric));

        if (questionCount.count === 0) {
            return ok<{ migratedCount: number }>({ migratedCount: 0 });
        }

        // Migrate questions
        await db
            .update(questions)
            .set({ examTypeId: toIdNumeric })
            .where(eq(questions.examTypeId, fromIdNumeric));

        revalidatePath("/admin/exam-types");
        return ok<{ migratedCount: number }>({
            migratedCount: questionCount.count,
        });
    } catch (error) {
        console.error("Error migrating exam type questions:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get all exam types for migration dropdown
export async function getAllExamTypes() {
    try {
        // Check if the user has permission to manage exam types
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const allExamTypes = await db
            .select({
                id: examTypes.id,
                name: examTypes.name,
                questionCount: count(questions.id),
            })
            .from(examTypes)
            .leftJoin(questions, eq(examTypes.id, questions.examTypeId))
            .groupBy(examTypes.id, examTypes.name)
            .orderBy(asc(examTypes.order));

        return ok(allExamTypes);
    } catch (error) {
        console.error("Error fetching all exam types:", error);
        return fail("Something went wrong. Please try again.");
    }
}
