import type {
  ContributorDepartment,
  ContributorDetail,
  ContributorList,
  ContributorPapersQuery,
  ListContributorsQuery,
} from "@qb/shared";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  sql,
} from "drizzle-orm";
import type { Database } from "../db/client";
import { departments, questions, submissions, user } from "../db/schema";
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
      views: sql<number>`sum(${submissions.viewCount})`
        .mapWith(Number)
        .as("published_views"),
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
      viewCount: counts.views,
    })
    .from(user)
    .innerJoin(counts, eq(counts.uploaderId, user.id));
  return { counts, query };
}

/** Each uploader's published papers per department, the most first. */
async function departmentBreakdown(
  db: Database,
  uploaderIds: string[],
): Promise<Map<string, ContributorDepartment[]>> {
  const byUploader = new Map<string, ContributorDepartment[]>();
  if (uploaderIds.length === 0) return byUploader;
  const rows = await db
    .select({
      uploaderId: submissions.uploaderId,
      id: departments.id,
      name: departments.name,
      shortName: departments.shortName,
      publishedCount: count(),
    })
    .from(submissions)
    .innerJoin(questions, eq(questions.id, submissions.questionId))
    .innerJoin(departments, eq(departments.id, questions.departmentId))
    .where(
      and(
        inArray(submissions.uploaderId, uploaderIds),
        eq(submissions.status, "published"),
      ),
    )
    .groupBy(submissions.uploaderId, departments.id)
    .orderBy(desc(count()), asc(departments.name));
  for (const { uploaderId, ...department } of rows) {
    const list = byUploader.get(uploaderId!) ?? [];
    list.push(department);
    byUploader.set(uploaderId!, list);
  }
  return byUploader;
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

  const breakdown = await departmentBreakdown(
    db,
    rows.map((row) => row.id),
  );
  return {
    items: rows.map((row) => ({
      ...row,
      joinedAt: row.joinedAt.toISOString(),
      departments: breakdown.get(row.id) ?? [],
    })),
    page: query.page,
    pageSize: query.pageSize,
    total: totals[0]?.total ?? 0,
  };
}

export async function getContributor(
  db: Database,
  id: string,
  query: ContributorPapersQuery,
): Promise<ContributorDetail | null> {
  const [contributor] = await selectContributors(db)
    .query.where(eq(user.id, id))
    .limit(1);
  if (!contributor) return null;

  const published = and(
    eq(submissions.uploaderId, id),
    eq(submissions.status, "published"),
  );
  // Filed papers only have a department through their question.
  const inDepartment = query.departmentId
    ? sql`${submissions.questionId} in (select ${questions.id} from ${questions} where ${questions.departmentId} = ${query.departmentId})`
    : undefined;
  const [rows, breakdown] = await Promise.all([
    selectSubmissionRows(db)
      .where(and(published, inDepartment))
      .orderBy(desc(submissions.createdAt), desc(submissions.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    departmentBreakdown(db, [id]),
  ]);
  const departmentList = breakdown.get(id) ?? [];
  return {
    ...contributor,
    joinedAt: contributor.joinedAt.toISOString(),
    departments: departmentList,
    submissions: {
      items: rows.map(toContributorSubmission),
      page: query.page,
      pageSize: query.pageSize,
      total: query.departmentId
        ? (departmentList.find((d) => d.id === query.departmentId)
            ?.publishedCount ?? 0)
        : contributor.publishedCount,
    },
  };
}
