import { eq, asc, sql, count, and } from "drizzle-orm";
import { users, questions, type User, type NewUser } from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

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
    findManyWithQuestionCounts(options: PaginatedFindOptions & { search?: string }): Promise<
        PaginatedResult<UserWithDetails>
    >;

    /**
     * Get all users with question counts (for dropdowns, etc.)
     */
    findAllWithQuestionCounts(): Promise<UserSummary[]>;

    /**
     * Get question count for a user
     */
    getQuestionCount(userId: string): Promise<number>;

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
    implements IUserRepository {
    protected table = users;
    protected idColumn = users.id;

    async create(input: NewUser): Promise<User> {
        // If no ID is provided, generate one
        const userInput = {
            ...input,
            id: input.id || this.generateUserId(),
        };

        await db.insert(users).values(userInput);

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userInput.id))
            .limit(1);

        return user;
    }

    async update(id: string, input: Partial<NewUser>): Promise<User | null> {
        await db.update(users).set(input).where(eq(users.id, id));

        return this.findById(id);
    }

    generateUserId(): string {
        return crypto.randomUUID();
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(sql`LOWER(${users.email}) = LOWER(${email})`)
            .limit(1);

        return (result[0] as User) || null;
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(sql`LOWER(${users.username}) = LOWER(${username})`)
            .limit(1);

        return (result[0] as User) || null;
    }

    async findByStudentId(studentId: string): Promise<User | null> {
        const result = await db
            .select()
            .from(users)
            .where(sql`LOWER(${users.studentId}) = LOWER(${studentId})`)
            .limit(1);

        return (result[0] as User) || null;
    }

    async isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
        let whereCondition = sql`LOWER(${users.email}) = LOWER(${email})`;

        if (excludeId !== undefined) {
            whereCondition = and(
                sql`LOWER(${users.email}) = LOWER(${email})`,
                sql`${users.id} != ${excludeId}`
            ) as typeof whereCondition;
        }

        const result = await db
            .select()
            .from(users)
            .where(whereCondition)
            .limit(1);

        return result.length > 0;
    }

    async isUsernameTaken(username: string, excludeId?: string): Promise<boolean> {
        let whereCondition = sql`LOWER(${users.username}) = LOWER(${username})`;

        if (excludeId !== undefined) {
            whereCondition = and(
                sql`LOWER(${users.username}) = LOWER(${username})`,
                sql`${users.id} != ${excludeId}`
            ) as typeof whereCondition;
        }

        const result = await db
            .select()
            .from(users)
            .where(whereCondition)
            .limit(1);

        return result.length > 0;
    }

    async isStudentIdTaken(studentId: string, excludeId?: string): Promise<boolean> {
        let whereCondition = sql`LOWER(${users.studentId}) = LOWER(${studentId})`;

        if (excludeId !== undefined) {
            whereCondition = and(
                sql`LOWER(${users.studentId}) = LOWER(${studentId})`,
                sql`${users.id} != ${excludeId}`
            ) as typeof whereCondition;
        }

        const result = await db
            .select()
            .from(users)
            .where(whereCondition)
            .limit(1);

        return result.length > 0;
    }

    async findManyWithQuestionCounts(
        options: PaginatedFindOptions & { search?: string }
    ): Promise<PaginatedResult<UserWithDetails>> {
        const { page, pageSize, search, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build where conditions for search
        const searchCondition = search
            ? sql`(
          LOWER(${users.name}) LIKE LOWER(${`%${search}%`}) OR 
          LOWER(${users.email}) LIKE LOWER(${`%${search}%`}) OR 
          LOWER(${users.username}) LIKE LOWER(${`%${search}%`}) OR 
          LOWER(${users.studentId}) LIKE LOWER(${`%${search}%`})
        )`
            : undefined;

        // Execute queries in parallel
        const [usersResult, totalCountResult] = await Promise.all([
            db
                .select({
                    id: users.id,
                    name: users.name,
                    email: users.email,
                    emailVerified: users.emailVerified,
                    image: users.image,
                    username: users.username,
                    studentId: users.studentId,
                    questionCount: count(questions.id),
                })
                .from(users)
                .leftJoin(questions, eq(users.id, questions.userId))
                .where(searchCondition)
                .groupBy(
                    users.id,
                    users.name,
                    users.email,
                    users.emailVerified,
                    users.image,
                    users.username,
                    users.studentId
                )
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : asc(users.name))
                .limit(pageSize)
                .offset(offset),

            this.count(searchCondition),
        ]);

        const totalCount = totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: usersResult as UserWithDetails[],
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
        return db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                questionCount: count(questions.id),
            })
            .from(users)
            .leftJoin(questions, eq(users.id, questions.userId))
            .groupBy(users.id, users.name, users.email)
            .orderBy(asc(users.name)) as Promise<UserSummary[]>;
    }

    async getQuestionCount(userId: string): Promise<number> {
        const result = await db
            .select({ count: count() })
            .from(questions)
            .where(eq(questions.userId, userId));

        return result[0].count;
    }
}

// Export a singleton instance
export const userRepository = new UserRepository();
