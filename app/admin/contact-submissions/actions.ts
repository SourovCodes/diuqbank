"use server";

import { revalidatePath } from "next/cache";
import {
  getPaginationMeta,
  parseNumericId,
  ok,
  fail,
} from "@/lib/action-utils";
import { contactFormSubmissionRepository } from "@/lib/repositories";

export async function getPaginatedSubmissions(
  page: number = 1,
  pageSize: number = 10,
  search?: string
) {
  try {
    const result = await contactFormSubmissionRepository.findManyPaginated({
      page,
      pageSize,
      search,
    });

    return ok({
      submissions: result.data,
      pagination: getPaginationMeta(result.pagination.totalCount, page, pageSize),
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

    const deleted = await contactFormSubmissionRepository.delete(numericId);
    if (!deleted) {
      return fail("Failed to delete contact submission");
    }

    revalidatePath("/admin/contact-submissions");
    return ok();
  } catch (error) {
    console.error("Error deleting contact submission:", error);
    return fail("Failed to delete contact submission");
  }
}
