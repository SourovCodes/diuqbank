import { z } from "zod";

import { pageFields } from "../utils/pagination";

const optionalId = z.coerce.number().int().positive().optional();

export const questionsListQuery = z.object({
  ...pageFields,
  // Free-text match across the question's title components (course,
  // department, semester, exam type) — see `questionSearchFilter`.
  search: z.string().trim().min(1).max(150).optional(),
  departmentId: optionalId,
  courseId: optionalId,
  semesterId: optionalId,
  examTypeId: optionalId,
});

export type QuestionsListQuery = z.infer<typeof questionsListQuery>;
