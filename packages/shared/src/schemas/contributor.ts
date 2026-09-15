import { z } from "zod";
import { paginatedSchema, paginationQuerySchema } from "./common";
import {
  submissionCountsSchema,
  submissionStatsSchema,
  submissionStatusSchema,
} from "./question";
import { submissionClassificationSchema } from "./submission";

/**
 * A user who has submitted at least one paper. Only public profile fields are
 * exposed (never the email address).
 */
export const contributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  joinedAt: z.iso.datetime(),
  submissionCounts: submissionCountsSchema,
});
export type Contributor = z.infer<typeof contributorSchema>;

export const contributorSubmissionSchema = submissionStatsSchema.extend({
  id: z.string(),
  status: submissionStatusSchema,
  fileSize: z.number().int(),
  createdAt: z.iso.datetime(),
  /** Null while the submission proposes new values that aren't approved yet. */
  questionId: z.number().int().nullable(),
  classification: submissionClassificationSchema,
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
