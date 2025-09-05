"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { users, questions } from "@/db/schema";
import {
    userFormSchema,
    type UserFormValues,
} from "./schemas/user";
import { eq, and, ne, count, asc, desc, sql } from "drizzle-orm";
// permission checks handled by ensurePermission helper
import {
    ensurePermission,
    getPaginationMeta,
    ok,
    fail,
    fromZodError,
} from "@/lib/action-utils";

// Create a new user
export async function createUser(values: UserFormValues) {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = userFormSchema.parse(values);

        // Check if user with same email or username already exists (case insensitive)
        const existingUser = await db
            .select()
            .from(users)
            .where(
                sql`LOWER(${users.email}) = LOWER(${validatedFields.email}) OR LOWER(${users.username}) = LOWER(${validatedFields.username})`
            )
            .limit(1);

        if (existingUser.length > 0) {
            const existingEmail = existingUser.find(user =>
                user.email.toLowerCase() === validatedFields.email.toLowerCase()
            );
            const existingUsername = existingUser.find(user =>
                user.username.toLowerCase() === validatedFields.username.toLowerCase()
            );

            if (existingEmail) {
                return fail("A user with this email already exists.");
            }
            if (existingUsername) {
                return fail("A user with this username already exists.");
            }
        }

        // Generate a unique ID for the user
        const userId = crypto.randomUUID();

        const [user] = await db.insert(users).values({
            id: userId,
            name: validatedFields.name,
            email: validatedFields.email,
            username: validatedFields.username,
            emailVerified: validatedFields.emailVerified,
        }).returning();

        revalidatePath("/admin/users");
        return ok(user);
    } catch (error) {
        console.error("Error creating user:", error);
        return fromZodError(error, "Something went wrong. Please try again.");
    }
}

// Update an existing user
export async function updateUser(
    id: string,
    values: UserFormValues
) {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const validatedFields = userFormSchema.parse(values);

        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (existingUser.length === 0) {
            return fail("User not found.");
        }

        // Check if another user with the same email or username exists (except this one)
        const duplicateUser = await db
            .select()
            .from(users)
            .where(
                and(
                    sql`(LOWER(${users.email}) = LOWER(${validatedFields.email}) OR LOWER(${users.username}) = LOWER(${validatedFields.username}))`,
                    ne(users.id, id)
                )
            )
            .limit(1);

        if (duplicateUser.length > 0) {
            const duplicateEmail = duplicateUser.find(user =>
                user.email.toLowerCase() === validatedFields.email.toLowerCase()
            );
            const duplicateUsername = duplicateUser.find(user =>
                user.username.toLowerCase() === validatedFields.username.toLowerCase()
            );

            if (duplicateEmail) {
                return fail("Another user with this email already exists.");
            }
            if (duplicateUsername) {
                return fail("Another user with this username already exists.");
            }
        }

        await db
            .update(users)
            .set({
                name: validatedFields.name,
                email: validatedFields.email,
                username: validatedFields.username,
                emailVerified: validatedFields.emailVerified,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id));

        // Fetch the updated user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        revalidatePath("/admin/users");
        revalidatePath(`/admin/users/${id}/edit`);
        return ok(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return fromZodError(error, "Something went wrong. Please try again.");
    }
}

// Delete a user
export async function deleteUser(id: string) {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        // Check if user exists
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (existingUser.length === 0) {
            return fail("User not found.");
        }

        // Check if user is associated with any questions
        const associatedQuestions = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.userId, id));

        if (associatedQuestions[0].count > 0) {
            return fail(
                "Cannot delete user that has submitted questions."
            );
        }

        await db.delete(users).where(eq(users.id, id));

        revalidatePath("/admin/users");
        return ok();
    } catch (error) {
        console.error("Error deleting user:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get a single user by ID
export async function getUser(id: string) {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (user.length === 0) {
            return fail("User not found");
        }

        return ok(user[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get paginated users with optional search and sorting
export async function getPaginatedUsers(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
) {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const skip = (page - 1) * pageSize;

        // Build where conditions
        const whereCondition = search
            ? sql`(LOWER(${users.name}) LIKE LOWER(${"%" + search + "%"}) OR LOWER(${users.email}) LIKE LOWER(${"%" + search + "%"}) OR LOWER(${users.username}) LIKE LOWER(${"%" + search + "%"}))`
            : undefined;

        // Build order by conditions
        const getOrderByClause = () => {
            const direction = sortOrder === 'desc' ? desc : asc;

            switch (sortBy) {
                case 'name':
                    return direction(users.name);
                case 'email':
                    return direction(users.email);
                case 'username':
                    return direction(users.username);
                case 'emailVerified':
                    return direction(users.emailVerified);
                case 'createdAt':
                    return direction(users.createdAt);
                case 'questionCount':
                    return direction(count(questions.id));
                default:
                    return desc(users.createdAt); // Default sort by creation date descending
            }
        };

        // Execute the queries
        const [usersResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    username: users.username,
                    emailVerified: users.emailVerified,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                    questionCount: count(questions.id),
                })
                .from(users)
                .leftJoin(questions, eq(users.id, questions.userId))
                .where(whereCondition)
                .groupBy(users.id, users.name, users.email, users.username, users.emailVerified, users.createdAt, users.updatedAt)
                .orderBy(getOrderByClause())
                .limit(pageSize)
                .offset(skip),

            db.select({ count: count() }).from(users).where(whereCondition),
        ]);

        // Calculate pagination info
        const totalCount = totalCountResult[0].count;
        return ok({
            users: usersResult,
            pagination: getPaginationMeta(totalCount, page, pageSize),
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Migrate questions from one user to another
export async function migrateUserQuestions(fromId: string, toId: string) {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        // Check if both users exist
        const [fromUser, toUser] = await Promise.all([
            db
                .select()
                .from(users)
                .where(eq(users.id, fromId))
                .limit(1),
            db
                .select()
                .from(users)
                .where(eq(users.id, toId))
                .limit(1),
        ]);

        if (fromUser.length === 0 || toUser.length === 0) {
            return fail("One or both users not found.");
        }

        // Count questions to be migrated
        const [questionCount] = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.userId, fromId));

        if (questionCount.count === 0) {
            return ok<{ migratedCount: number }>({ migratedCount: 0 });
        }

        // Migrate questions
        await db
            .update(questions)
            .set({ userId: toId })
            .where(eq(questions.userId, fromId));

        revalidatePath("/admin/users");
        return ok<{ migratedCount: number }>({
            migratedCount: questionCount.count,
        });
    } catch (error) {
        console.error("Error migrating user questions:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get all users for migration dropdown
export async function getAllUsers() {
    try {
        // Check if the user has permission to manage users
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const allUsers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                username: users.username,
                questionCount: count(questions.id),
            })
            .from(users)
            .leftJoin(questions, eq(users.id, questions.userId))
            .groupBy(users.id, users.name, users.email, users.username)
            .orderBy(asc(users.name));

        return ok(allUsers);
    } catch (error) {
        console.error("Error fetching all users:", error);
        return fail("Something went wrong. Please try again.");
    }
}
