import { sql } from "drizzle-orm";
import { semesters, type Semester, type NewSemester } from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

/**
 * Extended semester type with question count information
 */
export type SemesterWithDetails = Semester & {
  questionCount: number;
};

/**
 * Semester-specific repository interface
 */
export interface ISemesterRepository {
  /**
   * Find semester by name (case insensitive)
   */
  findByName(name: string): Promise<Semester | null>;

  /**
   * Check if semester name is taken (case insensitive), optionally excluding an ID
   */
  isNameTaken(name: string, excludeId?: number): Promise<boolean>;

  /**
   * Get semesters with question counts, paginated
   */
  findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<SemesterWithDetails>>;

  /**
   * Get all semesters with question counts (for dropdowns, etc.)
   */
  findAllWithQuestionCounts(): Promise<SemesterWithDetails[]>;

  /**
   * Get question count for a semester
   */
  getQuestionCount(semesterId: number): Promise<number>;

  /**
   * Migrate questions from one semester to another
   */
  migrateQuestions(
    fromSemesterId: number,
    toSemesterId: number
  ): Promise<number>;
}

/**
 * Semester repository implementation
 */
export class SemesterRepository
  extends BaseRepository<Semester, NewSemester, Partial<NewSemester>, number>
  implements ISemesterRepository
{
  protected table = semesters;
  protected idColumn = semesters.id;

  private mapSemester(row: Record<string, unknown>): Semester {
    return { id: Number(row.id), name: String(row.name) };
  }

  async create(input: NewSemester): Promise<Semester> {
    // RAW SQL TEMPLATE:
    // INSERT INTO semester (name) VALUES (?);
    // SELECT id, name FROM semester WHERE id = LAST_INSERT_ID();
    const [insertResult] = await db.execute(
      sql`INSERT INTO semester (name) VALUES (${input.name})`
    );
    const insertId = (insertResult as { insertId: number }).insertId;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM semester WHERE id = ${insertId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return this.mapSemester(data[0]);
  }

  async update(
    id: number,
    input: Partial<NewSemester>
  ): Promise<Semester | null> {
    // RAW SQL TEMPLATE:
    // UPDATE semester SET name = ? WHERE id = ?;
    if (input.name === undefined) return this.findById(id);
    await db.execute(
      sql`UPDATE semester SET name = ${input.name} WHERE id = ${id}`
    );
    return this.findById(id);
  }

  async findByName(name: string): Promise<Semester | null> {
    // RAW SQL TEMPLATE:
    // SELECT id, name FROM semester WHERE LOWER(name)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM semester WHERE LOWER(name) = LOWER(${name}) LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return data[0] ? this.mapSemester(data[0]) : null;
  }

  async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM semester WHERE LOWER(name)=LOWER(?) [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM semester WHERE LOWER(name) = LOWER(${name})`;
    if (excludeId !== undefined) {
      query = sql`${query} AND id != ${excludeId}`;
    }
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    const arr = rows as unknown as Array<unknown>;
    return arr.length > 0;
  }

  async findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<SemesterWithDetails>> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE (paged semesters with counts):
    // SELECT s.id,s.name, COUNT(q.id) AS questionCount
    // FROM semester s
    // LEFT JOIN question q ON s.id = q.semesterId
    // [WHERE LOWER(s.name) LIKE LOWER(?)]
    // GROUP BY s.id,s.name
    // ORDER BY s.name ASC
    // LIMIT ? OFFSET ?;
    const searchFilter = search ? `%${search}%` : null;
    let whereClause = sql``;
    if (searchFilter) {
      whereClause = sql`WHERE LOWER(s.name) LIKE LOWER(${searchFilter})`;
    }
    const [rows] = await db.execute(sql`
      SELECT s.id, s.name, COUNT(q.id) AS questionCount
      FROM semester s
      LEFT JOIN question q ON s.id = q.semesterId
      ${whereClause}
      GROUP BY s.id, s.name
      ORDER BY s.name ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `);
    const data = (rows as unknown as Array<Record<string, unknown>>).map(
      (r) => ({
        id: Number(r.id),
        name: String(r.name),
        questionCount:
          typeof r.questionCount === "number"
            ? (r.questionCount as number)
            : parseInt(String(r.questionCount ?? 0), 10),
      })
    );

    // RAW SQL TEMPLATE (total semesters count):
    // SELECT COUNT(*) AS total FROM semester s [WHERE LOWER(s.name) LIKE LOWER(?)];
    const [countRows] = await db.execute(sql`
      SELECT COUNT(*) AS total FROM semester s
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
      data: data as SemesterWithDetails[],
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

  async findAllWithQuestionCounts(): Promise<SemesterWithDetails[]> {
    // RAW SQL TEMPLATE:
    // SELECT s.id,s.name, COUNT(q.id) AS questionCount
    // FROM semester s LEFT JOIN question q ON s.id = q.semesterId
    // GROUP BY s.id,s.name ORDER BY s.name ASC;
    const [rows] = await db.execute(sql`
      SELECT s.id, s.name, COUNT(q.id) AS questionCount
      FROM semester s
      LEFT JOIN question q ON s.id = q.semesterId
      GROUP BY s.id, s.name
      ORDER BY s.name ASC
    `);
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    })) as SemesterWithDetails[];
  }

  async getQuestionCount(semesterId: number): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) AS count FROM question WHERE semesterId=?;
    const [rows] = await db.execute(
      sql`SELECT COUNT(*) AS count FROM question WHERE semesterId = ${semesterId}`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return parseInt(String(data[0]?.count ?? 0), 10);
  }

  async migrateQuestions(
    fromSemesterId: number,
    toSemesterId: number
  ): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) FROM question WHERE semesterId=?; (store n)
    // UPDATE question SET semesterId=? WHERE semesterId=?; (return n)
    const n = await this.getQuestionCount(fromSemesterId);
    if (n === 0) return 0;
    await db.execute(
      sql`UPDATE question SET semesterId = ${toSemesterId} WHERE semesterId = ${fromSemesterId}`
    );
    return n;
  }
}

// Export a singleton instance
export const semesterRepository = new SemesterRepository();
