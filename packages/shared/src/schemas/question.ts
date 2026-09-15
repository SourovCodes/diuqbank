import { z } from "zod";
import { SUBMISSION_STATUSES } from "../constants";
import { paginatedSchema, paginationQuerySchema } from "./common";
import {
  courseSchema,
  departmentSchema,
  examTypeSchema,
  idQuerySchema,
  semesterSchema,
} from "./taxonomy";

export const submissionStatusSchema = z.enum(SUBMISSION_STATUSES);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

/** Public identity of the user who uploaded a submission (never their email). */
export const uploaderSchema = z.object({ id: z.string(), name: z.string() });
export type Uploader = z.infer<typeof uploaderSchema>;

/**
 * Public submission metadata. Every status is listed so visitors can see that a paper
 * is already under review, but only `published` files can be downloaded.
 */
export const submissionSchema = z.object({
  id: z.string(),
  status: submissionStatusSchema,
  fileSize: z.number().int(),
  createdAt: z.iso.datetime(),
  /** Null when the uploader's account no longer exists. */
  uploader: uploaderSchema.nullable(),
});
export type Submission = z.infer<typeof submissionSchema>;

export const submissionCountsSchema = z.object({
  published: z.number().int(),
  pendingReview: z.number().int(),
  rejected: z.number().int(),
});
export type SubmissionCounts = z.infer<typeof submissionCountsSchema>;

/** A question is a unique department + course + semester + exam type combination. */
export const questionSummarySchema = z.object({
  id: z.number().int().positive(),
  department: departmentSchema,
  course: courseSchema.pick({ id: true, name: true }),
  semester: semesterSchema,
  examType: examTypeSchema,
});
export type QuestionSummary = z.infer<typeof questionSummarySchema>;

export const questionSchema = questionSummarySchema.extend({
  submissionCounts: submissionCountsSchema,
});
export type Question = z.infer<typeof questionSchema>;

export const questionDetailSchema = questionSchema.extend({
  /** Published first (newest first), then pending review, then rejected. */
  submissions: z.array(submissionSchema),
});
export type QuestionDetail = z.infer<typeof questionDetailSchema>;

export const listQuestionsQuerySchema = paginationQuerySchema.extend({
  departmentId: idQuerySchema.optional(),
  courseId: idQuerySchema.optional(),
  semesterId: idQuerySchema.optional(),
  examTypeId: idQuerySchema.optional(),
});
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;

export const questionListSchema = paginatedSchema(questionSchema);
export type QuestionList = z.infer<typeof questionListSchema>;
