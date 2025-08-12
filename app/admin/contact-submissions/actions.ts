"use server";

import { db } from "@/db/drizzle";
import { contactFormSubmissions } from "@/db/schema";
import { desc, eq, like, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
} from "@/lib/action-utils";

export async function getPaginatedSubmissions(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    const offset = (page - 1) * pageSize;

    // Base query
    const baseQuery = db.select().from(contactFormSubmissions);

    // Add search condition if search term is provided
    const query = search
      ? baseQuery.where(like(contactFormSubmissions.name, `%${search}%`))
      : baseQuery;

    // Get total count for pagination
    const totalCountResult = await db
      .select({
        count: sql<number>`count(${contactFormSubmissions.id})`,
      })
      .from(contactFormSubmissions);

    const totalCount = Number(totalCountResult[0].count);

    // Get paginated results
    const submissions = await query
      .orderBy(desc(contactFormSubmissions.createdAt))
      .limit(pageSize)
      .offset(offset);

    return ok({
      submissions,
      pagination: getPaginationMeta(totalCount, page, pageSize),
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return fail("Failed to fetch contact submissions");
  }
}

export async function deleteSubmission(id: string) {
  try {
    const parsed = parseNumericId(id, "Submission");
    if (!parsed.success) return fail(parsed.error);
    const numericId = parsed.data!;

    await db
      .delete(contactFormSubmissions)
      .where(eq(contactFormSubmissions.id, numericId));
    revalidatePath("/admin/contact-submissions");
    return ok();
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    return fail("Failed to delete contact submission");
  }
}
