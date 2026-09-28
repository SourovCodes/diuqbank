import { z } from "zod";
import {
  MAX_REPORT_DETAILS_LENGTH,
  REPORT_REASONS,
  REPORT_STATUSES,
} from "../constants";
import { submissionStatsSchema } from "./question";

/** 1 = like, -1 = dislike. */
export const voteValueSchema = z.union([z.literal(1), z.literal(-1)]);
export type VoteValue = z.infer<typeof voteValueSchema>;

export const castVoteInputSchema = z.object({ value: voteValueSchema });
export type CastVoteInput = z.infer<typeof castVoteInputSchema>;

/** A submission's counters after a vote change, plus the caller's current vote. */
export const voteResultSchema = submissionStatsSchema.extend({
  myVote: voteValueSchema.nullable(),
});
export type VoteResult = z.infer<typeof voteResultSchema>;

export const reportReasonSchema = z.enum(REPORT_REASONS);
export type ReportReason = z.infer<typeof reportReasonSchema>;
export const reportStatusSchema = z.enum(REPORT_STATUSES);
export type ReportStatus = z.infer<typeof reportStatusSchema>;

export const createReportInputSchema = z
  .object({
    reason: reportReasonSchema,
    details: z.string().trim().max(MAX_REPORT_DETAILS_LENGTH).optional(),
  })
  .refine((value) => value.reason !== "other" || Boolean(value.details), {
    path: ["details"],
    message: "Describe the problem",
  });
export type CreateReportInput = z.infer<typeof createReportInputSchema>;

export const createdReportSchema = z.object({
  id: z.number().int(),
  status: reportStatusSchema,
  /** True when this report pushed the paper over the threshold and it is now hidden. */
  submissionHidden: z.boolean(),
});
export type CreatedReport = z.infer<typeof createdReportSchema>;

/** The signed-in user's votes and open reports on one question's submissions. */
export const questionInteractionsSchema = z.object({
  userId: z.string(),
  votes: z.array(
    z.object({ submissionId: z.number().int(), value: voteValueSchema }),
  ),
  reportedSubmissionIds: z.array(z.number().int()),
});
export type QuestionInteractions = z.infer<typeof questionInteractionsSchema>;

export const avatarSchema = z.object({
  /** URL of the uploaded image, served by the API. */
  image: z.string(),
});
export type Avatar = z.infer<typeof avatarSchema>;
