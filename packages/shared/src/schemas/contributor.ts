import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./common";
import {
  questionSummarySchema,
  submissionCountsSchema,
  submissionStatusSchema,
} from "./question";

/**
 * A user who has submitted at least one paper. Only public profile fields are
 * exposed (never the email address).
 */
export const contributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  joinedAt: z.iso.datetime(),
  submissionCounts: submissionCountsSchema,
});
export type Contributor = z.infer<typeof contributorSchema>;

export const contributorSubmissionSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  fileSize: z.number().int(),
  createdAt: z.iso.datetime(),
  question: questionSummarySchema,
});
export type ContributorSubmission = z.infer<typeof contributorSubmissionSchema>;

export const contributorDetailSchema = contributorSchema.extend({
  /** Published first (newest first), then pending review, then rejected. */
  submissions: z.array(contributorSubmissionSchema),
});
export type ContributorDetail = z.infer<typeof contributorDetailSchema>;

export const listContributorsQuerySchema = paginationQuerySchema;
export type ListContributorsQuery = z.infer<typeof listContributorsQuerySchema>;

export const contributorListSchema = paginatedSchema(contributorSchema);
export type ContributorList = z.infer<typeof contributorListSchema>;
