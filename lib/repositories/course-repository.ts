import { eq, asc, sql, count, and } from "drizzle-orm";
import { courses, questions, departments, type Course, type NewCourse } from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

/**
 * Extended course type with department and question count information
 */
export type CourseWithDetails = Course & {
    departmentName: string;
    departmentShortName: string;
    questionCount: number;
};

/**
 * Course-specific repository interface
 */
export interface ICourseRepository {
    /**
     * Find course by name within a specific department (case insensitive)
     */
    findByNameInDepartment(name: string, departmentId: number): Promise<Course | null>;

    /**
     * Check if course name is taken within a department (case insensitive), optionally excluding an ID
     */
    isNameTakenInDepartment(name: string, departmentId: number, excludeId?: number): Promise<boolean>;

    /**
     * Get courses with department details and question counts, paginated
     */
    findManyWithDetails(options: PaginatedFindOptions & { search?: string }): Promise<
        PaginatedResult<CourseWithDetails>
    >;

    /**
     * Get all courses with department details and question counts (for dropdowns, etc.)
     */
    findAllWithDetails(): Promise<CourseWithDetails[]>;

    /**
     * Get question count for a course
     */
    getQuestionCount(courseId: number): Promise<number>;

    /**
     * Migrate questions from one course to another
     */
    migrateQuestions(fromCourseId: number, toCourseId: number): Promise<number>;

    /**
     * Find courses by department ID
     */
    findByDepartmentId(departmentId: number): Promise<Course[]>;

    /**
     * Get courses within a specific department with details
     */
    findByDepartmentIdWithDetails(departmentId: number): Promise<CourseWithDetails[]>;
}

/**
 * Course repository implementation
 */
export class CourseRepository
    extends BaseRepository<Course, NewCourse, Partial<NewCourse>, number>
    implements ICourseRepository {
    protected table = courses;
    protected idColumn = courses.id;

    async create(input: NewCourse): Promise<Course> {
        const [insertResult] = await db.insert(courses).values(input);

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, insertResult.insertId))
            .limit(1);

        return course;
    }

    async update(id: number, input: Partial<NewCourse>): Promise<Course | null> {
        await db.update(courses).set(input).where(eq(courses.id, id));

        return this.findById(id);
    }

    async findByNameInDepartment(name: string, departmentId: number): Promise<Course | null> {
        const result = await db
            .select()
            .from(courses)
            .where(
                and(
                    eq(courses.departmentId, departmentId),
                    sql`LOWER(${courses.name}) = LOWER(${name})`
                )
            )
            .limit(1);

        return (result[0] as Course) || null;
    }

    async isNameTakenInDepartment(
        name: string,
        departmentId: number,
        excludeId?: number
    ): Promise<boolean> {
        let whereCondition = and(
            eq(courses.departmentId, departmentId),
            sql`LOWER(${courses.name}) = LOWER(${name})`
        );

        if (excludeId !== undefined) {
            whereCondition = and(
                whereCondition,
                sql`${courses.id} != ${excludeId}`
            ) as typeof whereCondition;
        }

        const result = await db
            .select()
            .from(courses)
            .where(whereCondition)
            .limit(1);

        return result.length > 0;
    }

    async findManyWithDetails(
        options: PaginatedFindOptions & { search?: string }
    ): Promise<PaginatedResult<CourseWithDetails>> {
        const { page, pageSize, search, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build where conditions for search
        const baseCondition = sql`1=1`;
        const searchCondition = search
            ? and(
                baseCondition,
                sql`(LOWER(${courses.name}) LIKE LOWER(${`%${search}%`}) OR 
               LOWER(${departments.name}) LIKE LOWER(${`%${search}%`}))`
            )
            : baseCondition;

        // Execute queries in parallel
        const [coursesResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: courses.id,
                    name: courses.name,
                    departmentId: courses.departmentId,
                    departmentName: departments.name,
                    departmentShortName: departments.shortName,
                    questionCount: count(questions.id),
                })
                .from(courses)
                .leftJoin(departments, eq(courses.departmentId, departments.id))
                .leftJoin(questions, eq(courses.id, questions.courseId))
                .where(searchCondition)
                .groupBy(
                    courses.id,
                    courses.name,
                    courses.departmentId,
                    departments.name,
                    departments.shortName
                )
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : asc(courses.name))
                .limit(pageSize)
                .offset(offset),

            db
                .select({ count: count() })
                .from(courses)
                .leftJoin(departments, eq(courses.departmentId, departments.id))
                .where(searchCondition),
        ]);

        const totalCount = totalCountResult[0].count;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: coursesResult as CourseWithDetails[],
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

    async findAllWithDetails(): Promise<CourseWithDetails[]> {
        return db
            .select({
                id: courses.id,
                name: courses.name,
                departmentId: courses.departmentId,
                departmentName: departments.name,
                departmentShortName: departments.shortName,
                questionCount: count(questions.id),
            })
            .from(courses)
            .leftJoin(departments, eq(courses.departmentId, departments.id))
            .leftJoin(questions, eq(courses.id, questions.courseId))
            .groupBy(
                courses.id,
                courses.name,
                courses.departmentId,
                departments.name,
                departments.shortName
            )
            .orderBy(asc(courses.name)) as Promise<CourseWithDetails[]>;
    }

    async getQuestionCount(courseId: number): Promise<number> {
        const result = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.courseId, courseId));

        return result[0].count;
    }

    async migrateQuestions(fromCourseId: number, toCourseId: number): Promise<number> {
        // First get the count of questions to be migrated
        const questionCount = await this.getQuestionCount(fromCourseId);

        if (questionCount === 0) {
            return 0;
        }

        // Migrate the questions
        await db
            .update(questions)
            .set({ courseId: toCourseId })
            .where(eq(questions.courseId, fromCourseId));

        return questionCount;
    }

    async findByDepartmentId(departmentId: number): Promise<Course[]> {
        const result = await db
            .select()
            .from(courses)
            .where(eq(courses.departmentId, departmentId))
            .orderBy(asc(courses.name));

        return result as Course[];
    }

    async findByDepartmentIdWithDetails(departmentId: number): Promise<CourseWithDetails[]> {
        return db
            .select({
                id: courses.id,
                name: courses.name,
                departmentId: courses.departmentId,
                departmentName: departments.name,
                departmentShortName: departments.shortName,
                questionCount: count(questions.id),
            })
            .from(courses)
            .leftJoin(departments, eq(courses.departmentId, departments.id))
            .leftJoin(questions, eq(courses.id, questions.courseId))
            .where(eq(courses.departmentId, departmentId))
            .groupBy(
                courses.id,
                courses.name,
                courses.departmentId,
                departments.name,
                departments.shortName
            )
            .orderBy(asc(courses.name)) as Promise<CourseWithDetails[]>;
    }
}

// Export a singleton instance
export const courseRepository = new CourseRepository();
