import type {
  ContributorDetail,
  ContributorList,
  ContributorSubmission,
  ListContributorsQuery,
} from "@qb/shared";
import { asc, count, desc, eq, isNotNull } from "drizzle-orm";
import type { Database } from "../db/client";
import { submissions, user } from "../db/schema";
import { countWhereStatus, submissionStatusOrder } from "./common";
import {
  selectSubmissionRows,
  toContributorSubmission,
} from "./submission-rows";

/** Per-status submission counts for every user who has uploaded something. */
function uploaderCounts(db: Database) {
  return db
    .select({
      uploaderId: submissions.uploaderId,
      published: countWhereStatus("published").as("published_count"),
      pendingReview: countWhereStatus("pending_review").as(
        "pending_review_count",
      ),
      rejected: countWhereStatus("rejected").as("rejected_count"),
    })
    .from(submissions)
    .where(isNotNull(submissions.uploaderId))
    .groupBy(submissions.uploaderId)
    .as("uploader_counts");
}

/** Users joined with their counts, so only users with submissions are included. */
function selectContributors(db: Database) {
  const counts = uploaderCounts(db);
  const query = db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      joinedAt: user.createdAt,
      submissionCounts: {
        published: counts.published,
        pendingReview: counts.pendingReview,
        rejected: counts.rejected,
      },
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
  const totalCounts = uploaderCounts(db);

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
 * then pending review, then rejected.
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

  return {
    ...contributor,
    joinedAt: contributor.joinedAt.toISOString(),
    submissions: await listUploaderSubmissions(db, id),
  };
}
