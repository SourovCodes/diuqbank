import { sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import {
  questions,
  type Question,
  type NewQuestion,
  QuestionStatus,
} from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

// (Removed MySqlUpdateResult interface; using generic affectedRows extraction from db.execute results)

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
  findManyWithDetails(
    options: QuestionSearchOptions
  ): Promise<PaginatedResult<QuestionWithDetails>>;

  /**
   * Get published questions for public view
   */
  findPublishedQuestions(
    options: Omit<QuestionSearchOptions, "status" | "userId">
  ): Promise<PaginatedResult<PublicQuestion>>;

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
  updateStatus(
    id: number,
    status: keyof typeof QuestionStatus
  ): Promise<boolean>;

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
  implements IQuestionRepository
{
  protected table = questions;
  protected idColumn = questions.id;

  private mapQuestionDetails(r: Record<string, unknown>): QuestionWithDetails {
    return {
      id: Number(r.id),
      userId: String(r.userId),
      departmentId: Number(r.departmentId),
      courseId: Number(r.courseId),
      semesterId: Number(r.semesterId),
      examTypeId: Number(r.examTypeId),
      status: r.status as Question["status"],
      pdfKey: String(r.pdfKey),
      pdfFileSizeInBytes: Number(r.pdfFileSizeInBytes),
      viewCount: Number(r.viewCount),
      createdAt: new Date(r.createdAt as string),
      updatedAt: new Date(r.updatedAt as string),
      departmentName: r.departmentName ? String(r.departmentName) : null,
      departmentShortName: r.departmentShortName
        ? String(r.departmentShortName)
        : null,
      courseName: r.courseName ? String(r.courseName) : null,
      semesterName: r.semesterName ? String(r.semesterName) : null,
      examTypeName: r.examTypeName ? String(r.examTypeName) : null,
      userName: r.userName ? String(r.userName) : null,
    };
  }

  private mapPublicQuestion(r: Record<string, unknown>): PublicQuestion {
    return {
      id: Number(r.id),
      pdfKey: String(r.pdfKey),
      pdfFileSizeInBytes: Number(r.pdfFileSizeInBytes),
      viewCount: Number(r.viewCount),
      createdAt: new Date(r.createdAt as string),
      departmentName: r.departmentName ? String(r.departmentName) : null,
      departmentShortName: r.departmentShortName
        ? String(r.departmentShortName)
        : null,
      courseName: r.courseName ? String(r.courseName) : null,
      semesterName: r.semesterName ? String(r.semesterName) : null,
      examTypeName: r.examTypeName ? String(r.examTypeName) : null,
      userName: r.userName ? String(r.userName) : null,
      userId: r.userId ? String(r.userId) : null,
      userUsername: r.userUsername ? String(r.userUsername) : null,
    };
  }

  async create(input: NewQuestion): Promise<Question> {
    // RAW SQL TEMPLATE:
    // INSERT INTO question (userId,departmentId,courseId,semesterId,examTypeId,status,pdfKey,pdfFileSizeInBytes,viewCount) VALUES (?,?,?,?,?,?,?,?,?);
    // SELECT * FROM question WHERE id = LAST_INSERT_ID();
    const [insertResult] = await db.execute(sql`
            INSERT INTO question (userId, departmentId, courseId, semesterId, examTypeId, status, pdfKey, pdfFileSizeInBytes, viewCount)
            VALUES (${input.userId}, ${input.departmentId}, ${
      input.courseId
    }, ${input.semesterId}, ${input.examTypeId}, ${input.status}, ${
      input.pdfKey
    }, ${input.pdfFileSizeInBytes}, ${input.viewCount ?? 0})
        `);
    const insertId = (insertResult as { insertId: number }).insertId;
    const [rows] = await db.execute(
      sql`SELECT * FROM question WHERE id = ${insertId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    const r = data[0];
    return {
      id: Number(r.id),
      userId: String(r.userId),
      departmentId: Number(r.departmentId),
      courseId: Number(r.courseId),
      semesterId: Number(r.semesterId),
      examTypeId: Number(r.examTypeId),
      status: r.status as Question["status"],
      pdfKey: String(r.pdfKey),
      pdfFileSizeInBytes: Number(r.pdfFileSizeInBytes),
      viewCount: Number(r.viewCount),
      createdAt: new Date(r.createdAt as string),
      updatedAt: new Date(r.updatedAt as string),
    };
  }

  async update(
    id: number,
    input: Partial<NewQuestion>
  ): Promise<Question | null> {
    // RAW SQL TEMPLATE:
    // UPDATE question SET <dynamic columns> WHERE id=?;
    const setClauses: SQL[] = [];
    if (input.userId !== undefined)
      setClauses.push(sql`userId = ${input.userId}`);
    if (input.departmentId !== undefined)
      setClauses.push(sql`departmentId = ${input.departmentId}`);
    if (input.courseId !== undefined)
      setClauses.push(sql`courseId = ${input.courseId}`);
    if (input.semesterId !== undefined)
      setClauses.push(sql`semesterId = ${input.semesterId}`);
    if (input.examTypeId !== undefined)
      setClauses.push(sql`examTypeId = ${input.examTypeId}`);
    if (input.status !== undefined)
      setClauses.push(sql`status = ${input.status}`);
    if (input.pdfKey !== undefined)
      setClauses.push(sql`pdfKey = ${input.pdfKey}`);
    if (input.pdfFileSizeInBytes !== undefined)
      setClauses.push(sql`pdfFileSizeInBytes = ${input.pdfFileSizeInBytes}`);
    if (input.viewCount !== undefined)
      setClauses.push(sql`viewCount = ${input.viewCount}`);
    if (setClauses.length > 0) {
      await db.execute(
        sql`UPDATE question SET ${sql.join(
          setClauses,
          sql`, `
        )} WHERE id = ${id}`
      );
    }
    return this.findById(id);
  }

  async isDuplicateQuestion(
    departmentId: number,
    courseId: number,
    semesterId: number,
    examTypeId: number,
    excludeId?: number
  ): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM question WHERE departmentId=? AND courseId=? AND semesterId=? AND examTypeId=? [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM question WHERE departmentId = ${departmentId} AND courseId = ${courseId} AND semesterId = ${semesterId} AND examTypeId = ${examTypeId}`;
    if (excludeId !== undefined) {
      query = sql`${query} AND id != ${excludeId}`;
    }
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    return (rows as unknown as Array<unknown>).length > 0;
  }

  async findManyWithDetails(
    options: QuestionSearchOptions
  ): Promise<PaginatedResult<QuestionWithDetails>> {
    const {
      page,
      pageSize,
      search,
      departmentId,
      courseId,
      semesterId,
      examTypeId,
      status,
      userId,
    } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE (detailed list with joins + filters):
    // SELECT q.*, d.name AS departmentName, d.shortName AS departmentShortName, c.name AS courseName, s.name AS semesterName, e.name AS examTypeName, u.name AS userName
    // FROM question q
    // LEFT JOIN department d ON q.departmentId=d.id
    // LEFT JOIN course c ON q.courseId=c.id
    // LEFT JOIN semester s ON q.semesterId=s.id
    // LEFT JOIN examType e ON q.examTypeId=e.id
    // LEFT JOIN user u ON q.userId=u.id
    // WHERE 1=1 [AND ...dynamic filters...] [AND (LOWER(d.name) LIKE LOWER(?) OR ...)]
    // ORDER BY q.createdAt DESC
    // LIMIT ? OFFSET ?;
    const conditions: SQL[] = [sql`1=1`];
    if (departmentId) conditions.push(sql`q.departmentId = ${departmentId}`);
    if (courseId) conditions.push(sql`q.courseId = ${courseId}`);
    if (semesterId) conditions.push(sql`q.semesterId = ${semesterId}`);
    if (examTypeId) conditions.push(sql`q.examTypeId = ${examTypeId}`);
    if (status) conditions.push(sql`q.status = ${QuestionStatus[status]}`);
    if (userId) conditions.push(sql`q.userId = ${userId}`);
    if (search) {
      const like = `%${search}%`;
      conditions.push(
        sql`(LOWER(d.name) LIKE LOWER(${like}) OR LOWER(c.name) LIKE LOWER(${like}) OR LOWER(s.name) LIKE LOWER(${like}) OR LOWER(e.name) LIKE LOWER(${like}))`
      );
    }
    const whereClause = sql`${sql.join(conditions, sql` AND `)}`;
    const [rows] = await db.execute(sql`
            SELECT q.id, q.userId, q.departmentId, q.courseId, q.semesterId, q.examTypeId, q.status, q.pdfKey, q.pdfFileSizeInBytes, q.viewCount, q.createdAt, q.updatedAt,
                         d.name AS departmentName, d.shortName AS departmentShortName, c.name AS courseName, s.name AS semesterName, e.name AS examTypeName, u.name AS userName
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN semester s ON q.semesterId = s.id
            LEFT JOIN examType e ON q.examTypeId = e.id
            LEFT JOIN user u ON q.userId = u.id
            WHERE ${whereClause}
            ORDER BY q.createdAt DESC
            LIMIT ${pageSize} OFFSET ${offset}
        `);
    const data = (rows as unknown as Array<Record<string, unknown>>).map((r) =>
      this.mapQuestionDetails(r)
    );
    const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN semester s ON q.semesterId = s.id
            LEFT JOIN examType e ON q.examTypeId = e.id
            LEFT JOIN user u ON q.userId = u.id
            WHERE ${whereClause}
        `);
    const totalCount = parseInt(
      String(
        (countRows as unknown as Array<Record<string, unknown>>)[0]?.total ?? 0
      ),
      10
    );
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
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

  async findPublishedQuestions(
    options: Omit<QuestionSearchOptions, "status" | "userId">
  ): Promise<PaginatedResult<PublicQuestion>> {
    const { page, pageSize, departmentId, courseId, semesterId, examTypeId } =
      options;
    const offset = (page - 1) * pageSize;
    const conditions: SQL[] = [sql`q.status = ${QuestionStatus.PUBLISHED}`];
    if (departmentId) conditions.push(sql`q.departmentId = ${departmentId}`);
    if (courseId) conditions.push(sql`q.courseId = ${courseId}`);
    if (semesterId) conditions.push(sql`q.semesterId = ${semesterId}`);
    if (examTypeId) conditions.push(sql`q.examTypeId = ${examTypeId}`);
    const whereClause = sql`${sql.join(conditions, sql` AND `)}`;
    // RAW SQL TEMPLATE (published questions): see above pattern.
    const [rows] = await db.execute(sql`
            SELECT q.id, q.pdfKey, q.pdfFileSizeInBytes, q.viewCount, q.createdAt,
                         d.name AS departmentName, d.shortName AS departmentShortName, c.name AS courseName, s.name AS semesterName, e.name AS examTypeName,
                         u.name AS userName, u.id AS userId, u.username AS userUsername
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN semester s ON q.semesterId = s.id
            LEFT JOIN examType e ON q.examTypeId = e.id
            LEFT JOIN user u ON q.userId = u.id
            WHERE ${whereClause}
            ORDER BY q.createdAt DESC
            LIMIT ${pageSize} OFFSET ${offset}
        `);
    const data = (rows as unknown as Array<Record<string, unknown>>).map((r) =>
      this.mapPublicQuestion(r)
    );
    const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total
            FROM question q
            WHERE ${whereClause}
        `);
    const totalCount = parseInt(
      String(
        (countRows as unknown as Array<Record<string, unknown>>)[0]?.total ?? 0
      ),
      10
    );
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
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

  async findByIdWithDetails(id: number): Promise<QuestionWithDetails | null> {
    // RAW SQL TEMPLATE:
    // SELECT ...joins... WHERE q.id=? LIMIT 1;
    const [rows] = await db.execute(sql`
            SELECT q.id, q.userId, q.departmentId, q.courseId, q.semesterId, q.examTypeId, q.status, q.pdfKey, q.pdfFileSizeInBytes, q.viewCount, q.createdAt, q.updatedAt,
                         d.name AS departmentName, d.shortName AS departmentShortName, c.name AS courseName, s.name AS semesterName, e.name AS examTypeName, u.name AS userName
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN semester s ON q.semesterId = s.id
            LEFT JOIN examType e ON q.examTypeId = e.id
            LEFT JOIN user u ON q.userId = u.id
            WHERE q.id = ${id}
            LIMIT 1
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return this.mapQuestionDetails(data[0]);
  }

  async findPublishedById(id: number): Promise<PublicQuestion | null> {
    // RAW SQL TEMPLATE:
    // SELECT ...published... WHERE q.id=? AND q.status='published' LIMIT 1;
    const [rows] = await db.execute(sql`
            SELECT q.id, q.pdfKey, q.pdfFileSizeInBytes, q.viewCount, q.createdAt,
                         d.name AS departmentName, d.shortName AS departmentShortName, c.name AS courseName, s.name AS semesterName, e.name AS examTypeName,
                         u.name AS userName, u.id AS userId, u.username AS userUsername
            FROM question q
            LEFT JOIN department d ON q.departmentId = d.id
            LEFT JOIN course c ON q.courseId = c.id
            LEFT JOIN semester s ON q.semesterId = s.id
            LEFT JOIN examType e ON q.examTypeId = e.id
            LEFT JOIN user u ON q.userId = u.id
            WHERE q.id = ${id} AND q.status = ${QuestionStatus.PUBLISHED}
            LIMIT 1
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return this.mapPublicQuestion(data[0]);
  }

  async updateStatus(
    id: number,
    status: keyof typeof QuestionStatus
  ): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // UPDATE question SET status=? WHERE id=?;
    const [res] = await db.execute(
      sql`UPDATE question SET status = ${QuestionStatus[status]} WHERE id = ${id}`
    );
    return (
      ((res as unknown as { affectedRows?: number }).affectedRows ?? 0) > 0
    );
  }

  async incrementViewCount(id: number): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // UPDATE question SET viewCount = viewCount + 1 WHERE id=?;
    const [res] = await db.execute(
      sql`UPDATE question SET viewCount = viewCount + 1 WHERE id = ${id}`
    );
    return (
      ((res as unknown as { affectedRows?: number }).affectedRows ?? 0) > 0
    );
  }

  async getDepartmentOptions(): Promise<DropdownOption[]> {
    // RAW SQL TEMPLATE:
    // SELECT id, shortName AS name FROM department ORDER BY shortName ASC;
    const [rows] = await db.execute(
      sql`SELECT id, shortName AS name FROM department ORDER BY shortName ASC`
    );
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
    }));
  }

  async getCourseOptions(departmentId: number): Promise<DropdownOption[]> {
    // RAW SQL TEMPLATE:
    // SELECT id,name FROM course WHERE departmentId=? ORDER BY name ASC;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM course WHERE departmentId = ${departmentId} ORDER BY name ASC`
    );
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
    }));
  }

  async getSemesterOptions(): Promise<DropdownOption[]> {
    // RAW SQL TEMPLATE:
    // SELECT id,name FROM semester ORDER BY name ASC;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM semester ORDER BY name ASC`
    );
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
    }));
  }

  async getExamTypeOptions(): Promise<DropdownOption[]> {
    // RAW SQL TEMPLATE:
    // SELECT id,name FROM examType ORDER BY name ASC;
    const [rows] = await db.execute(
      sql`SELECT id, name FROM examType ORDER BY name ASC`
    );
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
    }));
  }

  async getUserOptions(): Promise<UserDropdownOption[]> {
    // RAW SQL TEMPLATE:
    // SELECT id,name,email FROM user ORDER BY email ASC;
    const [rows] = await db.execute(
      sql`SELECT id, name, email FROM user ORDER BY email ASC`
    );
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
    }));
  }

  async getFilterOptions(): Promise<FilterOptions> {
    // RAW SQL TEMPLATE (batch fetch for dropdown filters):
    // See individual queries below.
    const [dRows, cRows, sRows, eRows] = await Promise.all([
      db.execute(
        sql`SELECT id, name, shortName FROM department ORDER BY name ASC`
      ),
      db.execute(
        sql`SELECT id, name, departmentId FROM course ORDER BY name ASC`
      ),
      db.execute(sql`SELECT id, name FROM semester ORDER BY name ASC`),
      db.execute(sql`SELECT id, name FROM examType ORDER BY name ASC`),
    ]);
    const departmentsResult = (
      dRows[0] as unknown as Array<Record<string, unknown>>
    ).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      shortName: String(r.shortName),
    }));
    const coursesResult = (
      cRows[0] as unknown as Array<Record<string, unknown>>
    ).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
      departmentId: Number(r.departmentId),
    }));
    const semestersResult = (
      sRows[0] as unknown as Array<Record<string, unknown>>
    ).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
    }));
    const examTypesResult = (
      eRows[0] as unknown as Array<Record<string, unknown>>
    ).map((r) => ({
      id: Number(r.id),
      name: String(r.name),
    }));
    return {
      departments: departmentsResult,
      courses: coursesResult,
      semesters: semestersResult,
      examTypes: examTypesResult,
    };
  }

  async isQuestionOwnedByUser(
    questionId: number,
    userId: string
  ): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT userId FROM question WHERE id=? LIMIT 1;
    const [rows] = await db.execute(
      sql`SELECT userId FROM question WHERE id = ${questionId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return false;
    return String(data[0].userId) === userId;
  }

  async deleteWithPdfKey(
    id: number
  ): Promise<{ success: boolean; pdfKey?: string }> {
    // RAW SQL TEMPLATE:
    // SELECT pdfKey FROM question WHERE id=?; DELETE FROM question WHERE id=?;
    const [rows] = await db.execute(
      sql`SELECT pdfKey FROM question WHERE id = ${id} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return { success: false };
    const pdfKey = data[0].pdfKey ? String(data[0].pdfKey) : undefined;
    const [del] = await db.execute(sql`DELETE FROM question WHERE id = ${id}`);
    const success =
      ((del as unknown as { affectedRows?: number }).affectedRows ?? 0) > 0;
    return { success, pdfKey };
  }
}

// Export a singleton instance
export const questionRepository = new QuestionRepository();
