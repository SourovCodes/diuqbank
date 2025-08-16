import { eq, asc, sql, count } from "drizzle-orm";
import { examTypes, questions, type ExamType, type NewExamType } from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

/**
 * Extended exam type with question count information
 */
export type ExamTypeWithDetails = ExamType & {
    questionCount: number;
};

/**
 * Exam type-specific repository interface
 */
export interface IExamTypeRepository {
    /**
     * Find exam type by name (case insensitive)
     */
    findByName(name: string): Promise<ExamType | null>;

    /**
     * Check if exam type name is taken (case insensitive), optionally excluding an ID
     */
    isNameTaken(name: string, excludeId?: number): Promise<boolean>;

    /**
     * Get exam types with question counts, paginated
     */
    findManyWithQuestionCounts(options: PaginatedFindOptions & { search?: string }): Promise<
        PaginatedResult<ExamTypeWithDetails>
    >;

    /**
     * Get all exam types with question counts (for dropdowns, etc.)
     */
    findAllWithQuestionCounts(): Promise<ExamTypeWithDetails[]>;

    /**
     * Get question count for an exam type
     */
    getQuestionCount(examTypeId: number): Promise<number>;

    /**
     * Migrate questions from one exam type to another
     */
    migrateQuestions(fromExamTypeId: number, toExamTypeId: number): Promise<number>;
}

/**
 * Exam type repository implementation
 */
export class ExamTypeRepository
    extends BaseRepository<ExamType, NewExamType, Partial<NewExamType>, number>
    implements IExamTypeRepository {
    protected table = examTypes;
    protected idColumn = examTypes.id;

    async create(input: NewExamType): Promise<ExamType> {
        const [insertResult] = await db.insert(examTypes).values(input);

        const [examType] = await db
            .select()
            .from(examTypes)
            .where(eq(examTypes.id, insertResult.insertId))
            .limit(1);

        return examType;
    }

    async update(id: number, input: Partial<NewExamType>): Promise<ExamType | null> {
        await db.update(examTypes).set(input).where(eq(examTypes.id, id));

        return this.findById(id);
    }

    async findByName(name: string): Promise<ExamType | null> {
        const result = await db
            .select()
            .from(examTypes)
            .where(sql`LOWER(${examTypes.name}) = LOWER(${name})`)
            .limit(1);

        return (result[0] as ExamType) || null;
    }

    async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
        let whereCondition = sql`LOWER(${examTypes.name}) = LOWER(${name})`;

        if (excludeId !== undefined) {
            whereCondition = sql`LOWER(${examTypes.name}) = LOWER(${name}) AND ${examTypes.id} != ${excludeId}`;
        }

        const result = await db
            .select()
            .from(examTypes)
            .where(whereCondition)
            .limit(1);

        return result.length > 0;
    }

    async findManyWithQuestionCounts(
        options: PaginatedFindOptions & { search?: string }
    ): Promise<PaginatedResult<ExamTypeWithDetails>> {
        const { page, pageSize, search, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build where conditions for search
        const searchCondition = search
            ? sql`LOWER(${examTypes.name}) LIKE LOWER(${`%${search}%`})`
            : undefined;

        // Execute queries in parallel
        const [examTypesResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: examTypes.id,
                    name: examTypes.name,
                    questionCount: count(questions.id),
                })
                .from(examTypes)
                .leftJoin(questions, eq(examTypes.id, questions.examTypeId))
                .where(searchCondition)
                .groupBy(examTypes.id, examTypes.name)
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : asc(examTypes.name))
                .limit(pageSize)
                .offset(offset),

            this.count(searchCondition),
        ]);

        const totalCount = totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: examTypesResult as ExamTypeWithDetails[],
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

    async findAllWithQuestionCounts(): Promise<ExamTypeWithDetails[]> {
        return db
            .select({
                id: examTypes.id,
                name: examTypes.name,
                questionCount: count(questions.id),
            })
            .from(examTypes)
            .leftJoin(questions, eq(examTypes.id, questions.examTypeId))
            .groupBy(examTypes.id, examTypes.name)
            .orderBy(asc(examTypes.name)) as Promise<ExamTypeWithDetails[]>;
    }

    async getQuestionCount(examTypeId: number): Promise<number> {
        const result = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.examTypeId, examTypeId));

        return result[0].count;
    }

    async migrateQuestions(fromExamTypeId: number, toExamTypeId: number): Promise<number> {
        // First get the count of questions to be migrated
        const questionCount = await this.getQuestionCount(fromExamTypeId);

        if (questionCount === 0) {
            return 0;
        }

        // Migrate the questions
        await db
            .update(questions)
            .set({ examTypeId: toExamTypeId })
            .where(eq(questions.examTypeId, fromExamTypeId));

        return questionCount;
    }
}

// Export a singleton instance
export const examTypeRepository = new ExamTypeRepository();
