import { eq, asc, sql, count } from "drizzle-orm";
import { departments, questions, type Department, type NewDepartment } from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

/**
 * Department-specific repository interface
 */
export interface IDepartmentRepository {
    /**
     * Find department by name (case insensitive)
     */
    findByName(name: string): Promise<Department | null>;

    /**
     * Find department by short name (case insensitive)
     */
    findByShortName(shortName: string): Promise<Department | null>;

    /**
     * Check if name or short name already exists (case insensitive), optionally excluding an ID
     */
    isNameOrShortNameTaken(name: string, shortName: string, excludeId?: number): Promise<boolean>;

    /**
     * Get departments with question counts, paginated
     */
    findManyWithQuestionCounts(options: PaginatedFindOptions & { search?: string }): Promise<
        PaginatedResult<Department & { questionCount: number }>
    >;

    /**
     * Get all departments with question counts (for dropdowns, etc.)
     */
    findAllWithQuestionCounts(): Promise<Array<Department & { questionCount: number }>>;

    /**
     * Get question count for a department
     */
    getQuestionCount(departmentId: number): Promise<number>;

    /**
     * Migrate questions from one department to another
     */
    migrateQuestions(fromDepartmentId: number, toDepartmentId: number): Promise<number>;
}

/**
 * Department repository implementation
 */
export class DepartmentRepository
    extends BaseRepository<Department, NewDepartment, Partial<NewDepartment>, number>
    implements IDepartmentRepository {
    protected table = departments;
    protected idColumn = departments.id;

    async create(input: NewDepartment): Promise<Department> {
        const [insertResult] = await db.insert(departments).values(input);

        const [department] = await db
            .select()
            .from(departments)
            .where(eq(departments.id, insertResult.insertId))
            .limit(1);

        return department;
    }

    async update(id: number, input: Partial<NewDepartment>): Promise<Department | null> {
        await db.update(departments).set(input).where(eq(departments.id, id));

        return this.findById(id);
    }

    async findByName(name: string): Promise<Department | null> {
        const result = await db
            .select()
            .from(departments)
            .where(sql`LOWER(${departments.name}) = LOWER(${name})`)
            .limit(1);

        return result[0] || null;
    }

    async findByShortName(shortName: string): Promise<Department | null> {
        const result = await db
            .select()
            .from(departments)
            .where(sql`LOWER(${departments.shortName}) = LOWER(${shortName})`)
            .limit(1);

        return result[0] || null;
    }

    async isNameOrShortNameTaken(
        name: string,
        shortName: string,
        excludeId?: number
    ): Promise<boolean> {
        return !(await this.areFieldsUniqueCaseInsensitive(
            [
                { column: departments.name, value: name },
                { column: departments.shortName, value: shortName },
            ],
            excludeId
        ));
    }

    async findManyWithQuestionCounts(
        options: PaginatedFindOptions & { search?: string }
    ): Promise<PaginatedResult<Department & { questionCount: number }>> {
        const { page, pageSize, search, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build where conditions for search
        const searchCondition = search
            ? sql`(LOWER(${departments.name}) LIKE LOWER(${`%${search}%`}) OR LOWER(${departments.shortName}) LIKE LOWER(${`%${search}%`}))`
            : undefined;

        // Execute queries in parallel
        const [departmentsResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: departments.id,
                    name: departments.name,
                    shortName: departments.shortName,
                    questionCount: count(questions.id),
                })
                .from(departments)
                .leftJoin(questions, eq(departments.id, questions.departmentId))
                .where(searchCondition)
                .groupBy(departments.id, departments.name, departments.shortName)
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : asc(departments.name))
                .limit(pageSize)
                .offset(offset),

            this.count(searchCondition),
        ]);

        const totalCount = totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: departmentsResult,
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

    async findAllWithQuestionCounts(): Promise<Array<Department & { questionCount: number }>> {
        return db
            .select({
                id: departments.id,
                name: departments.name,
                shortName: departments.shortName,
                questionCount: count(questions.id),
            })
            .from(departments)
            .leftJoin(questions, eq(departments.id, questions.departmentId))
            .groupBy(departments.id, departments.name, departments.shortName)
            .orderBy(asc(departments.name));
    }

    async getQuestionCount(departmentId: number): Promise<number> {
        const result = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.departmentId, departmentId));

        return result[0].count;
    }

    async migrateQuestions(fromDepartmentId: number, toDepartmentId: number): Promise<number> {
        // First get the count of questions to be migrated
        const questionCount = await this.getQuestionCount(fromDepartmentId);

        if (questionCount === 0) {
            return 0;
        }

        // Migrate the questions
        await db
            .update(questions)
            .set({ departmentId: toDepartmentId })
            .where(eq(questions.departmentId, fromDepartmentId));

        return questionCount;
    }
}

// Export a singleton instance
export const departmentRepository = new DepartmentRepository();
