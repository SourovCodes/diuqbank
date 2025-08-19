import { sql } from "drizzle-orm";
import { departments, type Department, type NewDepartment } from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

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
  isNameOrShortNameTaken(
    name: string,
    shortName: string,
    excludeId?: number
  ): Promise<boolean>;

  /**
   * Get departments with question counts, paginated
   */
  findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<Department & { questionCount: number }>>;

  /**
   * Get all departments with question counts (for dropdowns, etc.)
   */
  findAllWithQuestionCounts(): Promise<
    Array<Department & { questionCount: number }>
  >;

  /**
   * Get question count for a department
   */
  getQuestionCount(departmentId: number): Promise<number>;

  /**
   * Migrate questions from one department to another
   */
  migrateQuestions(
    fromDepartmentId: number,
    toDepartmentId: number
  ): Promise<number>;
}

/**
 * Department repository implementation
 */
export class DepartmentRepository
  extends BaseRepository<
    Department,
    NewDepartment,
    Partial<NewDepartment>,
    number
  >
  implements IDepartmentRepository
{
  protected table = departments;
  protected idColumn = departments.id;

  async create(input: NewDepartment): Promise<Department> {
    // RAW SQL TEMPLATE:
    // INSERT INTO department (name, shortName) VALUES (?, ?);
    // SELECT id, name, shortName FROM department WHERE id = LAST_INSERT_ID();
    const [insertResult] = await db.execute(
      sql`INSERT INTO department (name, shortName) VALUES (${input.name}, ${input.shortName})`
    );
    const insertId = (insertResult as { insertId: number }).insertId;
    const [rows] = await db.execute(
      sql`SELECT id, name, shortName FROM department WHERE id = ${insertId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return {
      id: Number(data[0].id),
      name: String(data[0].name),
      shortName: String(data[0].shortName),
    };
  }

  async update(
    id: number,
    input: Partial<NewDepartment>
  ): Promise<Department | null> {
    // RAW SQL TEMPLATE:
    // UPDATE department SET name = ?, shortName = ? WHERE id = ?; (only provided fields)
    const hasName = input.name !== undefined;
    const hasShort = input.shortName !== undefined;
    if (!hasName && !hasShort) return this.findById(id);
    if (hasName && hasShort) {
      await db.execute(
        sql`UPDATE department SET name = ${input.name}, shortName = ${input.shortName} WHERE id = ${id}`
      );
    } else if (hasName) {
      await db.execute(
        sql`UPDATE department SET name = ${input.name} WHERE id = ${id}`
      );
    } else if (hasShort) {
      await db.execute(
        sql`UPDATE department SET shortName = ${input.shortName} WHERE id = ${id}`
      );
    }
    return this.findById(id);
  }

  async findByName(name: string): Promise<Department | null> {
    // RAW SQL TEMPLATE:
    // SELECT id, name, shortName FROM department WHERE LOWER(name)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(
      sql`SELECT id, name, shortName FROM department WHERE LOWER(name) = LOWER(${name}) LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return {
      id: Number(data[0].id),
      name: String(data[0].name),
      shortName: String(data[0].shortName),
    };
  }

  async findByShortName(shortName: string): Promise<Department | null> {
    // RAW SQL TEMPLATE:
    // SELECT id, name, shortName FROM department WHERE LOWER(shortName)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(
      sql`SELECT id, name, shortName FROM department WHERE LOWER(shortName) = LOWER(${shortName}) LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return {
      id: Number(data[0].id),
      name: String(data[0].name),
      shortName: String(data[0].shortName),
    };
  }

  async isNameOrShortNameTaken(
    name: string,
    shortName: string,
    excludeId?: number
  ): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM department WHERE (LOWER(name)=LOWER(?) OR LOWER(shortName)=LOWER(?)) [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM department WHERE (LOWER(name) = LOWER(${name}) OR LOWER(shortName) = LOWER(${shortName}))`;
    if (excludeId !== undefined) {
      query = sql`${query} AND id != ${excludeId}`;
    }
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    const data = rows as unknown as Array<unknown>;
    return data.length > 0;
  }

  async findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<Department & { questionCount: number }>> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE (paginated departments with counts):
    // SELECT d.id,d.name,d.shortName, COUNT(q.id) AS questionCount
    // FROM department d
    // LEFT JOIN question q ON d.id = q.departmentId
    // [WHERE (LOWER(d.name) LIKE LOWER(?) OR LOWER(d.shortName) LIKE LOWER(?))]
    // GROUP BY d.id,d.name,d.shortName
    // ORDER BY d.name ASC
    // LIMIT ? OFFSET ?;
    const searchFilter = search ? `%${search}%` : null;
    let whereClause = sql``;
    if (searchFilter) {
      whereClause = sql`WHERE (LOWER(d.name) LIKE LOWER(${searchFilter}) OR LOWER(d.shortName) LIKE LOWER(${searchFilter}))`;
    }
    const [rows] = await db.execute(sql`
            SELECT d.id, d.name, d.shortName, COUNT(q.id) AS questionCount
            FROM department d
            LEFT JOIN question q ON d.id = q.departmentId
            ${whereClause}
            GROUP BY d.id, d.name, d.shortName
            ORDER BY d.name ASC
            LIMIT ${pageSize} OFFSET ${offset}
        `);
    const data = (rows as unknown as Array<Record<string, unknown>>).map(
      (r) => ({
        id: Number(r.id),
        name: String(r.name),
        shortName: String(r.shortName),
        questionCount:
          typeof r.questionCount === "number"
            ? (r.questionCount as number)
            : parseInt(String(r.questionCount ?? 0), 10),
      })
    );

    // RAW SQL TEMPLATE (total departments count):
    // SELECT COUNT(*) AS total FROM department d [WHERE ...];
    const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total FROM department d
            ${whereClause}
        `);
    const totalCount = parseInt(
      String(
        (countRows as unknown as Array<Record<string, unknown>>)[0]?.total ?? 0
      ),
      10
    );
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
      data: data as Array<Department & { questionCount: number }>,
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

  async findAllWithQuestionCounts(): Promise<
    Array<Department & { questionCount: number }>
  > {
    // RAW SQL TEMPLATE:
    // SELECT d.id,d.name,d.shortName, COUNT(q.id) AS questionCount
    // FROM department d
    // LEFT JOIN question q ON d.id = q.departmentId
    // GROUP BY d.id,d.name,d.shortName
    // ORDER BY d.name ASC;
    const [rows] = await db.execute(sql`
            SELECT d.id, d.name, d.shortName, COUNT(q.id) AS questionCount
            FROM department d
            LEFT JOIN question q ON d.id = q.departmentId
            GROUP BY d.id, d.name, d.shortName
            ORDER BY d.name ASC
        `);
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      shortName: String(r.shortName),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    }));
  }

  async getQuestionCount(departmentId: number): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) AS count FROM question WHERE departmentId=?;
    const [rows] = await db.execute(
      sql`SELECT COUNT(*) AS count FROM question WHERE departmentId = ${departmentId}`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return parseInt(String(data[0]?.count ?? 0), 10);
  }

  async migrateQuestions(
    fromDepartmentId: number,
    toDepartmentId: number
  ): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) FROM question WHERE departmentId=?; (store as n)
    // UPDATE question SET departmentId=? WHERE departmentId=?; (return n)
    const count = await this.getQuestionCount(fromDepartmentId);
    if (count === 0) return 0;
    await db.execute(
      sql`UPDATE question SET departmentId = ${toDepartmentId} WHERE departmentId = ${fromDepartmentId}`
    );
    return count;
  }
}

// Export a singleton instance
export const departmentRepository = new DepartmentRepository();
