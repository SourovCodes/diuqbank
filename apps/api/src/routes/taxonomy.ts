import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  courseListSchema,
  departmentListSchema,
  examTypeListSchema,
  listCoursesQuerySchema,
  semesterListSchema,
} from "@qb/shared";
import { validationHook } from "../lib/errors";
import { errorResponse, jsonResponse } from "../lib/openapi";
import {
  listCourses,
  listDepartments,
  listExamTypes,
  listSemesters,
} from "../services/taxonomy";
import type { AppEnv } from "../types";

const tags = ["Taxonomy"];

const listDepartmentsRoute = createRoute({
  method: "get",
  path: "/departments",
  tags,
  summary: "List departments",
  responses: { 200: jsonResponse(departmentListSchema, "Departments") },
});

const listCoursesRoute = createRoute({
  method: "get",
  path: "/courses",
  tags,
  summary: "List courses, optionally for one department",
  request: { query: listCoursesQuerySchema },
  responses: {
    200: jsonResponse(courseListSchema, "Courses"),
    422: errorResponse("Invalid query"),
  },
});

const listSemestersRoute = createRoute({
  method: "get",
  path: "/semesters",
  tags,
  summary: "List semesters",
  responses: { 200: jsonResponse(semesterListSchema, "Semesters") },
});

const listExamTypesRoute = createRoute({
  method: "get",
  path: "/exam-types",
  tags,
  summary: "List exam types",
  responses: { 200: jsonResponse(examTypeListSchema, "Exam types") },
});

export const taxonomyRoutes = new OpenAPIHono<AppEnv>({
  defaultHook: validationHook,
})
  .openapi(listDepartmentsRoute, async (c) =>
    c.json({ items: await listDepartments(c.var.db) }, 200),
  )
  .openapi(listCoursesRoute, async (c) => {
    const { departmentId } = c.req.valid("query");
    return c.json({ items: await listCourses(c.var.db, departmentId) }, 200);
  })
  .openapi(listSemestersRoute, async (c) =>
    c.json({ items: await listSemesters(c.var.db) }, 200),
  )
  .openapi(listExamTypesRoute, async (c) =>
    c.json({ items: await listExamTypes(c.var.db) }, 200),
  );
