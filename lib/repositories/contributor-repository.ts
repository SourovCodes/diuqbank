import { sql } from "drizzle-orm";
import { QuestionStatus } from "@/db/schema"; // keep enum for status string
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

        // RAW SQL TEMPLATE (contributors list):
        // SELECT u.id, u.name, u.username, u.studentId, u.image,
        //        COUNT(q.id) AS questionCount,
        //        COALESCE(SUM(q.viewCount),0) AS totalViews,
        //        MAX(q.createdAt) AS latestQuestionDate
        // FROM user u
        // LEFT JOIN question q ON u.id = q.userId AND q.status = 'published'
        // GROUP BY u.id,u.name,u.username,u.studentId,u.image
        // HAVING COUNT(q.id) > 0
        // ORDER BY questionCount DESC
        // LIMIT ? OFFSET ?;
        const [rows] = await db.execute(sql`
            SELECT u.id, u.name, u.username, u.studentId, u.image,
                   COUNT(q.id) AS questionCount,
                   COALESCE(SUM(q.viewCount), 0) AS totalViews,
                   MAX(q.createdAt) AS latestQuestionDate
            FROM user u
            LEFT JOIN question q ON u.id = q.userId AND q.status = ${QuestionStatus.PUBLISHED}
            GROUP BY u.id, u.name, u.username, u.studentId, u.image
            HAVING COUNT(q.id) > 0
            ORDER BY questionCount DESC
            LIMIT ${pageSize} OFFSET ${skip}
        `);
        const contributors = (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
            id: String(r.id),
            name: String(r.name),
            username: String(r.username),
            studentId: r.studentId === null ? null : String(r.studentId),
            image: r.image === null ? null : String(r.image),
            questionCount: typeof r.questionCount === 'number' ? (r.questionCount as number) : parseInt(String(r.questionCount ?? 0), 10),
            totalViews: typeof r.totalViews === 'number' ? (r.totalViews as number) : parseInt(String(r.totalViews ?? 0), 10),
            latestQuestionDate: r.latestQuestionDate ? new Date(r.latestQuestionDate as string | Date) : null,
        })) as PublicContributor[];

        // RAW SQL TEMPLATE (contributors total count):
        // SELECT COUNT(*) AS total FROM (
        //   SELECT u.id FROM user u
        //   LEFT JOIN question q ON u.id = q.userId AND q.status='published'
        //   GROUP BY u.id HAVING COUNT(q.id) > 0
        // ) AS contributors_with_questions;
        const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total FROM (
                SELECT u.id
                FROM user u
                LEFT JOIN question q ON u.id = q.userId AND q.status = ${QuestionStatus.PUBLISHED}
                GROUP BY u.id
                HAVING COUNT(q.id) > 0
            ) AS contributors_with_questions
        `);
    const totalArr = countRows as unknown as Array<Record<string, unknown>>;
    const totalCount = parseInt(String(totalArr[0]?.total ?? 0), 10);

        return {
            contributors,
            pagination: getPaginationMeta(totalCount, page, pageSize),
        };
    }

    // Get a single contributor's details with their questions
    async findPublicContributorByUsername(username: string): Promise<ContributorDetails | null> {
        // RAW SQL TEMPLATE (single contributor aggregate):
        // SELECT u.id,u.name,u.username,u.studentId,u.image,
        //        COUNT(q.id) AS questionCount,
        //        COALESCE(SUM(q.viewCount),0) AS totalViews,
        //        MIN(q.createdAt) AS joinedAt
        // FROM user u
        // LEFT JOIN question q ON u.id = q.userId AND q.status='published'
        // WHERE u.username = ?
        // GROUP BY u.id,u.name,u.username,u.studentId,u.image
        // LIMIT 1;
        const [aggRows] = await db.execute(sql`
            SELECT u.id, u.name, u.username, u.studentId, u.image,
                   COUNT(q.id) AS questionCount,
                   COALESCE(SUM(q.viewCount), 0) AS totalViews,
                   MIN(q.createdAt) AS joinedAt
            FROM user u
            LEFT JOIN question q ON u.id = q.userId AND q.status = ${QuestionStatus.PUBLISHED}
            WHERE u.username = ${username}
            GROUP BY u.id, u.name, u.username, u.studentId, u.image
            LIMIT 1
        `);
        const agg = (aggRows as unknown as Array<Record<string, unknown>>)[0];
        if (!agg) return null;
        const baseContributor = {
            id: String(agg.id),
            name: String(agg.name),
            username: String(agg.username),
            studentId: agg.studentId === null ? null : String(agg.studentId),
            image: agg.image === null ? null : String(agg.image),
            questionCount: typeof agg.questionCount === 'number' ? (agg.questionCount as number) : parseInt(String(agg.questionCount ?? 0), 10),
            totalViews: typeof agg.totalViews === 'number' ? (agg.totalViews as number) : parseInt(String(agg.totalViews ?? 0), 10),
            joinedAt: agg.joinedAt ? new Date(agg.joinedAt as string | Date) : null,
        };

        if (baseContributor.questionCount === 0) {
            return { ...baseContributor, departments: [], courses: [], examTypes: [] } as ContributorDetails;
        }

        // RAW SQL TEMPLATE (department stats):
        // SELECT d.name, d.shortName, COUNT(*) AS count FROM question q
        // LEFT JOIN department d ON q.departmentId = d.id
        // WHERE q.userId = ? AND q.status='published'
        // GROUP BY d.id,d.name,d.shortName
        // ORDER BY count DESC;
        const [deptRows] = await db.execute(sql`
            SELECT d.name AS name, d.shortName AS shortName, COUNT(*) AS count
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            WHERE q.userId = ${baseContributor.id} AND q.status = ${QuestionStatus.PUBLISHED}
            GROUP BY d.id, d.name, d.shortName
            ORDER BY count DESC
        `);
        const departments = (deptRows as unknown as Array<Record<string, unknown>>).map((r) => ({
            name: r.name === null ? null : String(r.name),
            shortName: r.shortName === null ? null : String(r.shortName),
            count: typeof r.count === 'number' ? (r.count as number) : parseInt(String(r.count ?? 0), 10),
        }));

        // RAW SQL TEMPLATE (course stats):
        // SELECT c.name, d.name AS departmentName, COUNT(*) AS count FROM question q
        // LEFT JOIN course c ON q.courseId=c.id
        // LEFT JOIN department d ON c.departmentId=d.id
        // WHERE q.userId=? AND q.status='published'
        // GROUP BY c.id,c.name,d.name
        // ORDER BY count DESC;
        const [courseRows] = await db.execute(sql`
            SELECT c.name AS name, d.name AS departmentName, COUNT(*) AS count
            FROM question q
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN department d ON c.departmentId = d.id
            WHERE q.userId = ${baseContributor.id} AND q.status = ${QuestionStatus.PUBLISHED}
            GROUP BY c.id, c.name, d.name
            ORDER BY count DESC
        `);
        const courses = (courseRows as unknown as Array<Record<string, unknown>>).map((r) => ({
            name: r.name === null ? null : String(r.name),
            departmentName: r.departmentName === null ? null : String(r.departmentName),
            count: typeof r.count === 'number' ? (r.count as number) : parseInt(String(r.count ?? 0), 10),
        }));

        // RAW SQL TEMPLATE (exam type stats):
        // SELECT e.name, COUNT(*) AS count FROM question q
        // LEFT JOIN examType e ON q.examTypeId = e.id
        // WHERE q.userId=? AND q.status='published'
        // GROUP BY e.id,e.name
        // ORDER BY count DESC;
        const [examRows] = await db.execute(sql`
            SELECT e.name AS name, COUNT(*) AS count
            FROM question q
            LEFT JOIN examType e ON q.examTypeId = e.id
            WHERE q.userId = ${baseContributor.id} AND q.status = ${QuestionStatus.PUBLISHED}
            GROUP BY e.id, e.name
            ORDER BY count DESC
        `);
        const examTypes = (examRows as unknown as Array<Record<string, unknown>>).map((r) => ({
            name: r.name === null ? null : String(r.name),
            count: typeof r.count === 'number' ? (r.count as number) : parseInt(String(r.count ?? 0), 10),
        }));

        return { ...baseContributor, departments, courses, examTypes } as ContributorDetails;
    }

    // Get a contributor's questions with pagination
    async findContributorQuestions(
        username: string,
        page: number = 1,
        pageSize: number = 12
    ) {
        const skip = (page - 1) * pageSize;

        // RAW SQL TEMPLATE (lookup user id):
        // SELECT id FROM user WHERE username = ? LIMIT 1;
        const [userRows] = await db.execute(sql`SELECT id FROM user WHERE username = ${username} LIMIT 1`);
        const userData = (userRows as unknown as Array<Record<string, unknown>>)[0];
        if (!userData) return null;
        const userId = String(userData.id);

        // RAW SQL TEMPLATE (questions list):
        // SELECT q.id,q.pdfKey,q.pdfFileSizeInBytes,q.viewCount,q.createdAt,
        //        d.name AS departmentName,d.shortName AS departmentShortName,
        //        c.name AS courseName,s.name AS semesterName,e.name AS examTypeName
        // FROM question q
        // LEFT JOIN department d ON q.departmentId=d.id
        // LEFT JOIN course c ON q.courseId=c.id
        // LEFT JOIN semester s ON q.semesterId=s.id
        // LEFT JOIN examType e ON q.examTypeId=e.id
        // WHERE q.userId=? AND q.status='published'
        // ORDER BY q.createdAt DESC
        // LIMIT ? OFFSET ?;
        const [qRows] = await db.execute(sql`
            SELECT q.id, q.pdfKey, q.pdfFileSizeInBytes, q.viewCount, q.createdAt,
                   d.name AS departmentName, d.shortName AS departmentShortName,
                   c.name AS courseName, s.name AS semesterName, e.name AS examTypeName
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN semester s ON q.semesterId = s.id
            LEFT JOIN examType e ON q.examTypeId = e.id
            WHERE q.userId = ${userId} AND q.status = ${QuestionStatus.PUBLISHED}
            ORDER BY q.createdAt DESC
            LIMIT ${pageSize} OFFSET ${skip}
        `);
        const questions = (qRows as unknown as Array<Record<string, unknown>>).map((r) => ({
            id: Number(r.id),
            pdfKey: String(r.pdfKey),
            pdfFileSizeInBytes: Number(r.pdfFileSizeInBytes),
            viewCount: Number(r.viewCount),
            createdAt: new Date(r.createdAt as string | Date),
            departmentName: r.departmentName === null ? null : String(r.departmentName),
            departmentShortName: r.departmentShortName === null ? null : String(r.departmentShortName),
            courseName: r.courseName === null ? null : String(r.courseName),
            semesterName: r.semesterName === null ? null : String(r.semesterName),
            examTypeName: r.examTypeName === null ? null : String(r.examTypeName),
        })) as ContributorQuestion[];

        // RAW SQL TEMPLATE (questions count):
        // SELECT COUNT(*) AS total FROM question q WHERE q.userId=? AND q.status='published';
        const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total FROM question q WHERE q.userId = ${userId} AND q.status = ${QuestionStatus.PUBLISHED}
        `);
    const totalArr = countRows as unknown as Array<Record<string, unknown>>;
    const totalCount = parseInt(String(totalArr[0]?.total ?? 0), 10);

        return {
            questions,
            pagination: getPaginationMeta(totalCount, page, pageSize),
        };
    }
}

// Export a singleton instance
export const contributorRepository = new ContributorRepository();
