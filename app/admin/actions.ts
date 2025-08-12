"use server";

import { db } from "@/db/drizzle";
import {
    users,
    departments,
    courses,
    semesters,
    examTypes,
    questions,
    QuestionStatus
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

    // Get questions by status
    const [publishedCount, pendingCount, duplicateCount, rejectedCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` })
            .from(questions)
            .where(eq(questions.status, QuestionStatus.PUBLISHED)),
        db.select({ count: sql<number>`count(*)` })
            .from(questions)
            .where(eq(questions.status, QuestionStatus.PENDING_REVIEW)),
        db.select({ count: sql<number>`count(*)` })
            .from(questions)
            .where(eq(questions.status, QuestionStatus.DUPLICATE)),
        db.select({ count: sql<number>`count(*)` })
            .from(questions)
            .where(eq(questions.status, QuestionStatus.REJECTED)),
    ]);

    return {
        totalUsers: totalUsersResult[0]?.count ?? 0,
        totalDepartments: totalDepartmentsResult[0]?.count ?? 0,
        totalCourses: totalCoursesResult[0]?.count ?? 0,
        totalSemesters: totalSemestersResult[0]?.count ?? 0,
        totalExamTypes: totalExamTypesResult[0]?.count ?? 0,
        totalQuestions: totalQuestionsResult[0]?.count ?? 0,
        questionsByStatus: {
            published: publishedCount[0]?.count ?? 0,
            pending: pendingCount[0]?.count ?? 0,
            duplicate: duplicateCount[0]?.count ?? 0,
            rejected: rejectedCount[0]?.count ?? 0,
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

    return recentQuestions.map(q => ({
        ...q,
        userName: q.userName || 'Unknown User',
    }));
} 