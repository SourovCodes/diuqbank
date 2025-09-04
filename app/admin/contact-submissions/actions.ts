"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { contactSubmissions } from "@/db/schema";
import { eq, desc, asc, sql, count } from "drizzle-orm";
import {
    ensurePermission,
    getPaginationMeta,
    parseNumericId,
    ok,
    fail,
} from "@/lib/action-utils";

// Get paginated contact submissions with optional search and sorting
export async function getPaginatedContactSubmissions(
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
) {
    try {
        // Check if the user has permission to manage contact submissions
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const skip = (page - 1) * pageSize;

        // Build where conditions for search
        const whereCondition = search
            ? sql`(
                LOWER(${contactSubmissions.name}) LIKE LOWER(${"%" + search + "%"}) OR 
                LOWER(${contactSubmissions.email}) LIKE LOWER(${"%" + search + "%"}) OR 
                LOWER(${contactSubmissions.subject}) LIKE LOWER(${"%" + search + "%"}) OR 
                LOWER(${contactSubmissions.message}) LIKE LOWER(${"%" + search + "%"})
            )`
            : undefined;

        // Build order by conditions
        const getOrderByClause = () => {
            const direction = sortOrder === 'desc' ? desc : asc;

            switch (sortBy) {
                case 'name':
                    return direction(contactSubmissions.name);
                case 'email':
                    return direction(contactSubmissions.email);
                case 'subject':
                    return direction(contactSubmissions.subject);
                case 'isRead':
                    return direction(contactSubmissions.isRead);
                case 'createdAt':
                    return direction(contactSubmissions.createdAt);
                default:
                    return desc(contactSubmissions.createdAt); // Default sort by newest first
            }
        };

        // Execute the queries
        const [submissionsResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: contactSubmissions.id,
                    name: contactSubmissions.name,
                    email: contactSubmissions.email,
                    subject: contactSubmissions.subject,
                    message: contactSubmissions.message,
                    isRead: contactSubmissions.isRead,
                    createdAt: contactSubmissions.createdAt,
                    updatedAt: contactSubmissions.updatedAt,
                })
                .from(contactSubmissions)
                .where(whereCondition)
                .orderBy(getOrderByClause())
                .limit(pageSize)
                .offset(skip),

            db.select({ count: count() })
                .from(contactSubmissions)
                .where(whereCondition),
        ]);

        // Calculate pagination info
        const totalCount = totalCountResult[0].count;
        return ok({
            submissions: submissionsResult,
            pagination: getPaginationMeta(totalCount, page, pageSize),
        });
    } catch (error) {
        console.error("Error fetching contact submissions:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get a single contact submission by ID
export async function getContactSubmission(id: string) {
    try {
        // Check if the user has permission to manage contact submissions
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "contact submission ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        const submission = await db
            .select({
                id: contactSubmissions.id,
                name: contactSubmissions.name,
                email: contactSubmissions.email,
                subject: contactSubmissions.subject,
                message: contactSubmissions.message,
                isRead: contactSubmissions.isRead,
                createdAt: contactSubmissions.createdAt,
                updatedAt: contactSubmissions.updatedAt,
            })
            .from(contactSubmissions)
            .where(eq(contactSubmissions.id, numericId))
            .limit(1);

        if (submission.length === 0) {
            return fail("Contact submission not found");
        }

        return ok(submission[0]);
    } catch (error) {
        console.error("Error fetching contact submission:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Mark a contact submission as read
export async function markContactSubmissionAsRead(id: string) {
    try {
        // Check if the user has permission to manage contact submissions
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "contact submission ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        // Check if submission exists
        const existingSubmission = await db
            .select()
            .from(contactSubmissions)
            .where(eq(contactSubmissions.id, numericId))
            .limit(1);

        if (existingSubmission.length === 0) {
            return fail("Contact submission not found.");
        }

        await db
            .update(contactSubmissions)
            .set({
                isRead: true,
                updatedAt: new Date(),
            })
            .where(eq(contactSubmissions.id, numericId));

        revalidatePath("/admin/contact-submissions");
        revalidatePath(`/admin/contact-submissions/${id}`);
        return ok();
    } catch (error) {
        console.error("Error marking contact submission as read:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Mark a contact submission as unread
export async function markContactSubmissionAsUnread(id: string) {
    try {
        // Check if the user has permission to manage contact submissions
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "contact submission ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        // Check if submission exists
        const existingSubmission = await db
            .select()
            .from(contactSubmissions)
            .where(eq(contactSubmissions.id, numericId))
            .limit(1);

        if (existingSubmission.length === 0) {
            return fail("Contact submission not found.");
        }

        await db
            .update(contactSubmissions)
            .set({
                isRead: false,
                updatedAt: new Date(),
            })
            .where(eq(contactSubmissions.id, numericId));

        revalidatePath("/admin/contact-submissions");
        revalidatePath(`/admin/contact-submissions/${id}`);
        return ok();
    } catch (error) {
        console.error("Error marking contact submission as unread:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Delete a contact submission
export async function deleteContactSubmission(id: string) {
    try {
        // Check if the user has permission to manage contact submissions
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const parsed = parseNumericId(id, "contact submission ID");
        if (!parsed.success) return fail(parsed.error);
        const numericId = parsed.data!;

        // Check if submission exists
        const existingSubmission = await db
            .select()
            .from(contactSubmissions)
            .where(eq(contactSubmissions.id, numericId))
            .limit(1);

        if (existingSubmission.length === 0) {
            return fail("Contact submission not found.");
        }

        await db.delete(contactSubmissions).where(eq(contactSubmissions.id, numericId));

        revalidatePath("/admin/contact-submissions");
        return ok();
    } catch (error) {
        console.error("Error deleting contact submission:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Create a new contact submission (for the public form)
export async function createContactSubmission(values: {
    name: string;
    email: string;
    subject: string;
    message: string;
}) {
    try {
        const [submission] = await db.insert(contactSubmissions).values({
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            subject: values.subject.trim(),
            message: values.message.trim(),
        }).returning();

        return ok(submission);
    } catch (error) {
        console.error("Error creating contact submission:", error);
        return fail("Something went wrong. Please try again.");
    }
}

// Get contact submission statistics for dashboard
export async function getContactSubmissionStats() {
    try {
        // Check if the user has permission to manage contact submissions
        const perm = await ensurePermission("DEPARTMENTS:MANAGE");
        if (!perm.success) return perm;

        const [totalResult, unreadResult] = await Promise.all([
            db.select({ count: count() }).from(contactSubmissions),
            db.select({ count: count() })
                .from(contactSubmissions)
                .where(eq(contactSubmissions.isRead, false)),
        ]);

        return ok({
            total: totalResult[0].count,
            unread: unreadResult[0].count,
            read: totalResult[0].count - unreadResult[0].count,
        });
    } catch (error) {
        console.error("Error fetching contact submission stats:", error);
        return fail("Something went wrong. Please try again.");
    }
}
