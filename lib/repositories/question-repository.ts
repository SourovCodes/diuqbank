import { eq, desc, asc, and, count, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
    questions,
    departments,
    courses,
    semesters,
    examTypes,
    users,
    type Question,
    type NewQuestion,
    QuestionStatus
} from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

interface MySqlUpdateResult {
    rowsAffected: number;
}

/**
 * Question with full relationship details
 */
export type QuestionWithDetails = Question & {
    departmentName: string | null;
    departmentShortName: string | null;
    courseName: string | null;
    semesterName: string | null;
    examTypeName: string | null;
    userName: string | null;
    userUsername?: string | null;
};

/**
 * Public question type (filtered fields for public display)
 */
export type PublicQuestion = {
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
    userName: string | null;
    userId: string | null;
    userUsername: string | null;
};

/**
 * Filter options for dropdowns
 */
export type FilterOptions = {
    departments: Array<{ id: number; name: string; shortName: string }>;
    courses: Array<{ id: number; name: string; departmentId: number }>;
    semesters: Array<{ id: number; name: string }>;
    examTypes: Array<{ id: number; name: string }>;
};

/**
 * Dropdown option type
 */
export type DropdownOption = {
    id: number;
    name: string;
};

/**
 * User dropdown option
 */
export type UserDropdownOption = {
    id: string;
    name: string;
    email: string;
};

/**
 * Question search and filter options
 */
export interface QuestionSearchOptions extends PaginatedFindOptions {
    search?: string;
    departmentId?: number;
    courseId?: number;
    semesterId?: number;
    examTypeId?: number;
    status?: keyof typeof QuestionStatus;
    userId?: string;
}

/**
 * Question-specific repository interface
 */
export interface IQuestionRepository {
    /**
     * Check if a question with the same combination already exists
     */
    isDuplicateQuestion(
        departmentId: number,
        courseId: number,
        semesterId: number,
        examTypeId: number,
        excludeId?: number
    ): Promise<boolean>;

    /**
     * Get questions with full details and filtering
     */
    findManyWithDetails(options: QuestionSearchOptions): Promise<PaginatedResult<QuestionWithDetails>>;

    /**
     * Get published questions for public view
     */
    findPublishedQuestions(options: Omit<QuestionSearchOptions, 'status' | 'userId'>): Promise<PaginatedResult<PublicQuestion>>;

    /**
     * Get a single question with full details
     */
    findByIdWithDetails(id: number): Promise<QuestionWithDetails | null>;

    /**
     * Get a single published question for public view
     */
    findPublishedById(id: number): Promise<PublicQuestion | null>;

    /**
     * Update question status
     */
    updateStatus(id: number, status: keyof typeof QuestionStatus): Promise<boolean>;

    /**
     * Increment view count
     */
    incrementViewCount(id: number): Promise<boolean>;

    /**
     * Get dropdown options for departments
     */
    getDepartmentOptions(): Promise<DropdownOption[]>;

    /**
     * Get dropdown options for courses (filtered by department)
     */
    getCourseOptions(departmentId: number): Promise<DropdownOption[]>;

    /**
     * Get dropdown options for semesters
     */
    getSemesterOptions(): Promise<DropdownOption[]>;

    /**
     * Get dropdown options for exam types
     */
    getExamTypeOptions(): Promise<DropdownOption[]>;

    /**
     * Get dropdown options for users
     */
    getUserOptions(): Promise<UserDropdownOption[]>;

    /**
     * Get all filter options at once
     */
    getFilterOptions(): Promise<FilterOptions>;

    /**
     * Check if user owns a question
     */
    isQuestionOwnedByUser(questionId: number, userId: string): Promise<boolean>;

    /**
     * Delete question and return PDF key for S3 cleanup
     */
    deleteWithPdfKey(id: number): Promise<{ success: boolean; pdfKey?: string }>;
}

/**
 * Question repository implementation
 */
export class QuestionRepository
    extends BaseRepository<Question, NewQuestion, Partial<NewQuestion>>
    implements IQuestionRepository {
    protected table = questions;
    protected idColumn = questions.id;

    async create(input: NewQuestion): Promise<Question> {
        const [insertResult] = await db.insert(questions).values(input);

        const [question] = await db
            .select()
            .from(questions)
            .where(eq(questions.id, insertResult.insertId))
            .limit(1);

        return question;
    }

    async update(id: number, input: Partial<NewQuestion>): Promise<Question | null> {
        await db.update(questions).set(input).where(eq(questions.id, id));

        return this.findById(id);
    }

    async isDuplicateQuestion(
        departmentId: number,
        courseId: number,
        semesterId: number,
        examTypeId: number,
        excludeId?: number
    ): Promise<boolean> {
        let whereCondition = and(
            eq(questions.departmentId, departmentId),
            eq(questions.courseId, courseId),
            eq(questions.semesterId, semesterId),
            eq(questions.examTypeId, examTypeId)
        );

        if (excludeId !== undefined) {
            whereCondition = and(
                whereCondition,
                sql`${questions.id} != ${excludeId}`
            ) as typeof whereCondition;
        }

        const result = await db
            .select({ id: questions.id })
            .from(questions)
            .where(whereCondition)
            .limit(1);

        return result.length > 0;
    }

    async findManyWithDetails(options: QuestionSearchOptions): Promise<PaginatedResult<QuestionWithDetails>> {
        const { page, pageSize, search, departmentId, courseId, semesterId, examTypeId, status, userId, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const whereConditions: SQL<unknown>[] = [];

        if (search) {
            whereConditions.push(
                sql`(
          LOWER(${departments.name}) LIKE LOWER(${`%${search}%`}) OR 
          LOWER(${courses.name}) LIKE LOWER(${`%${search}%`}) OR 
          LOWER(${semesters.name}) LIKE LOWER(${`%${search}%`}) OR 
          LOWER(${examTypes.name}) LIKE LOWER(${`%${search}%`})
        )` as SQL<unknown>
            );
        }

        if (departmentId) {
            whereConditions.push(eq(questions.departmentId, departmentId) as SQL<unknown>);
        }

        if (courseId) {
            whereConditions.push(eq(questions.courseId, courseId) as SQL<unknown>);
        }

        if (semesterId) {
            whereConditions.push(eq(questions.semesterId, semesterId) as SQL<unknown>);
        }

        if (examTypeId) {
            whereConditions.push(eq(questions.examTypeId, examTypeId) as SQL<unknown>);
        }

        if (status) {
            whereConditions.push(eq(questions.status, QuestionStatus[status]) as SQL<unknown>);
        }

        if (userId) {
            whereConditions.push(eq(questions.userId, userId) as SQL<unknown>);
        }

        const whereCondition = whereConditions.length > 0
            ? whereConditions.reduce<SQL<unknown>>(
                (acc, cond) => and(acc, cond) as SQL<unknown>,
                sql`1=1` as SQL<unknown>
            )
            : undefined;

        // Execute queries in parallel
        const [questionsResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: questions.id,
                    userId: questions.userId,
                    departmentId: questions.departmentId,
                    courseId: questions.courseId,
                    semesterId: questions.semesterId,
                    examTypeId: questions.examTypeId,
                    status: questions.status,
                    pdfKey: questions.pdfKey,
                    pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
                    viewCount: questions.viewCount,
                    createdAt: questions.createdAt,
                    updatedAt: questions.updatedAt,
                    departmentName: departments.name,
                    departmentShortName: departments.shortName,
                    courseName: courses.name,
                    semesterName: semesters.name,
                    examTypeName: examTypes.name,
                    userName: users.name,
                })
                .from(questions)
                .leftJoin(departments, eq(questions.departmentId, departments.id))
                .leftJoin(courses, eq(questions.courseId, courses.id))
                .leftJoin(semesters, eq(questions.semesterId, semesters.id))
                .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
                .leftJoin(users, eq(questions.userId, users.id))
                .where(whereCondition)
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : desc(questions.createdAt))
                .limit(pageSize)
                .offset(offset),

            // Count with same conditions (optimized for search vs no-search)
            search
                ? db
                    .select({ count: count() })
                    .from(questions)
                    .leftJoin(departments, eq(questions.departmentId, departments.id))
                    .leftJoin(courses, eq(questions.courseId, courses.id))
                    .leftJoin(semesters, eq(questions.semesterId, semesters.id))
                    .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
                    .where(whereCondition)
                : this.count(whereCondition),
        ]);

        const totalCount = Array.isArray(totalCountResult) ? totalCountResult[0].count : totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: questionsResult as QuestionWithDetails[],
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                pageSize,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }

    async findPublishedQuestions(
        options: Omit<QuestionSearchOptions, 'status' | 'userId'>
    ): Promise<PaginatedResult<PublicQuestion>> {
        const { page, pageSize, departmentId, courseId, semesterId, examTypeId, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build where conditions (always include published status)
        const whereConditions: SQL<unknown>[] = [
            eq(questions.status, QuestionStatus.PUBLISHED) as SQL<unknown>
        ];

        if (departmentId) {
            whereConditions.push(eq(questions.departmentId, departmentId) as SQL<unknown>);
        }

        if (courseId) {
            whereConditions.push(eq(questions.courseId, courseId) as SQL<unknown>);
        }

        if (semesterId) {
            whereConditions.push(eq(questions.semesterId, semesterId) as SQL<unknown>);
        }

        if (examTypeId) {
            whereConditions.push(eq(questions.examTypeId, examTypeId) as SQL<unknown>);
        }

        const whereCondition = whereConditions.reduce<SQL<unknown>>(
            (acc, cond) => and(acc, cond) as SQL<unknown>,
            sql`1=1` as SQL<unknown>
        );

        // Execute queries in parallel
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
                    userName: users.name,
                    userId: users.id,
                    userUsername: users.username,
                })
                .from(questions)
                .leftJoin(departments, eq(questions.departmentId, departments.id))
                .leftJoin(courses, eq(questions.courseId, courses.id))
                .leftJoin(semesters, eq(questions.semesterId, semesters.id))
                .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
                .leftJoin(users, eq(questions.userId, users.id))
                .where(whereCondition)
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : desc(questions.createdAt))
                .limit(pageSize)
                .offset(offset),

            this.count(whereCondition),
        ]);

        const totalCount = totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: questionsResult as PublicQuestion[],
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                pageSize,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }

    async findByIdWithDetails(id: number): Promise<QuestionWithDetails | null> {
        const result = await db
            .select({
                id: questions.id,
                userId: questions.userId,
                departmentId: questions.departmentId,
                courseId: questions.courseId,
                semesterId: questions.semesterId,
                examTypeId: questions.examTypeId,
                status: questions.status,
                pdfKey: questions.pdfKey,
                pdfFileSizeInBytes: questions.pdfFileSizeInBytes,
                viewCount: questions.viewCount,
                createdAt: questions.createdAt,
                updatedAt: questions.updatedAt,
                departmentName: departments.name,
                departmentShortName: departments.shortName,
                courseName: courses.name,
                semesterName: semesters.name,
                examTypeName: examTypes.name,
                userName: users.name,
            })
            .from(questions)
            .leftJoin(departments, eq(questions.departmentId, departments.id))
            .leftJoin(courses, eq(questions.courseId, courses.id))
            .leftJoin(semesters, eq(questions.semesterId, semesters.id))
            .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
            .leftJoin(users, eq(questions.userId, users.id))
            .where(eq(questions.id, id))
            .limit(1);

        return (result[0] as QuestionWithDetails) || null;
    }

    async findPublishedById(id: number): Promise<PublicQuestion | null> {
        const result = await db
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
                userName: users.name,
                userId: users.id,
                userUsername: users.username,
            })
            .from(questions)
            .leftJoin(departments, eq(questions.departmentId, departments.id))
            .leftJoin(courses, eq(questions.courseId, courses.id))
            .leftJoin(semesters, eq(questions.semesterId, semesters.id))
            .leftJoin(examTypes, eq(questions.examTypeId, examTypes.id))
            .leftJoin(users, eq(questions.userId, users.id))
            .where(and(
                eq(questions.id, id),
                eq(questions.status, QuestionStatus.PUBLISHED)
            ))
            .limit(1);

        return (result[0] as PublicQuestion) || null;
    }

    async updateStatus(id: number, status: keyof typeof QuestionStatus): Promise<boolean> {
        const result = await db
            .update(questions)
            .set({ status: QuestionStatus[status] })
            .where(eq(questions.id, id));

        return (result as unknown as MySqlUpdateResult).rowsAffected > 0;
    }

    async incrementViewCount(id: number): Promise<boolean> {
        const result = await db
            .update(questions)
            .set({
                viewCount: sql`${questions.viewCount} + 1`,
            })
            .where(eq(questions.id, id));

        return (result as unknown as MySqlUpdateResult).rowsAffected > 0;
    }

    async getDepartmentOptions(): Promise<DropdownOption[]> {
        return db
            .select({
                id: departments.id,
                name: departments.shortName,
            })
            .from(departments)
            .orderBy(asc(departments.shortName)) as Promise<DropdownOption[]>;
    }

    async getCourseOptions(departmentId: number): Promise<DropdownOption[]> {
        return db
            .select({
                id: courses.id,
                name: courses.name,
            })
            .from(courses)
            .where(eq(courses.departmentId, departmentId))
            .orderBy(asc(courses.name)) as Promise<DropdownOption[]>;
    }

    async getSemesterOptions(): Promise<DropdownOption[]> {
        return db
            .select({
                id: semesters.id,
                name: semesters.name,
            })
            .from(semesters)
            .orderBy(asc(semesters.name)) as Promise<DropdownOption[]>;
    }

    async getExamTypeOptions(): Promise<DropdownOption[]> {
        return db
            .select({
                id: examTypes.id,
                name: examTypes.name,
            })
            .from(examTypes)
            .orderBy(asc(examTypes.name)) as Promise<DropdownOption[]>;
    }

    async getUserOptions(): Promise<UserDropdownOption[]> {
        return db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .orderBy(asc(users.email)) as Promise<UserDropdownOption[]>;
    }

    async getFilterOptions(): Promise<FilterOptions> {
        const [departmentsResult, coursesResult, semestersResult, examTypesResult] = await Promise.all([
            db
                .select({
                    id: departments.id,
                    name: departments.name,
                    shortName: departments.shortName,
                })
                .from(departments)
                .orderBy(departments.name),

            db
                .select({
                    id: courses.id,
                    name: courses.name,
                    departmentId: courses.departmentId,
                })
                .from(courses)
                .orderBy(courses.name),

            db
                .select({
                    id: semesters.id,
                    name: semesters.name,
                })
                .from(semesters)
                .orderBy(semesters.name),

            db
                .select({
                    id: examTypes.id,
                    name: examTypes.name,
                })
                .from(examTypes)
                .orderBy(examTypes.name),
        ]);

        return {
            departments: departmentsResult,
            courses: coursesResult,
            semesters: semestersResult,
            examTypes: examTypesResult,
        };
    }

    async isQuestionOwnedByUser(questionId: number, userId: string): Promise<boolean> {
        const result = await db
            .select({ userId: questions.userId })
            .from(questions)
            .where(eq(questions.id, questionId))
            .limit(1);

        return result.length > 0 && result[0].userId === userId;
    }

    async deleteWithPdfKey(id: number): Promise<{ success: boolean; pdfKey?: string }> {
        // First get the PDF key for cleanup
        const existingQuestion = await db
            .select({ pdfKey: questions.pdfKey })
            .from(questions)
            .where(eq(questions.id, id))
            .limit(1);

        if (existingQuestion.length === 0) {
            return { success: false };
        }

        // Delete the question
        const deleted = await this.delete(id);

        return {
            success: deleted,
            pdfKey: existingQuestion[0].pdfKey || undefined,
        };
    }
}

// Export a singleton instance
export const questionRepository = new QuestionRepository();
