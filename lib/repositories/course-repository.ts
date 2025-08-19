import { sql } from "drizzle-orm";
import { courses, type Course, type NewCourse } from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

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
  findByNameInDepartment(
    name: string,
    departmentId: number
  ): Promise<Course | null>;

  /**
   * Check if course name is taken within a department (case insensitive), optionally excluding an ID
   */
  isNameTakenInDepartment(
    name: string,
    departmentId: number,
    excludeId?: number
  ): Promise<boolean>;

  /**
   * Get courses with department details and question counts, paginated
   */
  findManyWithDetails(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<CourseWithDetails>>;

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
  findByDepartmentIdWithDetails(
    departmentId: number
  ): Promise<CourseWithDetails[]>;
}

/**
 * Course repository implementation
 */
export class CourseRepository
  extends BaseRepository<Course, NewCourse, Partial<NewCourse>, number>
  implements ICourseRepository
{
  protected table = courses;
  protected idColumn = courses.id;

  // Helper to map raw row objects to CourseWithDetails where needed
  private mapCourse(row: Record<string, unknown>): Course {
    return {
      id: Number(row.id),
      name: String(row.name),
      departmentId: Number(row.departmentId),
    };
  }

  async create(input: NewCourse): Promise<Course> {
    // RAW SQL TEMPLATE:
    // INSERT INTO course (name, departmentId) VALUES (?, ?);
    // SELECT * FROM course WHERE id = LAST_INSERT_ID();
    const [insertResult] = await db.execute(
      sql`INSERT INTO course (name, departmentId) VALUES (${input.name}, ${input.departmentId})`
    );
    const insertId = (insertResult as { insertId: number }).insertId;
    const [rows] = await db.execute(
      sql`SELECT id, name, departmentId FROM course WHERE id = ${insertId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return this.mapCourse(data[0]);
  }

  async update(id: number, input: Partial<NewCourse>): Promise<Course | null> {
    // RAW SQL TEMPLATE:
    // UPDATE course SET name = COALESCE(?, name), departmentId = COALESCE(?, departmentId) WHERE id = ?;
    const hasName = input.name !== undefined;
    const hasDept = input.departmentId !== undefined;
    if (!hasName && !hasDept) {
      return this.findById(id);
    }
    // Handle combinations explicitly to avoid dynamic SQL array typing issues
    if (hasName && hasDept) {
      await db.execute(
        sql`UPDATE course SET name = ${input.name}, departmentId = ${input.departmentId} WHERE id = ${id}`
      );
    } else if (hasName) {
      await db.execute(
        sql`UPDATE course SET name = ${input.name} WHERE id = ${id}`
      );
    } else if (hasDept) {
      await db.execute(
        sql`UPDATE course SET departmentId = ${input.departmentId} WHERE id = ${id}`
      );
    }
    return this.findById(id);
  }

  async findByNameInDepartment(
    name: string,
    departmentId: number
  ): Promise<Course | null> {
    // RAW SQL TEMPLATE:
    // SELECT * FROM course WHERE departmentId = ? AND LOWER(name) = LOWER(?) LIMIT 1;
    const [rows] = await db.execute(
      sql`SELECT id, name, departmentId FROM course WHERE departmentId = ${departmentId} AND LOWER(name) = LOWER(${name}) LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return data[0] ? this.mapCourse(data[0]) : null;
  }

  async isNameTakenInDepartment(
    name: string,
    departmentId: number,
    excludeId?: number
  ): Promise<boolean> {
    // RAW SQL TEMPLATE (with optional exclusion):
    // SELECT 1 FROM course WHERE departmentId = ? AND LOWER(name) = LOWER(?) [AND id != ?] LIMIT 1;
    let query = sql`SELECT 1 FROM course WHERE departmentId = ${departmentId} AND LOWER(name) = LOWER(${name})`;
    if (excludeId !== undefined) {
      query = sql`${query} AND id != ${excludeId}`;
    }
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    const arr = rows as unknown as Array<unknown>;
    return arr.length > 0;
  }

  async findManyWithDetails(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<CourseWithDetails>> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE:
    // SELECT c.id, c.name, c.departmentId, d.name AS departmentName, d.shortName AS departmentShortName,
    //        COUNT(q.id) AS questionCount
    // FROM course c
    // LEFT JOIN department d ON c.departmentId = d.id
    // LEFT JOIN question q ON c.id = q.courseId
    // WHERE ( (LOWER(c.name) LIKE LOWER(?)) OR (LOWER(d.name) LIKE LOWER(?)) ) -- only if search provided
    // GROUP BY c.id, c.name, c.departmentId, d.name, d.shortName
    // ORDER BY c.name ASC
    // LIMIT ? OFFSET ?;
    const searchFilter = search ? `%${search}%` : null;
    let whereClause = sql``;
    if (searchFilter) {
      whereClause = sql`WHERE (LOWER(c.name) LIKE LOWER(${searchFilter}) OR LOWER(d.name) LIKE LOWER(${searchFilter}))`;
    }
    const [rows] = await db.execute(sql`
            SELECT c.id, c.name, c.departmentId, d.name AS departmentName, d.shortName AS departmentShortName,
                   COUNT(q.id) AS questionCount
            FROM course c
            LEFT JOIN department d ON c.departmentId = d.id
            LEFT JOIN question q ON c.id = q.courseId
            ${whereClause}
            GROUP BY c.id, c.name, c.departmentId, d.name, d.shortName
            ORDER BY c.name ASC
            LIMIT ${pageSize} OFFSET ${offset}
        `);
    const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total
            FROM course c
            LEFT JOIN department d ON c.departmentId = d.id
            ${whereClause}
        `);
    const countArr = countRows as unknown as Array<Record<string, unknown>>;
    const totalCount = parseInt(String(countArr[0]?.total ?? 0), 10);
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const data: CourseWithDetails[] = (
      rows as unknown as Array<Record<string, unknown>>
    ).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      departmentId: Number(r.departmentId),
      departmentName: String(r.departmentName),
      departmentShortName: String(r.departmentShortName),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    }));
    return {
      data,
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
    // RAW SQL TEMPLATE:
    // SELECT c.id, c.name, c.departmentId, d.name AS departmentName, d.shortName AS departmentShortName,
    //        COUNT(q.id) AS questionCount
    // FROM course c
    // LEFT JOIN department d ON c.departmentId = d.id
    // LEFT JOIN question q ON c.id = q.courseId
    // GROUP BY c.id, c.name, c.departmentId, d.name, d.shortName
    // ORDER BY c.name ASC;
    const [rows] = await db.execute(sql`
            SELECT c.id, c.name, c.departmentId, d.name AS departmentName, d.shortName AS departmentShortName,
                   COUNT(q.id) AS questionCount
            FROM course c
            LEFT JOIN department d ON c.departmentId = d.id
            LEFT JOIN question q ON c.id = q.courseId
            GROUP BY c.id, c.name, c.departmentId, d.name, d.shortName
            ORDER BY c.name ASC
        `);
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      departmentId: Number(r.departmentId),
      departmentName: String(r.departmentName),
      departmentShortName: String(r.departmentShortName),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    })) as CourseWithDetails[];
  }

  async getQuestionCount(courseId: number): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) AS count FROM question WHERE courseId = ?;
    const [rows] = await db.execute(
      sql`SELECT COUNT(*) AS count FROM question WHERE courseId = ${courseId}`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return parseInt(String(data[0]?.count ?? 0), 10);
  }

  async migrateQuestions(
    fromCourseId: number,
    toCourseId: number
  ): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) FROM question WHERE courseId = ?; (store as n)
    // UPDATE question SET courseId = ? WHERE courseId = ?; (return n)
    const questionCount = await this.getQuestionCount(fromCourseId);
    if (questionCount === 0) return 0;
    await db.execute(
      sql`UPDATE question SET courseId = ${toCourseId} WHERE courseId = ${fromCourseId}`
    );
    return questionCount;
  }

  async findByDepartmentId(departmentId: number): Promise<Course[]> {
    // RAW SQL TEMPLATE:
    // SELECT id, name, departmentId FROM course WHERE departmentId = ? ORDER BY name ASC;
    const [rows] = await db.execute(
      sql`SELECT id, name, departmentId FROM course WHERE departmentId = ${departmentId} ORDER BY name ASC`
    );
    return (rows as unknown as Array<Record<string, unknown>>).map((r) =>
      this.mapCourse(r)
    );
  }

  async findByDepartmentIdWithDetails(
    departmentId: number
  ): Promise<CourseWithDetails[]> {
    // RAW SQL TEMPLATE:
    // SELECT c.id, c.name, c.departmentId, d.name AS departmentName, d.shortName AS departmentShortName,
    //        COUNT(q.id) AS questionCount
    // FROM course c
    // LEFT JOIN department d ON c.departmentId = d.id
    // LEFT JOIN question q ON c.id = q.courseId
    // WHERE c.departmentId = ?
    // GROUP BY c.id, c.name, c.departmentId, d.name, d.shortName
    // ORDER BY c.name ASC;
    const [rows] = await db.execute(sql`
            SELECT c.id, c.name, c.departmentId, d.name AS departmentName, d.shortName AS departmentShortName,
                   COUNT(q.id) AS questionCount
            FROM course c
            LEFT JOIN department d ON c.departmentId = d.id
            LEFT JOIN question q ON c.id = q.courseId
            WHERE c.departmentId = ${departmentId}
            GROUP BY c.id, c.name, c.departmentId, d.name, d.shortName
            ORDER BY c.name ASC
        `);
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      departmentId: Number(r.departmentId),
      departmentName: String(r.departmentName),
      departmentShortName: String(r.departmentShortName),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    })) as CourseWithDetails[];
  }
}

// Export a singleton instance
export const courseRepository = new CourseRepository();
