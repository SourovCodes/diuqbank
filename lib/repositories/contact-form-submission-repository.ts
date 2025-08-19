import { sql } from "drizzle-orm";
import {
  contactFormSubmissions,
  type ContactFormSubmission,
  type NewContactFormSubmission,
} from "@/db/schema";
import { db } from "@/db/drizzle";
import {
  BaseRepository,
  type PaginatedFindOptions,
  type PaginatedResult,
} from "./base-repository";

/**
 * Contact form submission-specific repository interface
 */
export interface IContactFormSubmissionRepository {
  /**
   * Get contact form submissions with pagination and search
   */
  findManyPaginated(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<ContactFormSubmission>>;

  /**
   * Submit a new contact form
   */
  submit(
    input: Omit<NewContactFormSubmission, "id" | "createdAt">
  ): Promise<ContactFormSubmission>;
}

/**
 * Contact form submission repository implementation
 */
export class ContactFormSubmissionRepository
  extends BaseRepository<
    ContactFormSubmission,
    NewContactFormSubmission,
    Partial<NewContactFormSubmission>
  >
  implements IContactFormSubmissionRepository
{
  protected table = contactFormSubmissions;
  protected idColumn = contactFormSubmissions.id;

  async create(
    input: NewContactFormSubmission
  ): Promise<ContactFormSubmission> {
    // RAW SQL TEMPLATE:
    // INSERT INTO contactFormSubmission (name,email,message) VALUES (?,?,?);
    // SELECT id,name,email,message,createdAt FROM contactFormSubmission WHERE id=LAST_INSERT_ID();
    const [insertResult] = await db.execute(
      sql`INSERT INTO contactFormSubmission (name, email, message) VALUES (${input.name}, ${input.email}, ${input.message})`
    );
    const insertId = (insertResult as { insertId: number }).insertId;
    const [rows] = await db.execute(
      sql`SELECT id, name, email, message, createdAt FROM contactFormSubmission WHERE id = ${insertId} LIMIT 1`
    );
    const data = rows as unknown as Array<Record<string, unknown>>;
    const r = data[0];
    return {
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      message: String(r.message),
      createdAt: new Date(r.createdAt as string),
    };
  }

  async update(
    id: number,
    input: Partial<NewContactFormSubmission>
  ): Promise<ContactFormSubmission | null> {
    // RAW SQL TEMPLATE:
    // UPDATE contactFormSubmission SET name=?, email=?, message=? WHERE id=?; (only provided fields)
    const hasName = input.name !== undefined;
    const hasEmail = input.email !== undefined;
    const hasMessage = input.message !== undefined;
    if (!hasName && !hasEmail && !hasMessage) return this.findById(id);
    if (hasName && hasEmail && hasMessage) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET name=${input.name}, email=${input.email}, message=${input.message} WHERE id=${id}`
      );
    } else if (hasName && hasEmail) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET name=${input.name}, email=${input.email} WHERE id=${id}`
      );
    } else if (hasName && hasMessage) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET name=${input.name}, message=${input.message} WHERE id=${id}`
      );
    } else if (hasEmail && hasMessage) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET email=${input.email}, message=${input.message} WHERE id=${id}`
      );
    } else if (hasName) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET name=${input.name} WHERE id=${id}`
      );
    } else if (hasEmail) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET email=${input.email} WHERE id=${id}`
      );
    } else if (hasMessage) {
      await db.execute(
        sql`UPDATE contactFormSubmission SET message=${input.message} WHERE id=${id}`
      );
    }
    return this.findById(id);
  }

  async submit(
    input: Omit<NewContactFormSubmission, "id" | "createdAt">
  ): Promise<ContactFormSubmission> {
    const submissionData: NewContactFormSubmission = {
      ...input,
    };
    return this.create(submissionData);
  }

  async findManyPaginated(
    options: PaginatedFindOptions & { search?: string }
  ): Promise<PaginatedResult<ContactFormSubmission>> {
    const { page, pageSize, search } = options;
    const offset = (page - 1) * pageSize;

    // RAW SQL TEMPLATE (search + pagination):
    // SELECT id,name,email,message,createdAt FROM contactFormSubmission cfs
    // [WHERE (LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?) OR LOWER(message) LIKE LOWER(?))]
    // ORDER BY createdAt DESC
    // LIMIT ? OFFSET ?;
    const searchFilter = search ? `%${search}%` : null;
    let whereClause = sql``;
    if (searchFilter) {
      whereClause = sql`WHERE (LOWER(cfs.name) LIKE LOWER(${searchFilter}) OR LOWER(cfs.email) LIKE LOWER(${searchFilter}) OR LOWER(cfs.message) LIKE LOWER(${searchFilter}))`;
    }
    const [rows] = await db.execute(sql`
                SELECT cfs.id, cfs.name, cfs.email, cfs.message, cfs.createdAt
                FROM contactFormSubmission cfs
                ${whereClause}
                ORDER BY cfs.createdAt DESC
                LIMIT ${pageSize} OFFSET ${offset}
            `);
    const data = (rows as unknown as Array<Record<string, unknown>>).map(
      (r) => ({
        id: Number(r.id),
        name: String(r.name),
        email: String(r.email),
        message: String(r.message),
        createdAt: new Date(r.createdAt as string),
      })
    );

    // RAW SQL TEMPLATE (count):
    // SELECT COUNT(*) AS total FROM contactFormSubmission cfs [WHERE ...];
    const [countRows] = await db.execute(sql`
                SELECT COUNT(*) AS total FROM contactFormSubmission cfs
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
      data: data as ContactFormSubmission[],
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
}

// Export a singleton instance
export const contactFormSubmissionRepository =
  new ContactFormSubmissionRepository();
