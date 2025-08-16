import { sql, desc, eq, and, count } from "drizzle-orm";
import {
    users,
    questions,
    departments,
    courses,
    semesters,
    examTypes,
    QuestionStatus,
} from "@/db/schema";
import { db } from "@/db/drizzle";
import { getPaginationMeta } from "@/lib/action-utils";

export interface PublicContributor {
    id: string;
    name: string;
    username: string;
    studentId: string | null;
    image: string | null;
    questionCount: number;
    totalViews: number;
    latestQuestionDate: Date | null;
}

export interface ContributorQuestion {
    id: number;
    pdfKey: string;
    pdfFileSizeInBytes: number;
    viewCount: number;
    createdAt: Date;
    departmentName: string | null;
    departmentShortName: string | null;
    courseName: string | null;
    semesterName: string | null;
    examTypeName: string | null;
}

export interface ContributorDetails {
    id: string;
    name: string;
    username: string;
    studentId: string | null;
    image: string | null;
    questionCount: number;
    totalViews: number;
    joinedAt: Date | null;
    departments: Array<{
        name: string | null;
        shortName: string | null;
        count: number;
    }>;
    courses: Array<{
        name: string | null;
        departmentName: string | null;
        count: number;
    }>;
    examTypes: Array<{ name: string | null; count: number }>;
}

/**
 * Contributor repository for public contributor statistics and data
 */
export class ContributorRepository {
    // Get paginated list of contributors with their statistics
    async findPublicContributors(
        page: number = 1,
        pageSize: number = 12
    ) {
        const skip = (page - 1) * pageSize;

        // Get contributors with their question statistics
        const contributorsQuery = db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                studentId: users.studentId,
                image: users.image,
                questionCount: count(questions.id),
                totalViews: sql<number>`COALESCE(SUM(${questions.viewCount}), 0)`,
                latestQuestionDate: sql<Date>`MAX(${questions.createdAt})`,
            })
            .from(users)
            .leftJoin(
                questions,
                and(
                    eq(users.id, questions.userId),
                    eq(questions.status, QuestionStatus.PUBLISHED)
                )
            )
            .groupBy(
                users.id,
                users.name,
                users.username,
                users.studentId,
                users.image
            )
            .having(sql`COUNT(${questions.id}) > 0`) // Only users with published questions
            .orderBy(desc(count(questions.id))) // Order by question count
            .limit(pageSize)
            .offset(skip);

        // Get total count of contributors
        const totalCountQuery = db.select({ count: count() }).from(
            db
                .select({ userId: users.id })
                .from(users)
                .leftJoin(
                    questions,
                    and(
                        eq(users.id, questions.userId),
                        eq(questions.status, QuestionStatus.PUBLISHED)
                    )
                )
                .groupBy(users.id)
                .having(sql`COUNT(${questions.id}) > 0`)
                .as("contributors_with_questions")
        );

        const [contributorsResult, totalCountResult] = await Promise.all([
            contributorsQuery,
            totalCountQuery,
        ]);

        const totalCount = totalCountResult[0].count;

        return {
            contributors: contributorsResult as PublicContributor[],
            pagination: getPaginationMeta(totalCount, page, pageSize),
        };
    }

    // Get a single contributor's details with their questions
    async findPublicContributorByUsername(username: string): Promise<ContributorDetails | null> {
        // Get contributor basic info with statistics
        const contributorResult = await db
            .select({
                id: users.id,
                name: users.name,
                username: users.username,
                studentId: users.studentId,
                image: users.image,
                questionCount: count(questions.id),
                totalViews: sql<number>`COALESCE(SUM(${questions.viewCount}), 0)`,
                joinedAt: sql<Date>`MIN(${questions.createdAt})`, // First question submission as join date
            })
            .from(users)
            .leftJoin(
                questions,
                and(
                    eq(users.id, questions.userId),
                    eq(questions.status, QuestionStatus.PUBLISHED)
                )
            )
            .where(eq(users.username, username))
            .groupBy(
                users.id,
                users.name,
                users.username,
                users.studentId,
                users.image
            )
            .limit(1);

        if (contributorResult.length === 0) {
            return null;
        }

        const contributor = contributorResult[0];

        // If user has no published questions, return basic info
        if (contributor.questionCount === 0) {
            return {
                ...contributor,
                departments: [],
                courses: [],
                examTypes: [],
            } as ContributorDetails;
        }

        // Get department statistics
        const departmentStats = await db
            .select({
                name: departments.name,
                shortName: departments.shortName,
                count: count(),
            })
            .from(questions)
            .leftJoin(departments, eq(questions.departmentId, departments.id))
            .where(
                and(
                    eq(questions.userId, contributor.id),
                    eq(questions.status, QuestionStatus.PUBLISHED)
                )
            )
            .groupBy(departments.id, departments.name, departments.shortName)
            .orderBy(desc(count()));

        // Get course statistics
        const courseStats = await db
            .select({
                name: courses.name,
                departmentName: departments.name,
                count: count(),
            })
            .from(questions)
            .leftJoin(courses, eq(questions.courseId, courses.id))
            .leftJoin(departments, eq(courses.departmentId, departments.id))
            .where(
                and(
                    eq(questions.userId, contributor.id),
                    eq(questions.status, QuestionStatus.PUBLISHED)
                )
            )
            .groupBy(courses.id, courses.name, departments.name)
            .orderBy(desc(count()));

        // Get exam type statistics
        const examTypeStats = await db
            .select({
                name: examTypes.name,
                count: count(),
            })
            .from(questions)
            .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
            .where(
                and(
                    eq(questions.userId, contributor.id),
                    eq(questions.status, QuestionStatus.PUBLISHED)
                )
            )
            .groupBy(examTypes.id, examTypes.name)
            .orderBy(desc(count()));

        return {
            ...contributor,
            departments: departmentStats,
            courses: courseStats,
            examTypes: examTypeStats,
        } as ContributorDetails;
    }

    // Get a contributor's questions with pagination
    async findContributorQuestions(
        username: string,
        page: number = 1,
        pageSize: number = 12
    ) {
        const skip = (page - 1) * pageSize;

        // First get the user ID from username
        const userResult = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (userResult.length === 0) {
            return null;
        }

        const userId = userResult[0].id;

        const [questionsResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: questions.id,
                    pdfKey: questions.pdfKey,
                    pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
                    viewCount: questions.viewCount,
                    createdAt: questions.createdAt,
                    departmentName: departments.name,
                    departmentShortName: departments.shortName,
                    courseName: courses.name,
                    semesterName: semesters.name,
                    examTypeName: examTypes.name,
                })
                .from(questions)
                .leftJoin(departments, eq(questions.departmentId, departments.id))
                .leftJoin(courses, eq(questions.courseId, courses.id))
                .leftJoin(semesters, eq(questions.semesterId, semesters.id))
                .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
                .where(
                    and(
                        eq(questions.userId, userId),
                        eq(questions.status, QuestionStatus.PUBLISHED)
                    )
                )
                .orderBy(desc(questions.createdAt))
                .limit(pageSize)
                .offset(skip),

            db
                .select({ count: count() })
                .from(questions)
                .where(
                    and(
                        eq(questions.userId, userId),
                        eq(questions.status, QuestionStatus.PUBLISHED)
                    )
                ),
        ]);

        const totalCount = totalCountResult[0].count;

        return {
            questions: questionsResult as ContributorQuestion[],
            pagination: getPaginationMeta(totalCount, page, pageSize),
        };
    }
}

// Export a singleton instance
export const contributorRepository = new ContributorRepository();
