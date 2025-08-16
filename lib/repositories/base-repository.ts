import { MySqlTable } from "drizzle-orm/mysql-core";
import { db } from "@/db/drizzle";
import { eq, and, count, SQL, sql, AnyColumn } from "drizzle-orm";

/**
 * Interface for MySQL delete result
 */
interface MySqlDeleteResult {
    rowsAffected: number;
}

/**
 * Base repository interface defining common CRUD operations
 */
export interface IBaseRepository<TModel, TCreateInput, TUpdateInput, TId = number> {
    /**
     * Find a record by ID
     */
    findById(id: TId): Promise<TModel | null>;

    /**
     * Find multiple records with optional filtering
     */
    findMany(options?: FindManyOptions): Promise<TModel[]>;

    /**
     * Find records with pagination
     */
    findManyPaginated(options: PaginatedFindOptions): Promise<PaginatedResult<TModel>>;

    /**
     * Create a new record
     */
    create(input: TCreateInput): Promise<TModel>;

    /**
     * Update an existing record
     */
    update(id: TId, input: TUpdateInput): Promise<TModel | null>;

    /**
     * Delete a record by ID
     */
    delete(id: TId): Promise<boolean>;

    /**
     * Check if a record exists by ID
     */
    exists(id: TId): Promise<boolean>;

    /**
     * Count records with optional filtering
     */
    count(where?: SQL): Promise<number>;
}

/**
 * Options for finding multiple records
 */
export interface FindManyOptions {
    where?: SQL;
    limit?: number;
    offset?: number;
    orderBy?: SQL | SQL[];
}

/**
 * Options for paginated queries
 */
export interface PaginatedFindOptions extends Omit<FindManyOptions, 'limit' | 'offset'> {
    page: number;
    pageSize: number;
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

/**
 * Abstract base repository class providing common implementations
 */
export abstract class BaseRepository<TModel, TCreateInput, TUpdateInput, TId = number>
    implements IBaseRepository<TModel, TCreateInput, TUpdateInput, TId> {
    protected abstract table: MySqlTable;
    protected abstract idColumn: AnyColumn;

    async findById(id: TId): Promise<TModel | null> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq(this.idColumn, id))
            .limit(1);

        return (result[0] as TModel) || null;
    }

    async findMany(options: FindManyOptions = {}): Promise<TModel[]> {
        let query = db.select().from(this.table);

        if (options.where) {
            query = query.where(options.where) as typeof query;
        }

        if (options.orderBy) {
            if (Array.isArray(options.orderBy)) {
                query = query.orderBy(...options.orderBy) as typeof query;
            } else {
                query = query.orderBy(options.orderBy) as typeof query;
            }
        }

        if (options.limit) {
            query = query.limit(options.limit) as typeof query;
        }

        if (options.offset) {
            query = query.offset(options.offset) as typeof query;
        }

        const result = await query;
        return result as TModel[];
    }

    async findManyPaginated(options: PaginatedFindOptions): Promise<PaginatedResult<TModel>> {
        const { page, pageSize, where, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Execute both queries in parallel
        const [data, totalCountResult] = await Promise.all([
            this.findMany({ where, orderBy, limit: pageSize, offset }),
            this.count(where),
        ]);

        const totalCount = totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

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

    abstract create(input: TCreateInput): Promise<TModel>;

    abstract update(id: TId, input: TUpdateInput): Promise<TModel | null>;

    async delete(id: TId): Promise<boolean> {
        const result = await db.delete(this.table).where(eq(this.idColumn, id));
        return (result as unknown as MySqlDeleteResult).rowsAffected > 0;
    }

    async exists(id: TId): Promise<boolean> {
        const result = await db
            .select()
            .from(this.table)
            .where(eq(this.idColumn, id))
            .limit(1);

        return result.length > 0;
    }

    async count(where?: SQL): Promise<number> {
        let query = db.select({ count: count() }).from(this.table);

        if (where) {
            query = query.where(where) as typeof query;
        }

        const result = await query;
        return result[0].count;
    }

    /**
     * Helper method to check if a field value is unique (excluding a specific ID)
     */
    protected async isFieldUnique(
        field: AnyColumn,
        value: string,
        excludeId?: TId
    ): Promise<boolean> {
        let whereCondition = eq(field, value);

        if (excludeId !== undefined) {
            whereCondition = and(eq(field, value), sql`${this.idColumn} != ${excludeId}`) as typeof whereCondition;
        }

        const result = await db
            .select()
            .from(this.table)
            .where(whereCondition)
            .limit(1);

        return result.length === 0;
    }

    /**
     * Helper method to check if multiple fields are unique (case insensitive)
     */
    protected async areFieldsUniqueCaseInsensitive(
        fields: Array<{ column: AnyColumn; value: string }>,
        excludeId?: TId
    ): Promise<boolean> {
        const conditions = fields.map(({ column, value }) =>
            sql`LOWER(${column}) = LOWER(${value})`
        );

        let whereCondition = sql`(${sql.join(conditions, sql` OR `)})`;

        if (excludeId !== undefined) {
            whereCondition = and(whereCondition, sql`${this.idColumn} != ${excludeId}`) as typeof whereCondition;
        }

        const result = await db
            .select()
            .from(this.table)
            .where(whereCondition)
            .limit(1);

        return result.length === 0;
    }
}
