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

/** A submission as shown publicly (only `published` submissions are ever exposed). */
export const publishedSubmissionSchema = z.object({
  id: z.string(),
  fileSize: z.number().int(),
  createdAt: z.iso.datetime(),
});
export type PublishedSubmission = z.infer<typeof publishedSubmissionSchema>;

/** A question is a unique department + course + semester + exam type combination. */
export const questionSchema = z.object({
  id: z.number().int().positive(),
  department: departmentSchema,
  course: courseSchema.pick({ id: true, name: true }),
  semester: semesterSchema,
  examType: examTypeSchema,
  publishedSubmissionCount: z.number().int(),
});
export type Question = z.infer<typeof questionSchema>;

export const questionDetailSchema = questionSchema.extend({
  submissions: z.array(publishedSubmissionSchema),
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
