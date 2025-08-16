import { eq, desc, like } from "drizzle-orm";
import {
    contactFormSubmissions,
    type ContactFormSubmission,
    type NewContactFormSubmission
} from "@/db/schema";
import { db } from "@/db/drizzle";
import { BaseRepository, type PaginatedFindOptions, type PaginatedResult } from "./base-repository";

/**
 * Contact form submission-specific repository interface
 */
export interface IContactFormSubmissionRepository {
    /**
     * Get contact form submissions with pagination and search
     */
    findManyPaginated(options: PaginatedFindOptions & { search?: string }): Promise<
        PaginatedResult<ContactFormSubmission>
    >;

    /**
     * Submit a new contact form
     */
    submit(input: Omit<NewContactFormSubmission, 'id' | 'createdAt'>): Promise<ContactFormSubmission>;
}

/**
 * Contact form submission repository implementation
 */
export class ContactFormSubmissionRepository
    extends BaseRepository<ContactFormSubmission, NewContactFormSubmission, Partial<NewContactFormSubmission>>
    implements IContactFormSubmissionRepository {
    protected table = contactFormSubmissions;
    protected idColumn = contactFormSubmissions.id;

    async create(input: NewContactFormSubmission): Promise<ContactFormSubmission> {
        const [insertResult] = await db.insert(contactFormSubmissions).values(input);

        const [submission] = await db
            .select()
            .from(contactFormSubmissions)
            .where(eq(contactFormSubmissions.id, insertResult.insertId))
            .limit(1);

        return submission;
    }

    async update(id: number, input: Partial<NewContactFormSubmission>): Promise<ContactFormSubmission | null> {
        await db.update(contactFormSubmissions).set(input).where(eq(contactFormSubmissions.id, id));

        return this.findById(id);
    }

    async submit(input: Omit<NewContactFormSubmission, 'id' | 'createdAt'>): Promise<ContactFormSubmission> {
        const submissionData: NewContactFormSubmission = {
            ...input,
            // The database will automatically set createdAt due to defaultNow()
        };

        return this.create(submissionData);
    }

    async findManyPaginated(
        options: PaginatedFindOptions & { search?: string }
    ): Promise<PaginatedResult<ContactFormSubmission>> {
        const { page, pageSize, search, orderBy } = options;
        const offset = (page - 1) * pageSize;

        // Build search condition
        const searchCondition = search
            ? like(contactFormSubmissions.name, `%${search}%`)
            : undefined;

        // Execute queries in parallel
        const [submissionsResult, totalCountResult] = await Promise.all([
            db
                .select()
                .from(contactFormSubmissions)
                .where(searchCondition)
                .orderBy(orderBy ? (Array.isArray(orderBy) ? orderBy[0] : orderBy) : desc(contactFormSubmissions.createdAt))
                .limit(pageSize)
                .offset(offset),

            this.count(searchCondition),
        ]);

        const totalCount = totalCountResult;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: submissionsResult,
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
export const contactFormSubmissionRepository = new ContactFormSubmissionRepository();
