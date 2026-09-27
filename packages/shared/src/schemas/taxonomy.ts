import { z } from "zod";

// Lookup tables used to classify questions. They only carry a name
// (departments also have a short name, e.g. "CSE").

const idSchema = z.number().int().positive();

export const departmentSchema = z.object({
  id: idSchema,
  name: z.string(),
  shortName: z.string(),
});
export type Department = z.infer<typeof departmentSchema>;

export const courseSchema = z.object({
  id: idSchema,
  name: z.string(),
  departmentId: idSchema,
});
export type Course = z.infer<typeof courseSchema>;

export const semesterSchema = z.object({ id: idSchema, name: z.string() });
export type Semester = z.infer<typeof semesterSchema>;

export const examTypeSchema = z.object({ id: idSchema, name: z.string() });
export type ExamType = z.infer<typeof examTypeSchema>;

function listSchema<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item) });
}

/** A department as listed publicly, with how many papers can be read. */
export const departmentListItemSchema = departmentSchema.extend({
  publishedCount: z.number().int(),
});
export type DepartmentListItem = z.infer<typeof departmentListItemSchema>;

export const departmentListSchema = listSchema(departmentListItemSchema);
export const courseListSchema = listSchema(courseSchema);
export const semesterListSchema = listSchema(semesterSchema);
export const examTypeListSchema = listSchema(examTypeSchema);
export type DepartmentList = z.infer<typeof departmentListSchema>;
export type CourseList = z.infer<typeof courseListSchema>;
export type SemesterList = z.infer<typeof semesterListSchema>;
export type ExamTypeList = z.infer<typeof examTypeListSchema>;

/** Query-string id: coerced from text, must be a positive integer. */
export const idQuerySchema = z.coerce.number().int().positive();

export const listCoursesQuerySchema = z.object({
  departmentId: idQuerySchema.optional(),
});
