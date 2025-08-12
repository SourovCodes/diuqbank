"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/drizzle";
import { semesters, questions } from "@/db/schema";
import {
    semesterFormSchema,
    type SemesterFormValues,
} from "./schemas/semester";
import { eq, and, ne, count, asc, sql } from "drizzle-orm";
import { hasPermission } from "@/lib/authorization";
import { auth } from "@/lib/auth";

// Create a new semester
export async function createSemester(values: SemesterFormValues) {
    try {
        // Check if the user has permission to manage semesters
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const validatedFields = semesterFormSchema.parse(values);

        // Check if semester with same name already exists for this user (case insensitive)
        const existingSemester = await db
            .select()
            .from(semesters)
            .where(
                and(
                    sql`LOWER(${semesters.name}) = LOWER(${validatedFields.name})`,
                    eq(semesters.userId, session.user.id)
                )
            )
            .limit(1);

        if (existingSemester.length > 0) {
            return {
                success: false,
                error: "A semester with this name already exists.",
            };
        }

        const [insertResult] = await db.insert(semesters).values({
            name: validatedFields.name,
            userId: session.user.id,
        });

        // Fetch the created semester
        const [semester] = await db
            .select()
            .from(semesters)
            .where(eq(semesters.id, insertResult.insertId))
            .limit(1);

        revalidatePath("/admin/semesters");
        return { success: true, data: semester };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.flatten().fieldErrors };
        }

        console.error("Error creating semester:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Update an existing semester
export async function updateSemester(id: string, values: SemesterFormValues) {
    try {
        // Check if the user has permission to manage semesters
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const validatedFields = semesterFormSchema.parse(values);
        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return {
                success: false,
                error: "Invalid semester ID.",
            };
        }

        // Check if semester exists and belongs to the user
        const existingSemester = await db
            .select()
            .from(semesters)
            .where(
                and(
                    eq(semesters.id, numericId),
                    eq(semesters.userId, session.user.id)
                )
            )
            .limit(1);

        if (existingSemester.length === 0) {
            return {
                success: false,
                error: "Semester not found.",
            };
        }

        // Check if another semester with the same name exists for this user (except this one)
        const duplicateName = await db
            .select()
            .from(semesters)
            .where(
                and(
                    sql`LOWER(${semesters.name}) = LOWER(${validatedFields.name})`,
                    eq(semesters.userId, session.user.id),
                    ne(semesters.id, numericId)
                )
            )
            .limit(1);

        if (duplicateName.length > 0) {
            return {
                success: false,
                error: "Another semester with this name already exists.",
            };
        }

        await db
            .update(semesters)
            .set({ name: validatedFields.name })
            .where(
                and(
                    eq(semesters.id, numericId),
                    eq(semesters.userId, session.user.id)
                )
            );

        // Fetch the updated semester
        const [semester] = await db
            .select()
            .from(semesters)
            .where(eq(semesters.id, numericId))
            .limit(1);

        revalidatePath("/admin/semesters");
        revalidatePath(`/admin/semesters/${id}/edit`);
        return { success: true, data: semester };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.flatten().fieldErrors };
        }

        console.error("Error updating semester:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Delete a semester
export async function deleteSemester(id: string) {
    try {
        // Check if the user has permission to manage semesters
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return {
                success: false,
                error: "Invalid semester ID.",
            };
        }

        // Check if semester exists and belongs to the user
        const existingSemester = await db
            .select()
            .from(semesters)
            .where(
                and(
                    eq(semesters.id, numericId),
                    eq(semesters.userId, session.user.id)
                )
            )
            .limit(1);

        if (existingSemester.length === 0) {
            return {
                success: false,
                error: "Semester not found.",
            };
        }

        // Check if semester is associated with any questions
        const associatedQuestions = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.semesterId, numericId));

        if (associatedQuestions[0].count > 0) {
            return {
                success: false,
                error: "Cannot delete semester that is associated with questions.",
            };
        }

        await db
            .delete(semesters)
            .where(
                and(
                    eq(semesters.id, numericId),
                    eq(semesters.userId, session.user.id)
                )
            );

        revalidatePath("/admin/semesters");
        return { success: true };
    } catch (error) {
        console.error("Error deleting semester:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Get a single semester by ID
export async function getSemester(id: string) {
    try {
        // Check if the user has permission to manage semesters
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const numericId = parseInt(id);

        if (isNaN(numericId)) {
            return {
                success: false,
                error: "Invalid semester ID.",
            };
        }

        const semester = await db
            .select()
            .from(semesters)
            .where(
                and(
                    eq(semesters.id, numericId),
                    eq(semesters.userId, session.user.id)
                )
            )
            .limit(1);

        if (semester.length === 0) {
            return { success: false, error: "Semester not found" };
        }

        return { success: true, data: semester[0] };
    } catch (error) {
        console.error("Error fetching semester:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
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
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const skip = (page - 1) * pageSize;

        // Build where conditions - only show user's own semesters
        const baseCondition = eq(semesters.userId, session.user.id);
        const whereCondition = search
            ? and(
                baseCondition,
                sql`LOWER(${semesters.name}) LIKE LOWER(${"%" + search + "%"})`
            )
            : baseCondition;

        // Execute the queries
        const [semestersResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: semesters.id,
                    name: semesters.name,
                    questionCount: count(questions.id),
                })
                .from(semesters)
                .leftJoin(questions, eq(semesters.id, questions.semesterId))
                .where(whereCondition)
                .groupBy(semesters.id, semesters.name)
                .orderBy(asc(semesters.name))
                .limit(pageSize)
                .offset(skip),

            db.select({ count: count() }).from(semesters).where(whereCondition),
        ]);

        // Calculate pagination info
        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            success: true,
            data: {
                semesters: semestersResult,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    pageSize,
                },
            },
        };
    } catch (error) {
        console.error("Error fetching semesters:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Migrate questions from one semester to another
export async function migrateSemesterQuestions(fromId: string, toId: string) {
    try {
        // Check if the user has permission to manage semesters
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const fromIdNumeric = parseInt(fromId);
        const toIdNumeric = parseInt(toId);

        if (isNaN(fromIdNumeric) || isNaN(toIdNumeric)) {
            return {
                success: false,
                error: "Invalid semester IDs.",
            };
        }

        // Check if both semesters exist and belong to the user
        const [fromSemester, toSemester] = await Promise.all([
            db
                .select()
                .from(semesters)
                .where(
                    and(
                        eq(semesters.id, fromIdNumeric),
                        eq(semesters.userId, session.user.id)
                    )
                )
                .limit(1),
            db
                .select()
                .from(semesters)
                .where(
                    and(
                        eq(semesters.id, toIdNumeric),
                        eq(semesters.userId, session.user.id)
                    )
                )
                .limit(1),
        ]);

        if (fromSemester.length === 0 || toSemester.length === 0) {
            return {
                success: false,
                error: "One or both semesters not found.",
            };
        }

        // Count questions to be migrated
        const [questionCount] = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.semesterId, fromIdNumeric));

        if (questionCount.count === 0) {
            return {
                success: true,
                migratedCount: 0,
            };
        }

        // Migrate questions
        await db
            .update(questions)
            .set({ semesterId: toIdNumeric })
            .where(eq(questions.semesterId, fromIdNumeric));

        revalidatePath("/admin/semesters");
        return {
            success: true,
            migratedCount: questionCount.count,
        };
    } catch (error) {
        console.error("Error migrating semester questions:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
}

// Get all user's semesters for migration dropdown
export async function getAllUserSemesters() {
    try {
        // Check if the user has permission to manage semesters
        if (!(await hasPermission("SEMESTERS:MANAGE"))) {
            return { success: false, error: "Unauthorized" };
        }

        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const allSemesters = await db
            .select({
                id: semesters.id,
                name: semesters.name,
                questionCount: count(questions.id),
            })
            .from(semesters)
            .leftJoin(questions, eq(semesters.id, questions.semesterId))
            .where(eq(semesters.userId, session.user.id))
            .groupBy(semesters.id, semesters.name)
            .orderBy(asc(semesters.name));

        return {
            success: true,
            data: allSemesters,
        };
    } catch (error) {
        console.error("Error fetching all semesters:", error);
        return {
            success: false,
            error: "Something went wrong. Please try again.",
        };
    }
} 