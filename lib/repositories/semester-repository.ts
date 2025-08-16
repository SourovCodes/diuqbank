import { eq, asc, sql, count } from "drizzle-orm";
import { semesters, questions, type Semester, type NewSemester } from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

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
  findManyWithQuestionCounts(options: PaginatedFindOptions & { search?: string }): Promise<
    PaginatedResult<SemesterWithDetails>
  >;

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
  migrateQuestions(fromSemesterId: number, toSemesterId: number): Promise<number>;
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

  async create(input: NewSemester): Promise<Semester> {
    const [insertResult] = await db.insert(semesters).values(input);

    const [semester] = await db
      .select()
      .from(semesters)
      .where(eq(semesters.id, insertResult.insertId))
      .limit(1);

    return semester;
  }

  async update(id: number, input: Partial<NewSemester>): Promise<Semester | null> {
    await db.update(semesters).set(input).where(eq(semesters.id, id));

    return this.findById(id);
  }

  async findByName(name: string): Promise<Semester | null> {
    const result = await db
      .select()
      .from(semesters)
      .where(sql`LOWER(${semesters.name}) = LOWER(${name})`)
      .limit(1);

    return (result[0] as Semester) || null;
  }

  async isNameTaken(name: string, excludeId?: number): Promise<boolean> {
    let whereCondition = sql`LOWER(${semesters.name}) = LOWER(${name})`;

    if (excludeId !== undefined) {
      whereCondition = sql`LOWER(${semesters.name}) = LOWER(${name}) AND ${semesters.id} != ${excludeId}`;
    }

    const result = await db
      .select()
      .from(semesters)
      .where(whereCondition)
      .limit(1);

    return result.length > 0;
  }

  async findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<SemesterWithDetails>> {
    const { page, pageSize, search, orderBy } = options;
    const offset = (page - 1) * pageSize;

    // Build where conditions for search
    const baseCondition = sql`1=1`;
    const searchCondition = search
      ? sql`LOWER(${semesters.name}) LIKE LOWER(${`%${search}%`})`
      : baseCondition;

    // Execute queries in parallel
    const [semestersResult, totalCountResult] = await Promise.all([
      db
        .select({
          id: semesters.id,
          name: semesters.name,
          questionCount: count(questions.id),
        })
        .from(semesters)
        .leftJoin(questions, eq(semesters.id, questions.semesterId))
        .where(searchCondition)
        .groupBy(semesters.id, semesters.name)
        .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : asc(semesters.name))
        .limit(pageSize)
        .offset(offset),

      this.count(searchCondition),
    ]);

    const totalCount = totalCountResult;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: semestersResult as SemesterWithDetails[],
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
    return db
      .select({
        id: semesters.id,
        name: semesters.name,
        questionCount: count(questions.id),
      })
      .from(semesters)
      .leftJoin(questions, eq(semesters.id, questions.semesterId))
      .groupBy(semesters.id, semesters.name)
      .orderBy(asc(semesters.name)) as Promise<SemesterWithDetails[]>;
  }

  async getQuestionCount(semesterId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(questions)
      .where(eq(questions.semesterId, semesterId));

    return result[0].count;
  }

  async migrateQuestions(fromSemesterId: number, toSemesterId: number): Promise<number> {
    // First get the count of questions to be migrated
    const questionCount = await this.getQuestionCount(fromSemesterId);

    if (questionCount === 0) {
      return 0;
    }

    // Migrate the questions
    await db
      .update(questions)
      .set({ semesterId: toSemesterId })
      .where(eq(questions.semesterId, fromSemesterId));

    return questionCount;
  }
}

// Export a singleton instance
export const semesterRepository = new SemesterRepository();
