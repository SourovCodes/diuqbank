import { sql } from "drizzle-orm";
import { examTypes, type ExamType, type NewExamType } from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

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
  findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<ExamTypeWithDetails>>;

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
  migrateQuestions(
    fromExamTypeId: number,
    toExamTypeId: number
  ): Promise<number>;
}

/**
 * Exam type repository implementation
 */
export class ExamTypeRepository
  extends BaseRepository<ExamType, NewExamType, Partial<NewExamType>, number>
  implements IExamTypeRepository
{
  protected table = examTypes;
  protected idColumn = examTypes.id;

  async create(input: NewExamType): Promise<ExamType> {
    // RAW SQL TEMPLATE:
    // INSERT INTO examType (name) VALUES (?);
    // SELECT id, name FROM examType WHERE id = LAST_INSERT_ID();
    const [insertResult] = await db.execute(
      sql`INSERT INTO examType (name) VALUES (${input.name})`
    );
    const insertId = (insertResult as { insertId: number }).insertId;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM examType WHERE id = ${insertId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return { id: Number(data[0].id), name: String(data[0].name) };
  }

  async update(
    id: number,
    input: Partial<NewExamType>
  ): Promise<ExamType | null> {
    // RAW SQL TEMPLATE:
    // UPDATE examType SET name = ? WHERE id = ?;
    if (input.name === undefined) return this.findById(id);
    await db.execute(
      sql`UPDATE examType SET name = ${input.name} WHERE id = ${id}`
    );
    return this.findById(id);
  }

  async findByName(name: string): Promise<ExamType | null> {
    // RAW SQL TEMPLATE:
    // SELECT id, name FROM examType WHERE LOWER(name)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM examType WHERE LOWER(name) = LOWER(${name}) LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return { id: Number(data[0].id), name: String(data[0].name) };
  }

  async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM examType WHERE LOWER(name)=LOWER(?) [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM examType WHERE LOWER(name) = LOWER(${name})`;
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
  ): Promise<PaginatedResult<ExamTypeWithDetails>> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE (paged list with counts):
    // SELECT e.id,e.name, COUNT(q.id) AS questionCount
    // FROM examType e
    // LEFT JOIN question q ON e.id = q.examTypeId
    // [WHERE LOWER(e.name) LIKE LOWER(?)]
    // GROUP BY e.id,e.name
    // ORDER BY e.name ASC
    // LIMIT ? OFFSET ?;
    const searchFilter = search ? `%${search}%` : null;
    let whereClause = sql``;
    if (searchFilter) {
      whereClause = sql`WHERE LOWER(e.name) LIKE LOWER(${searchFilter})`;
    }
    const [rows] = await db.execute(sql`
            SELECT e.id, e.name, COUNT(q.id) AS questionCount
            FROM examType e
            LEFT JOIN question q ON e.id = q.examTypeId
            ${whereClause}
            GROUP BY e.id, e.name
            ORDER BY e.name ASC
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

    // RAW SQL TEMPLATE (total count):
    // SELECT COUNT(*) AS total FROM examType e [WHERE LOWER(e.name) LIKE LOWER(?)];
    const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total FROM examType e
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
      data: data as ExamTypeWithDetails[],
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
    // RAW SQL TEMPLATE:
    // SELECT e.id,e.name, COUNT(q.id) AS questionCount
    // FROM examType e LEFT JOIN question q ON e.id = q.examTypeId
    // GROUP BY e.id,e.name ORDER BY e.name ASC;
    const [rows] = await db.execute(sql`
            SELECT e.id, e.name, COUNT(q.id) AS questionCount
            FROM examType e
            LEFT JOIN question q ON e.id = q.examTypeId
            GROUP BY e.id, e.name
            ORDER BY e.name ASC
        `);
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    })) as ExamTypeWithDetails[];
  }

  async getQuestionCount(examTypeId: number): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) AS count FROM question WHERE examTypeId=?;
    const [rows] = await db.execute(
      sql`SELECT COUNT(*) AS count FROM question WHERE examTypeId = ${examTypeId}`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    return parseInt(String(data[0]?.count ?? 0), 10);
  }

  async migrateQuestions(
    fromExamTypeId: number,
    toExamTypeId: number
  ): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) FROM question WHERE examTypeId=?; (store as n)
    // UPDATE question SET examTypeId=? WHERE examTypeId=?; (return n)
    const count = await this.getQuestionCount(fromExamTypeId);
    if (count === 0) return 0;
    await db.execute(
      sql`UPDATE question SET examTypeId = ${toExamTypeId} WHERE examTypeId = ${fromExamTypeId}`
    );
    return count;
  }
}

// Export a singleton instance
export const examTypeRepository = new ExamTypeRepository();
