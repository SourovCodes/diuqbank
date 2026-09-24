import type {
  ContributorDetail,
  ContributorList,
  ContributorSubmission,
  ListContributorsQuery,
} from "@qb/shared";
import { and, asc, count, desc, eq, isNotNull } from "drizzle-orm";
import type { Database } from "../db/client";
import { submissions, user } from "../db/schema";
import { submissionStatusOrder } from "./common";
import {
  selectSubmissionRows,
  toContributorSubmission,
} from "./submission-rows";

/**
 * Published papers per uploader. Pending and rejected uploads are private to the
 * uploader and admins, so they are neither counted nor listed publicly.
 */
function publishedCounts(db: Database) {
  return db
    .select({
      uploaderId: submissions.uploaderId,
      published: count().as("published_count"),
    })
    .from(submissions)
    .where(
      and(
        isNotNull(submissions.uploaderId),
        eq(submissions.status, "published"),
      ),
    )
    .groupBy(submissions.uploaderId)
    .as("published_counts");
}

/** Users joined with their counts, so only users with published papers are included. */
function selectContributors(db: Database) {
  const counts = publishedCounts(db);
  const query = db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      joinedAt: user.createdAt,
      publishedCount: counts.published,
    })
    .from(user)
    .innerJoin(counts, eq(counts.uploaderId, user.id));
  return { counts, query };
}

export async function listContributors(
  db: Database,
  query: ListContributorsQuery,
): Promise<ContributorList> {
  const { counts, query: contributors } = selectContributors(db);
  const totalCounts = publishedCounts(db);

  const [rows, totals] = await Promise.all([
    contributors
      .orderBy(desc(counts.published), asc(user.name))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db
      .select({ total: count() })
      .from(user)
      .innerJoin(totalCounts, eq(totalCounts.uploaderId, user.id)),
  ]);

  return {
    items: rows.map((row) => ({
      ...row,
      joinedAt: row.joinedAt.toISOString(),
    })),
    page: query.page,
    pageSize: query.pageSize,
    total: totals[0]?.total ?? 0,
  };
}

/**
 * All submissions by one uploader, in every status: published first (newest first),
 * then pending review, then rejected. For the uploader's own account page.
 */
export async function listUploaderSubmissions(
  db: Database,
  uploaderId: string,
): Promise<ContributorSubmission[]> {
  const rows = await selectSubmissionRows(db)
    .where(eq(submissions.uploaderId, uploaderId))
    .orderBy(submissionStatusOrder, desc(submissions.createdAt));
  return rows.map(toContributorSubmission);
}

export async function getContributor(
  db: Database,
  id: string,
): Promise<ContributorDetail | null> {
  const [contributor] = await selectContributors(db)
    .query.where(eq(user.id, id))
    .limit(1);
  if (!contributor) return null;

  const rows = await selectSubmissionRows(db)
    .where(
      and(eq(submissions.uploaderId, id), eq(submissions.status, "published")),
    )
    .orderBy(desc(submissions.createdAt));
  return {
    ...contributor,
    joinedAt: contributor.joinedAt.toISOString(),
    submissions: rows.map(toContributorSubmission),
  };
}
