import { sql } from "drizzle-orm";
import { users, type User, type NewUser, QuestionStatus } from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

/**
 * Extended user type with question count information
 */
export type UserWithDetails = User & {
  questionCount: number;
};

/**
 * User summary type for dropdowns and lists
 */
export type UserSummary = {
  id: string;
  name: string;
  email: string;
  questionCount: number;
};

/**
 * User-specific repository interface
 */
export interface IUserRepository {
  /**
   * Find user by email (case insensitive)
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by username (case insensitive)
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find user by student ID (case insensitive)
   */
  findByStudentId(studentId: string): Promise<User | null>;

  /**
   * Check if email is taken (case insensitive), optionally excluding an ID
   */
  isEmailTaken(email: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if username is taken (case insensitive), optionally excluding an ID
   */
  isUsernameTaken(username: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if student ID is taken (case insensitive), optionally excluding an ID
   */
  isStudentIdTaken(studentId: string, excludeId?: string): Promise<boolean>;

  /**
   * Get users with question counts, paginated
   */
  findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<UserWithDetails>>;

  /**
   * Get all users with question counts (for dropdowns, etc.)
   */
  findAllWithQuestionCounts(): Promise<UserSummary[]>;

  /**
   * Get question count for a user
   */
  getQuestionCount(userId: string): Promise<number>;

  /**
   * Get user statistics (total questions, published, pending, views)
   */
  getUserStats(userId: string): Promise<{
    totalQuestions: number;
    publishedQuestions: number;
    pendingQuestions: number;
    totalViews: number;
  }>;

  /**
   * Generate a new UUID for user creation
   */
  generateUserId(): string;
}

/**
 * User repository implementation
 */
export class UserRepository
  extends BaseRepository<User, NewUser, Partial<NewUser>, string>
  implements IUserRepository
{
  protected table = users;
  protected idColumn = users.id;

  async create(input: NewUser): Promise<User> {
    // If no ID is provided, generate one
    const userInput = {
      ...input,
      id: input.id || this.generateUserId(),
    };
    // RAW SQL TEMPLATE:
    // INSERT INTO user (id,name,email,emailVerified,image,username,studentId) VALUES (?,?,?,?,?,?,?);
    // SELECT id,name,email,emailVerified,image,username,studentId FROM user WHERE id = ? LIMIT 1;
    await db.execute(sql`
            INSERT INTO user (id, name, email, emailVerified, image, username, studentId)
            VALUES (
                ${userInput.id},
                ${userInput.name},
                ${userInput.email},
                ${userInput.emailVerified ?? null},
                ${userInput.image ?? null},
                ${userInput.username},
                ${userInput.studentId ?? null}
            )
        `);
    const [rows] = await db.execute(sql`
            SELECT id, name, email, emailVerified, image, username, studentId
            FROM user WHERE id = ${userInput.id} LIMIT 1
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    return {
      id: String(data[0].id),
      name: String(data[0].name),
      email: String(data[0].email),
      emailVerified: data[0].emailVerified
        ? new Date(data[0].emailVerified as string | Date)
        : null,
      image: data[0].image === null ? null : String(data[0].image),
      username: String(data[0].username),
      studentId: data[0].studentId === null ? null : String(data[0].studentId),
    } as User;
  }

  async update(id: string, input: Partial<NewUser>): Promise<User | null> {
    // RAW SQL TEMPLATE:
    // UPDATE user SET
    //   name = COALESCE(?, name),
    //   email = COALESCE(?, email),
    //   emailVerified = COALESCE(?, emailVerified),
    //   image = COALESCE(?, image),
    //   username = COALESCE(?, username),
    //   studentId = COALESCE(?, studentId)
    // WHERE id = ?;
    await db.execute(sql`
            UPDATE user SET
                name = COALESCE(${input.name ?? null}, name),
                email = COALESCE(${input.email ?? null}, email),
                emailVerified = COALESCE(${
                  input.emailVerified ?? null
                }, emailVerified),
                image = COALESCE(${input.image ?? null}, image),
                username = COALESCE(${input.username ?? null}, username),
                studentId = COALESCE(${input.studentId ?? null}, studentId)
            WHERE id = ${id}
        `);
    return this.findById(id);
  }

  generateUserId(): string {
    return crypto.randomUUID();
  }

  async findByEmail(email: string): Promise<User | null> {
    // RAW SQL TEMPLATE:
    // SELECT * FROM user WHERE LOWER(email)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(sql`
            SELECT id, name, email, emailVerified, image, username, studentId
            FROM user WHERE LOWER(email) = LOWER(${email}) LIMIT 1
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return {
      id: String(data[0].id),
      name: String(data[0].name),
      email: String(data[0].email),
      emailVerified: data[0].emailVerified
        ? new Date(data[0].emailVerified as string | Date)
        : null,
      image: data[0].image === null ? null : String(data[0].image),
      username: String(data[0].username),
      studentId: data[0].studentId === null ? null : String(data[0].studentId),
    } as User;
  }

  async findByUsername(username: string): Promise<User | null> {
    // RAW SQL TEMPLATE:
    // SELECT * FROM user WHERE LOWER(username)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(sql`
            SELECT id, name, email, emailVerified, image, username, studentId
            FROM user WHERE LOWER(username) = LOWER(${username}) LIMIT 1
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return {
      id: String(data[0].id),
      name: String(data[0].name),
      email: String(data[0].email),
      emailVerified: data[0].emailVerified
        ? new Date(data[0].emailVerified as string | Date)
        : null,
      image: data[0].image === null ? null : String(data[0].image),
      username: String(data[0].username),
      studentId: data[0].studentId === null ? null : String(data[0].studentId),
    } as User;
  }

  async findByStudentId(studentId: string): Promise<User | null> {
    // RAW SQL TEMPLATE:
    // SELECT * FROM user WHERE LOWER(studentId)=LOWER(?) LIMIT 1;
    const [rows] = await db.execute(sql`
            SELECT id, name, email, emailVerified, image, username, studentId
            FROM user WHERE LOWER(studentId) = LOWER(${studentId}) LIMIT 1
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    if (!data[0]) return null;
    return {
      id: String(data[0].id),
      name: String(data[0].name),
      email: String(data[0].email),
      emailVerified: data[0].emailVerified
        ? new Date(data[0].emailVerified as string | Date)
        : null,
      image: data[0].image === null ? null : String(data[0].image),
      username: String(data[0].username),
      studentId: data[0].studentId === null ? null : String(data[0].studentId),
    } as User;
  }

  async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM user WHERE LOWER(email)=LOWER(?) [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM user WHERE LOWER(email) = LOWER(${email})`;
    if (excludeId !== undefined) query = sql`${query} AND id != ${excludeId}`;
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    return (rows as unknown as Array<unknown>).length > 0;
  }

  async isUsernameTaken(
    username: string,
    excludeId?: string
  ): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM user WHERE LOWER(username)=LOWER(?) [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM user WHERE LOWER(username) = LOWER(${username})`;
    if (excludeId !== undefined) query = sql`${query} AND id != ${excludeId}`;
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    return (rows as unknown as Array<unknown>).length > 0;
  }

  async isStudentIdTaken(
    studentId: string,
    excludeId?: string
  ): Promise<boolean> {
    // RAW SQL TEMPLATE:
    // SELECT 1 FROM user WHERE LOWER(studentId)=LOWER(?) [AND id!=?] LIMIT 1;
    let query = sql`SELECT 1 FROM user WHERE LOWER(studentId) = LOWER(${studentId})`;
    if (excludeId !== undefined) query = sql`${query} AND id != ${excludeId}`;
    query = sql`${query} LIMIT 1`;
    const [rows] = await db.execute(query);
    return (rows as unknown as Array<unknown>).length > 0;
  }

  async findManyWithQuestionCounts(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<UserWithDetails>> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE (paged users with question counts):
    // SELECT u.id,u.name,u.email,u.emailVerified,u.image,u.username,u.studentId, COUNT(q.id) AS questionCount
    // FROM user u LEFT JOIN question q ON u.id = q.userId
    // [WHERE (LOWER(u.name) LIKE ... OR ...)]
    // GROUP BY u.id,u.name,u.email,u.emailVerified,u.image,u.username,u.studentId
    // ORDER BY u.name ASC
    // LIMIT ? OFFSET ?;
    const searchFilter = search ? `%${search}%` : null;
    let whereClause = sql``;
    if (searchFilter) {
      whereClause = sql`WHERE (
                LOWER(u.name) LIKE LOWER(${searchFilter}) OR
                LOWER(u.email) LIKE LOWER(${searchFilter}) OR
                LOWER(u.username) LIKE LOWER(${searchFilter}) OR
                LOWER(u.studentId) LIKE LOWER(${searchFilter})
            )`;
    }
    const [rows] = await db.execute(sql`
            SELECT u.id, u.name, u.email, u.emailVerified, u.image, u.username, u.studentId, COUNT(q.id) AS questionCount
            FROM user u
            LEFT JOIN question q ON u.id = q.userId
            ${whereClause}
            GROUP BY u.id, u.name, u.email, u.emailVerified, u.image, u.username, u.studentId
            ORDER BY u.name ASC
            LIMIT ${pageSize} OFFSET ${offset}
        `);
    const data = (rows as unknown as Array<Record<string, unknown>>).map(
      (r) => ({
        id: String(r.id),
        name: String(r.name),
        email: String(r.email),
        emailVerified: r.emailVerified
          ? new Date(r.emailVerified as string | Date)
          : null,
        image: r.image === null ? null : String(r.image),
        username: String(r.username),
        studentId: r.studentId === null ? null : String(r.studentId),
        questionCount:
          typeof r.questionCount === "number"
            ? (r.questionCount as number)
            : parseInt(String(r.questionCount ?? 0), 10),
      })
    );

    // RAW SQL TEMPLATE (total user count with search):
    // SELECT COUNT(*) AS total FROM user u [WHERE ...];
    const [countRows] = await db.execute(sql`
            SELECT COUNT(*) AS total FROM user u
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
      data: data as UserWithDetails[],
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

  async findAllWithQuestionCounts(): Promise<UserSummary[]> {
    // RAW SQL TEMPLATE:
    // SELECT u.id,u.name,u.email, COUNT(q.id) AS questionCount
    // FROM user u LEFT JOIN question q ON u.id=q.userId
    // GROUP BY u.id,u.name,u.email ORDER BY u.name ASC;
    const [rows] = await db.execute(sql`
            SELECT u.id, u.name, u.email, COUNT(q.id) AS questionCount
            FROM user u
            LEFT JOIN question q ON u.id = q.userId
            GROUP BY u.id, u.name, u.email
            ORDER BY u.name ASC
        `);
    return (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      questionCount:
        typeof r.questionCount === "number"
          ? (r.questionCount as number)
          : parseInt(String(r.questionCount ?? 0), 10),
    }));
  }

  async getQuestionCount(userId: string): Promise<number> {
    // RAW SQL TEMPLATE:
    // SELECT COUNT(*) AS count FROM question WHERE userId=?;
    const [rows] = await db.execute(sql`
            SELECT COUNT(*) AS count FROM question WHERE userId = ${userId}
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    return parseInt(String(data[0]?.count ?? 0), 10);
  }

  async getUserStats(userId: string): Promise<{
    totalQuestions: number;
    publishedQuestions: number;
    pendingQuestions: number;
    totalViews: number;
  }> {
    // RAW SQL TEMPLATE (single aggregate):
    // SELECT
    //   COUNT(*) AS totalQuestions,
    //   SUM(status='published') AS publishedQuestions,
    //   SUM(status='pending review') AS pendingQuestions,
    //   COALESCE(SUM(CASE WHEN status='published' THEN viewCount ELSE 0 END),0) AS totalViews
    // FROM question WHERE userId=?;
    const [rows] = await db.execute(sql`
            SELECT
                COUNT(*) AS totalQuestions,
                SUM(status = ${QuestionStatus.PUBLISHED}) AS publishedQuestions,
                SUM(status = ${QuestionStatus.PENDING_REVIEW}) AS pendingQuestions,
                COALESCE(SUM(CASE WHEN status = ${QuestionStatus.PUBLISHED} THEN viewCount ELSE 0 END), 0) AS totalViews
            FROM question
            WHERE userId = ${userId}
        `);
    const data = rows as unknown as Array<Record<string, unknown>>;
    const row = data[0] || {};
    return {
      totalQuestions: parseInt(String(row.totalQuestions ?? 0), 10),
      publishedQuestions: parseInt(String(row.publishedQuestions ?? 0), 10),
      pendingQuestions: parseInt(String(row.pendingQuestions ?? 0), 10),
      totalViews: parseInt(String(row.totalViews ?? 0), 10),
    };
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();
