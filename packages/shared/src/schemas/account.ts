import { z } from "zod";
import { contributorSubmissionSchema } from "./contributor";

/** The signed-in user's own submissions, in every status. */
export const mySubmissionListSchema = z.object({
  /** Published first (newest first), then pending review, then rejected. */
  items: z.array(contributorSubmissionSchema),
});
export type MySubmissionList = z.infer<typeof mySubmissionListSchema>;
