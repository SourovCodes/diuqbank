"use server";

import { db } from "@/db/drizzle";
import {
  users,
  departments,
  courses,
  semesters,
  examTypes,
  questions,
  QuestionStatus,
} from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";

export interface DashboardStats {
  totalUsers: number;
  totalDepartments: number;
  totalCourses: number;
  totalSemesters: number;
  totalExamTypes: number;
  totalQuestions: number;
  questionsByStatus: {
    published: number;
    pending: number;
    duplicate: number;
    rejected: number;
  };
}

export interface RecentQuestion {
  id: number;
  departmentName: string;
  courseName: string;
  semesterName: string;
  examTypeName: string;
  status: string;
  createdAt: Date;
  userName: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get total counts
  const [
    totalUsersResult,
    totalDepartmentsResult,
    totalCoursesResult,
    totalSemestersResult,
    totalExamTypesResult,
    totalQuestionsResult,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(departments),
    db.select({ count: sql<number>`count(*)` }).from(courses),
    db.select({ count: sql<number>`count(*)` }).from(semesters),
    db.select({ count: sql<number>`count(*)` }).from(examTypes),
    db.select({ count: sql<number>`count(*)` }).from(questions),
  ]);

  // Get questions by status in a single aggregate query
  const [statusAgg] = await db
    .select({
      published: sql<number>`SUM(${questions.status} = ${QuestionStatus.PUBLISHED})`,
      pending: sql<number>`SUM(${questions.status} = ${QuestionStatus.PENDING_REVIEW})`,
      duplicate: sql<number>`SUM(${questions.status} = ${QuestionStatus.DUPLICATE})`,
      rejected: sql<number>`SUM(${questions.status} = ${QuestionStatus.REJECTED})`,
    })
    .from(questions);

  return {
    totalUsers: totalUsersResult[0]?.count ?? 0,
    totalDepartments: totalDepartmentsResult[0]?.count ?? 0,
    totalCourses: totalCoursesResult[0]?.count ?? 0,
    totalSemesters: totalSemestersResult[0]?.count ?? 0,
    totalExamTypes: totalExamTypesResult[0]?.count ?? 0,
    totalQuestions: totalQuestionsResult[0]?.count ?? 0,
    questionsByStatus: {
      published: statusAgg?.published ?? 0,
      pending: statusAgg?.pending ?? 0,
      duplicate: statusAgg?.duplicate ?? 0,
      rejected: statusAgg?.rejected ?? 0,
    },
  };
}

export async function getRecentQuestions(): Promise<RecentQuestion[]> {
  const recentQuestions = await db
    .select({
      id: questions.id,
      departmentName: departments.name,
      courseName: courses.name,
      semesterName: semesters.name,
      examTypeName: examTypes.name,
      status: questions.status,
      createdAt: questions.createdAt,
      userName: users.name,
    })
    .from(questions)
    .innerJoin(departments, eq(questions.departmentId, departments.id))
    .innerJoin(courses, eq(questions.courseId, courses.id))
    .innerJoin(semesters, eq(questions.semesterId, semesters.id))
    .innerJoin(examTypes, eq(questions.examTypeId, examTypes.id))
    .innerJoin(users, eq(questions.userId, users.id))
    .orderBy(desc(questions.createdAt))
    .limit(5);

  return recentQuestions.map((q) => ({
    ...q,
    userName: q.userName || "Unknown User",
  }));
}
