import { z } from "zod";
import { analysisSummarySchema, submissionAnalysisSchema } from "./analysis";
import { contributorSubmissionSchema } from "./contributor";

/** One of the signed-in user's own submissions, with how its review is going. */
export const mySubmissionSchema = contributorSubmissionSchema.extend({
  /** Published by the AI check right after upload, not by an admin. */
  autoPublished: z.boolean(),
  /** Null for papers that were never checked. */
  analysis: analysisSummarySchema.nullable(),
});
export type MySubmission = z.infer<typeof mySubmissionSchema>;

/** The signed-in user's own submissions, in every status. */
export const mySubmissionListSchema = z.object({
  /** Published first (newest first), then pending review, then rejected. */
  items: z.array(mySubmissionSchema),
});
export type MySubmissionList = z.infer<typeof mySubmissionListSchema>;

/** What the uploader sees of the AI check: its verdict and what it read. */
export const uploaderAnalysisSchema = submissionAnalysisSchema.pick({
  status: true,
  requestedAt: true,
  completedAt: true,
  isQuestionPaper: true,
  paperCount: true,
  note: true,
  flag: true,
  values: true,
});
export type UploaderAnalysis = z.infer<typeof uploaderAnalysisSchema>;

export const mySubmissionDetailSchema = mySubmissionSchema.extend({
  analysisDetail: uploaderAnalysisSchema.nullable(),
});
export type MySubmissionDetail = z.infer<typeof mySubmissionDetailSchema>;
